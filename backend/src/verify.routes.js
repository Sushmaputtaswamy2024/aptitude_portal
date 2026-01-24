const express = require("express");
const router = express.Router();
const pool = require("./db");

/* ================= VERIFY INVITATION ================= */
router.get("/", async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ message: "Token is required" });
  }

  try {
    const inviteRes = await pool.query(
      "SELECT * FROM invitations WHERE token = $1",
      [token]
    );

    if (inviteRes.rows.length === 0) {
      return res.status(400).json({ message: "Invalid verification link" });
    }

    const invite = inviteRes.rows[0];

    // Expiry check
    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
      return res.status(410).json({
        message: "Verification link expired",
        expired: true,
      });
    }

    // Already verified or submitted
    if (invite.status === "VERIFIED" || invite.status === "STARTED") {
      return res.json({ valid: true });
    }

    if (invite.status === "SUBMITTED") {
      return res.status(403).json({
        message: "Test already submitted",
      });
    }

    // ✅ Mark invitation as VERIFIED
    await pool.query(
      "UPDATE invitations SET status = 'VERIFIED' WHERE id = $1",
      [invite.id]
    );

    res.json({ valid: true });
  } catch (err) {
    console.error("VERIFY ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
