const express = require("express");
const router = express.Router();
const pool = require("./db");

router.get("/", async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ message: "Token is required" });
  }

  try {
    const inviteRes = await pool.query(
      `
      SELECT *
      FROM invitations
      WHERE token=$1
      ORDER BY invited_at DESC
      LIMIT 1
      `,
      [token]
    );

    if (!inviteRes.rows.length) {
      return res.status(400).json({ message: "Invalid verification link" });
    }

    const invite = inviteRes.rows[0];

    // expired
    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
      return res.status(410).json({
        message: "Verification link expired",
        expired: true,
      });
    }

    // already submitted
    if (invite.status === "SUBMITTED") {
      return res.status(403).json({
        message: "Test already completed",
      });
    }

    // ✅ mark verified (NO verified_at column)
    if (invite.status === "INVITED") {
      await pool.query(
        `
        UPDATE invitations
        SET status='VERIFIED'
        WHERE id=$1
        `,
        [invite.id]
      );
    }

    res.json({ valid: true });
  } catch (err) {
    console.error("VERIFY ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
