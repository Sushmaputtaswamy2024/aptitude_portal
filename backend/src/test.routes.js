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

    // Expired
    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
      return res.status(410).json({ message: "Test link expired" });
    }

    // Already submitted
    if (invite.status === "SUBMITTED") {
      return res.status(403).json({ message: "Test already submitted" });
    }

    /* ===== Assign questions once ===== */
    const existing = await pool.query(
      "SELECT 1 FROM test_questions WHERE invitation_id = $1 LIMIT 1",
      [invite.id]
    );

    if (existing.rows.length === 0) {
      const qs = await pool.query(
        "SELECT id FROM questions ORDER BY RANDOM() LIMIT 30"
      );

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

    /* ===== Load assigned questions ===== */
    const result = await pool.query(
      `
      SELECT
        q.id,
        q.question,
        q.options
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
    console.error("❌ START TEST ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= SUBMIT TEST ================= */
router.post("/submit", async (req, res) => {
  try {
    const { token, answers } = req.body;

    if (!token || !answers) {
      return res.status(400).json({ message: "Token and answers required" });
    }

    const inviteRes = await pool.query(
      "SELECT * FROM invitations WHERE token=$1",
      [token]
    );

    if (inviteRes.rows.length === 0) {
      return res.status(400).json({ message: "Invalid token" });
    }

    const invite = inviteRes.rows[0];

    if (invite.status === "SUBMITTED") {
      return res.status(403).json({ message: "Already submitted" });
    }

    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
      return res.status(410).json({ message: "Expired" });
    }

    /* ===== Calculate score ===== */
    let score = 0;

    for (const qId of Object.keys(answers)) {
      const q = await pool.query(
        "SELECT correct_answer FROM questions WHERE id=$1",
        [qId]
      );

      if (
        q.rows.length &&
        q.rows[0].correct_answer === answers[qId]
      ) {
        score++;
      }
    }

    /* ===== Store result ===== */
    await pool.query(
      `
      INSERT INTO test_results (invitation_id, answers, score)
      VALUES ($1,$2,$3)
      `,
      [invite.id, JSON.stringify(answers), score]
    );

    await pool.query(
      "UPDATE invitations SET status='SUBMITTED', submitted_at=NOW() WHERE id=$1",
      [invite.id]
    );

    res.json({
      message: "Test submitted",
      score,
    });
  } catch (err) {
    console.error("🔥 SUBMIT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
