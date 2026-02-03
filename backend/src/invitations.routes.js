const express = require("express");
const router = express.Router();
const pool = require("./db");
const sendInviteEmail = require("./mailer");
const { v4: uuidv4 } = require("uuid");

router.post("/", async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Name and email required" });
    }

    /* ================= FIND OR CREATE CANDIDATE ================= */
    const existing = await pool.query(
      "SELECT id FROM candidates WHERE email=$1",
      [email]
    );

    let candidateId;

    if (existing.rows.length) {
      candidateId = existing.rows[0].id;
    } else {
      const created = await pool.query(
        "INSERT INTO candidates (name,email) VALUES ($1,$2) RETURNING id",
        [name, email]
      );
      candidateId = created.rows[0].id;
    }

    /* ================= DELETE OLD ACTIVE INVITES ================= */
    await pool.query(
      `
      DELETE FROM invitations
      WHERE candidate_id=$1
      AND status IN ('INVITED','VERIFIED','STARTED')
      `,
      [candidateId]
    );

    /* ================= CREATE NEW INVITE ================= */
    const token = uuidv4();

    await pool.query(
      `
      INSERT INTO invitations (
        candidate_id,
        token,
        status,
        invited_at,
        expires_at
      )
      VALUES ($1,$2,'INVITED',NOW(),NOW() + INTERVAL '24 hours')
      `,
      [candidateId, token]
    );

    const link = `${process.env.FRONTEND_URL}/verify?token=${token}`;
    await sendInviteEmail(email, link);

    res.json({ message: "Invitation sent successfully" });
  } catch (err) {
    console.error("INVITE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
