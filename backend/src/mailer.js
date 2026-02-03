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
  try {
    console.log("📧 Sending mail to:", to);
    console.log("📤 Using sender:", process.env.EMAIL_USER);

    const info = await transporter.sendMail({
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
          <a href="${link}" style="
              background:#1f4fd8;
              color:#ffffff;
              padding:12px 20px;
              text-decoration:none;
              border-radius:6px;
              font-weight:600;
              display:inline-block;
          ">
            Start Aptitude Test
          </a>
        </p>

        <hr style="margin:24px 0;" />

        <h4 style="color:#374151;">Important Instructions</h4>
        <ul>
          <li>This test link is valid for 24 hours.</li>
          <li>Please complete the assessment in one sitting.</li>
          <li>Ensure stable internet connection.</li>
        </ul>

        <p>
          If you face any issues, please contact the HR team.
        </p>

        <p>
          Best regards,<br/>
          <strong>VIndia Infrasec Pvt Ltd</strong>
        </p>
      </div>
      `,
    });

    console.log("✅ Mail sent successfully:", info.messageId);
  } catch (err) {
    console.error("❌ MAIL FAILED:", err);
    throw err;
  }
}

module.exports = sendInviteEmail;
