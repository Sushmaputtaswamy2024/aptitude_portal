const express = require("express");
const router = express.Router();
const pool = require("./db");

/**
 * GET /api/verify
 * Email verification
 */
router.get("/", async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ message: "Token is required" });
  }

  try {
    const inviteRes = await pool.query(
      "SELECT * FROM invitations WHERE token=$1",
      [token]
    );

    if (inviteRes.rows.length === 0) {
      return res.status(400).json({ message: "Invalid verification link" });
    }

    const invite = inviteRes.rows[0];

    // 🔒 Expired
    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
      return res.status(410).json({
        message: "Verification link expired",
        expired: true,
      });
    }

    // Already submitted
    if (invite.status === "SUBMITTED") {
      return res.json({ message: "Test already submitted" });
    }

    // Mark verified timestamp only
    await pool.query(
      "UPDATE invitations SET verified_at = NOW() WHERE token=$1",
      [token]
    );

    res.json({ valid: true });
  } catch (err) {
    console.error("VERIFY ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
