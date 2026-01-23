const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send Aptitude Test Invitation Email
 */
async function sendInviteEmail(to, link) {
  await transporter.sendMail({
    from: `"VIndia Infrasec Pvt Ltd" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Aptitude Test Invitation – Action Required",
    html: `
      <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
        <h2 style="color:#1f4fd8;">Aptitude Test Invitation</h2>

        <p>
          You have been invited to participate in an <strong>online aptitude assessment</strong>
          conducted by <strong>VIndia Infrasec Pvt Ltd</strong>.
        </p>

        <p>
          Please click the button below to verify your email and begin the test:
        </p>

        <p style="margin: 24px 0;">
          <a
            href="${link}"
            style="
              background:#1f4fd8;
              color:#ffffff;
              padding:12px 20px;
              text-decoration:none;
              border-radius:6px;
              font-weight:600;
              display:inline-block;
            "
          >
            Start Aptitude Test
          </a>
        </p>

        <hr style="margin:24px 0;" />

        <h4 style="color:#b91c1c;">⚠ Important Instructions</h4>
        <ul>
          <li>This test link is <strong>valid for 24 hours only</strong>.</li>
          <li>The test must be completed in <strong>one sitting</strong>.</li>
          <li>
            <strong>Do not refresh, switch tabs, or exit fullscreen</strong>
            during the test — doing so may auto-submit your assessment.
          </li>
          <li>
            This link is <strong>strictly personal</strong>.
            Sharing the link will invalidate your attempt.
          </li>
        </ul>

        <p style="margin-top: 20px;">
          Ensure you have a stable internet connection and sufficient time before starting.
        </p>

        <p style="margin-top: 24px;">
          Best regards,<br />
          <strong>VIndia Infrasec Pvt Ltd</strong>
        </p>

        <p style="font-size:12px; color:#6b7280; margin-top: 24px;">
          This is an automated email. Please do not reply.
        </p>
      </div>
    `,
  });
}

module.exports = sendInviteEmail;
