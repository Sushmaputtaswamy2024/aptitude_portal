const express = require("express");
const router = express.Router();
const pool = require("./db");

/* ================= START TEST ================= */
router.get("/start", async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ message: "Token required" });
    }

    const inviteRes = await pool.query(
      "SELECT * FROM invitations WHERE token = $1",
      [token]
    );

    if (inviteRes.rows.length === 0) {
      return res.status(404).json({ message: "Invalid test link" });
    }

    const invite = inviteRes.rows[0];

    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
      return res.status(410).json({ message: "Test link expired" });
    }

    if (invite.status === "SUBMITTED") {
      return res.status(403).json({ message: "Test already submitted" });
    }

    const existing = await pool.query(
      "SELECT 1 FROM test_questions WHERE invitation_id = $1",
      [invite.id]
    );

    if (existing.rows.length === 0) {
      const qs = await pool.query(`
        SELECT id FROM questions
        ORDER BY RANDOM()
        LIMIT 50
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
      SELECT
        q.id,
        q.question,
        q.options::json AS options
      FROM test_questions tq
      JOIN questions q ON q.id = tq.question_id
      WHERE tq.invitation_id = $1
      ORDER BY tq.id
      `,
      [invite.id]
    );

    res.json({
      duration: 30 * 60,
      questions: result.rows,
    });
  } catch (err) {
    console.error("START TEST ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= SUBMIT TEST ================= */
router.post("/submit", async (req, res) => {
  try {
    const { token, answers } = req.body;

    if (!token || typeof answers !== "object") {
      return res.status(400).json({ message: "Token and answers required" });
    }

    const inviteRes = await pool.query(
      "SELECT * FROM invitations WHERE token = $1",
      [token]
    );

    if (inviteRes.rows.length === 0) {
      return res.status(400).json({ message: "Invalid test token" });
    }

    const invite = inviteRes.rows[0];

    if (invite.status === "SUBMITTED") {
      return res.status(403).json({ message: "Test already submitted" });
    }

    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
      return res.status(410).json({ message: "Test link expired" });
    }

    /* ================= CATEGORY SCORE LOGIC ================= */
    let totalScore = 0;
    let categoryScore = {};
    let totalQuestions = 0;

    const qRes = await pool.query(
      `
      SELECT q.id, q.correct_answer, q.category
      FROM test_questions tq
      JOIN questions q ON q.id = tq.question_id
      WHERE tq.invitation_id = $1
      `,
      [invite.id]
    );

    for (const q of qRes.rows) {
      totalQuestions++;

      if (!categoryScore[q.category]) {
        categoryScore[q.category] = { correct: 0, total: 0 };
      }

      categoryScore[q.category].total++;

      if (answers[q.id] && answers[q.id] === q.correct_answer) {
        totalScore++;
        categoryScore[q.category].correct++;
      }
    }

    const percentage = Math.round((totalScore / totalQuestions) * 100);

    await pool.query(
      `
      INSERT INTO test_results
        (invitation_id, answers, score, percentage, category_score)
      VALUES
        ($1, $2, $3, $4, $5)
      `,
      [
        invite.id,
        JSON.stringify(answers),
        totalScore,
        percentage,
        JSON.stringify(categoryScore),
      ]
    );

    await pool.query(
      "UPDATE invitations SET status='SUBMITTED', submitted_at=NOW() WHERE id=$1",
      [invite.id]
    );

    res.json({
      message: "Test submitted successfully",
      score: totalScore,
      percentage,
      categoryScore,
    });
  } catch (err) {
    console.error("SUBMIT TEST ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
