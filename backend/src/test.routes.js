const express = require("express");
const router = express.Router();
const pool = require("./db");

const TEST_DURATION = 30 * 60; // 30 minutes

/* ================= START TEST ================= */
router.get("/start", async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: "Token required" });
    }

    // 1. Fetch invitation
    const inviteRes = await pool.query(
      "SELECT * FROM invitations WHERE token = $1",
      [token]
    );

    if (inviteRes.rows.length === 0) {
      return res.status(404).json({ message: "Invalid test link" });
    }

    const invite = inviteRes.rows[0];

    // 2. Expiry check
    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
      return res.status(410).json({ message: "Test link expired" });
    }

    // 3. Already submitted
    if (invite.status === "SUBMITTED") {
      return res.status(403).json({ message: "Test already submitted" });
    }

    // 4. Generate question order ONCE per candidate
    let questionOrder = invite.question_order;

    if (!questionOrder || questionOrder.length === 0) {
      const qIdsRes = await pool.query(
        "SELECT id FROM questions ORDER BY RANDOM() LIMIT 50"
      );

      questionOrder = qIdsRes.rows.map(q => q.id);

      await pool.query(
        `
        UPDATE invitations
        SET question_order = $1,
            status = 'STARTED'
        WHERE id = $2
        `,
        [questionOrder, invite.id]
      );
    }

    // 5. Fetch questions
    const qData = await pool.query(
      `
      SELECT id, question, options
      FROM questions
      WHERE id = ANY($1)
      `,
      [questionOrder]
    );

    // 6. Preserve exact order
    const questionMap = {};
    qData.rows.forEach(q => {
      questionMap[q.id] = q;
    });

    const questions = questionOrder.map(id => {
      const q = questionMap[id];
      return {
        id: q.id,
        question: q.question,
        options: {
          A: q.options[0],
          B: q.options[1],
          C: q.options[2],
          D: q.options[3],
        },
      };
    });

    res.json({
      duration: TEST_DURATION,
      questions,
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

    if (!token || typeof answers !== "object") {
      return res.status(400).json({ message: "Token and answers required" });
    }

    // 1. Fetch invitation
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

    // 2. Fetch correct answers
    const qRes = await pool.query(
      `
      SELECT id, correct_answer, category
      FROM questions
      WHERE id = ANY($1)
      `,
      [invite.question_order]
    );

    let score = 0;
    const categoryScore = {};

    for (const q of qRes.rows) {
      if (!categoryScore[q.category]) {
        categoryScore[q.category] = { correct: 0, total: 0 };
      }

      categoryScore[q.category].total++;

      if (answers[q.id] === q.correct_answer) {
        score++;
        categoryScore[q.category].correct++;
      }
    }

    // 3. Save results
    await pool.query(
      `
      INSERT INTO test_results
        (candidate_id, answers, score, category_score)
      VALUES
        ($1, $2::jsonb, $3, $4::jsonb)
      `,
      [
        invite.candidate_id,
        JSON.stringify(answers),
        score,
        JSON.stringify(categoryScore),
      ]
    );

    // 4. Mark invitation submitted
    await pool.query(
      "UPDATE invitations SET status='SUBMITTED' WHERE id=$1",
      [invite.id]
    );

    res.json({
      message: "Test submitted successfully",
      score,
      categoryScore,
    });
  } catch (err) {
    console.error("🔥 SUBMIT TEST ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
