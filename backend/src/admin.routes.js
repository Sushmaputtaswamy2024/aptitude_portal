const express = require("express");
const router = express.Router();
const pool = require("./db");

/* ================= CANDIDATE STATUS ================= */
router.get("/status", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT ON (c.id)
        c.id AS candidate_id,
        c.name,
        c.email,
        i.status,
        i.invited_at AS last_updated
      FROM candidates c
      JOIN invitations i ON i.candidate_id = c.id
      ORDER BY c.id, i.invited_at DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("ADMIN STATUS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= RESULT DETAILS ================= */
router.get("/results/:candidateId", async (req, res) => {
  try {
    const { candidateId } = req.params;

    const candidateRes = await pool.query(
      "SELECT id, name, email FROM candidates WHERE id=$1",
      [candidateId]
    );

    if (candidateRes.rows.length === 0) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    const resultRes = await pool.query(
      `
      SELECT score, category_score
      FROM test_results
      WHERE candidate_id=$1
      ORDER BY submitted_at DESC
      LIMIT 1
      `,
      [candidateId]
    );

    if (resultRes.rows.length === 0) {
      return res.json({
        candidate: candidateRes.rows[0],
        summary: [],
      });
    }

    const categoryScore = resultRes.rows[0].category_score || {};
    const summary = Object.entries(categoryScore).map(
      ([category, val]) => ({
        category,
        correct: val.correct,
        total: val.total,
      })
    );

    res.json({
      candidate: candidateRes.rows[0],
      summary,
    });
  } catch (err) {
    console.error("ADMIN RESULTS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
