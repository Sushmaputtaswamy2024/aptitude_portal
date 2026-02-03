const express = require("express");
const router = express.Router();
const pool = require("./db");

/* ================= LATEST STATUS PER CANDIDATE ================= */
router.get("/status", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT ON (c.id)
        c.id AS candidate_id,
        c.name,
        c.email,
        i.status,
        COALESCE(i.submitted_at,i.invited_at) AS last_updated
      FROM candidates c
      JOIN invitations i ON i.candidate_id=c.id
      ORDER BY c.id, COALESCE(i.submitted_at,i.invited_at) DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("ADMIN STATUS ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ================= LATEST RESULT ================= */
router.get("/results/:candidateId", async (req, res) => {
  try {
    const { candidateId } = req.params;

    const candidateRes = await pool.query(
      "SELECT id,name,email FROM candidates WHERE id=$1",
      [candidateId]
    );

    if (!candidateRes.rows.length)
      return res.status(404).json({ message: "Candidate not found" });

    const resultRes = await pool.query(
      `
      SELECT score, category_score
      FROM test_results
      WHERE candidate_id=$1
      ORDER BY created_at DESC
      LIMIT 1
      `,
      [candidateId]
    );

    if (!resultRes.rows.length) {
      return res.json({
        candidate: candidateRes.rows[0],
        score: 0,
        summary: [],
      });
    }

    let categoryScore = resultRes.rows[0].category_score;

    if (typeof categoryScore === "string") {
      categoryScore = JSON.parse(categoryScore);
    }

    const summary = Object.entries(categoryScore).map(([k, v]) => ({
      category: k,
      correct: v.correct,
      total: v.total,
    }));

    res.json({
      candidate: candidateRes.rows[0],
      score: resultRes.rows[0].score,
      summary,
    });
  } catch (err) {
    console.error("ADMIN RESULTS ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
