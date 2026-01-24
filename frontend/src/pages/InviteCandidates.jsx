import { useState } from "react";
import api from "../services/api";
console.log("INVITATION PAGE — FRONTEND VERSION 24 JAN — LIVE");
export default function InviteCandidates() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const sendInvite = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!name.trim() || !email.trim()) {
      setMessage("Please enter candidate name and email.");
      return;
    }

    try {
      setLoading(true);

      await api.post("/invitations", {
        name: name.trim(),
        email: email.trim(),
      });

      setMessage(`Invitation sent successfully to ${email}`);
      setName("");
      setEmail("");
    } catch (err) {
      setMessage(
        err?.response?.data?.message ||
          "Failed to send invitation. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <p style={{ color: "red", fontWeight: "bold" }}>
  FRONTEND UPDATED — INVITATION PAGE — 24 JAN
</p>

      <h2>Invite Candidates</h2>
      <p style={{ marginTop: 6 }}>
        Send aptitude test invitations to candidates via email.
      </p>

      {/* ===== CARD ===== */}
      <div style={cardStyle}>
        <form onSubmit={sendInvite}>
          <div style={fieldGroup}>
            <label style={labelStyle}>Candidate Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter candidate full name"
              style={inputStyle}
            />
          </div>

          <div style={fieldGroup}>
            <label style={labelStyle}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="candidate@example.com"
              style={inputStyle}
            />
          </div>

          {message && (
            <p
              style={{
                marginTop: 10,
                fontSize: 14,
                color: message.includes("successfully")
                  ? "#2e7d32"
                  : "#b91c1c",
              }}
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              ...buttonStyle,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Sending Invitation..." : "Send Invitation"}
          </button>
        </form>
      </div>
    </>
  );
}

/* ================= STYLES ================= */

const cardStyle = {
  marginTop: 30,
  maxWidth: 520,
  background: "#ffffff",
  padding: 24,
  borderRadius: 12,
  boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
};

const fieldGroup = {
  marginBottom: 20,
};

const labelStyle = {
  display: "block",
  marginBottom: 6,
  fontSize: 14,
  fontWeight: 500,
};

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #d1d5db",
  borderRadius: 4,
  fontSize: 14,
};

const buttonStyle = {
  marginTop: 20,
  width: "100%",
  padding: "12px",
  background: "#1f4fd8",
  color: "#ffffff",
  border: "none",
  borderRadius: 6,
  fontSize: 15,
  fontWeight: 600,
};
