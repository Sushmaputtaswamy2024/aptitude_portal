const express = require("express");
const router = express.Router();
const pool = require("./db");

/* =====================================================
   ADMIN: CANDIDATE STATUS LIST
   Used by: CandidateStatus.jsx
===================================================== */
router.get("/status", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        c.id AS candidate_id,
        c.name,
        c.email,
        i.status,
        COALESCE(i.submitted_at, i.started_at, i.created_at) AS last_updated
      FROM invitations i
      JOIN candidates c ON c.id = i.candidate_id
      ORDER BY last_updated DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("ADMIN STATUS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =====================================================
   ADMIN: VIEW RESULTS (CATEGORY-WISE)
   Used by: Results.jsx
===================================================== */
router.get("/results/:candidateId", async (req, res) => {
  try {
    const { candidateId } = req.params;

    /* ---------- Candidate Info ---------- */
    const candidateRes = await pool.query(
      `
      SELECT id, name, email
      FROM candidates
      WHERE id = $1
      `,
      [candidateId]
    );

    if (candidateRes.rows.length === 0) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    /* ---------- Test Result ---------- */
    const resultRes = await pool.query(
      `
      SELECT
        tr.score,
        tr.percentage,
        tr.category_score
      FROM test_results tr
      JOIN invitations i ON i.id = tr.invitation_id
      WHERE i.candidate_id = $1
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

    /* ---------- Convert JSON → Array ---------- */
    const summary = Object.keys(categoryScore).map((category) => ({
      category,
      correct: categoryScore[category].correct,
      total: categoryScore[category].total,
    }));

    res.json({
      candidate: candidateRes.rows[0],
      summary,
    });
  } catch (err) {
    console.error("ADMIN RESULT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
