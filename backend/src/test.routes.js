const express = require("express");
const router = express.Router();
const pool = require("./db");

/* ================= START TEST ================= */
router.get("/start", async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) return res.status(400).json({ message: "Token required" });

    // ✅ Always take latest matching invitation
    const inviteRes = await pool.query(
      `
      SELECT i.*, c.id AS candidate_id
      FROM invitations i
      JOIN candidates c ON c.id = i.candidate_id
      WHERE i.token=$1
      ORDER BY i.invited_at DESC
      LIMIT 1
      `,
      [token]
    );

    if (!inviteRes.rows.length)
      return res.status(404).json({ message: "Invalid test link" });

    const invite = inviteRes.rows[0];

    if (invite.expires_at && new Date(invite.expires_at) < new Date())
      return res.status(410).json({ message: "Link expired" });

    if (invite.status === "SUBMITTED")
      return res.status(403).json({ message: "Already submitted" });

    /* ===== Assign questions ONCE ===== */
    const existing = await pool.query(
      "SELECT 1 FROM test_questions WHERE invitation_id=$1 LIMIT 1",
      [invite.id]
    );

    if (existing.rows.length === 0) {
      const qs = await pool.query(`
        SELECT id FROM questions ORDER BY RANDOM() LIMIT 50
      `);

      for (const q of qs.rows) {
        await pool.query(
          "INSERT INTO test_questions (invitation_id, question_id) VALUES ($1,$2)",
          [invite.id, q.id]
        );
      }

      await pool.query(
        "UPDATE invitations SET status='STARTED', started_at=NOW() WHERE id=$1",
        [invite.id]
      );
    }

    const result = await pool.query(
      `
      SELECT q.id, q.question, q.options, q.category
      FROM test_questions tq
      JOIN questions q ON q.id = tq.question_id
      WHERE tq.invitation_id = $1
      ORDER BY tq.id
      `,
      [invite.id]
    );

    res.json({
      candidateId: invite.candidate_id,
      duration: 50 * 60,
      total: result.rows.length,
      questions: result.rows,
    });
  } catch (err) {
    console.error("START TEST ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ================= SUBMIT ================= */
router.post("/submit", async (req, res) => {
  try {
    const { token, answers } = req.body;

    if (!token || !answers)
      return res.status(400).json({ message: "Token + answers required" });

    const inviteRes = await pool.query(
      `
      SELECT i.*, c.id AS candidate_id
      FROM invitations i
      JOIN candidates c ON c.id = i.candidate_id
      WHERE i.token=$1
      ORDER BY i.invited_at DESC
      LIMIT 1
      `,
      [token]
    );

    if (!inviteRes.rows.length)
      return res.status(400).json({ message: "Invalid token" });

    const invite = inviteRes.rows[0];

    if (invite.status === "SUBMITTED")
      return res.status(403).json({ message: "Already submitted" });

    let totalScore = 0;
    const categoryScore = {};

    for (const qid of Object.keys(answers)) {
      const q = await pool.query(
        "SELECT correct_answer, category FROM questions WHERE id=$1",
        [qid]
      );

      if (!q.rows.length) continue;

      const { correct_answer, category } = q.rows[0];

      if (!categoryScore[category])
        categoryScore[category] = { correct: 0, total: 0 };

      categoryScore[category].total++;

      if (correct_answer === answers[qid]) {
        categoryScore[category].correct++;
        totalScore++;
      }
    }

    await pool.query(
      `
      INSERT INTO test_results (candidate_id, invitation_id, answers, score, category_score)
      VALUES ($1,$2,$3,$4,$5)
      `,
      [
        invite.candidate_id,
        invite.id,
        JSON.stringify(answers),
        totalScore,
        JSON.stringify(categoryScore),
      ]
    );

    await pool.query(
      "UPDATE invitations SET status='SUBMITTED', submitted_at=NOW() WHERE id=$1",
      [invite.id]
    );

    res.json({ message: "Submitted", score: totalScore });
  } catch (err) {
    console.error("SUBMIT ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
