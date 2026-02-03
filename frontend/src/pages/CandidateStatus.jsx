import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function CandidateStatus() {
  const [data, setData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/admin/status").then((res) => {
      setData(res.data || []);
    });
  }, []);

  return (
    <>
      <h2>Candidate Status</h2>
      <p style={{ marginTop: 6 }}>
        Track candidate progress through the assessment process.
      </p>

      <div style={{ marginTop: 30 }}>
        {data.map((c) => (
          <div key={c.candidate_id} style={cardStyle}>
            <div style={cardHeader}>
              <strong>{c.name}</strong>
              <StatusBadge status={c.status} />
            </div>

            <div style={cardRow}>
              <span>Email</span>
              <span>{c.email}</span>
            </div>

            <div style={cardRow}>
              <span>Last Updated</span>
              <span>{formatTime(c.last_updated)}</span>
            </div>

            {/* ✅ VIEW RESULT ONLY WHEN SUBMITTED */}
            {c.status === "SUBMITTED" && (
              <div style={{ marginTop: 14, textAlign: "right" }}>
                <button
                  style={viewBtn}
                  onClick={() =>
                    navigate(`/admin/results/${c.candidate_id}`)
                  }
                >
                  View Result
                </button>
              </div>
            )}
          </div>
        ))}

        {data.length === 0 && (
          <div style={emptyStyle}>No candidates found</div>
        )}
      </div>
    </>
  );
}

/* ================= STATUS BADGE ================= */

function StatusBadge({ status }) {
  const map = {
    INVITED: { text: "Invited", color: "#6b7280" },
    VERIFIED: { text: "Email Verified", color: "#2563eb" },
    STARTED: { text: "Test Started", color: "#f59e0b" },
    SUBMITTED: { text: "Test Completed", color: "#2e7d32" },
    EXPIRED: { text: "Expired", color: "#c62828" },
  };

  const badge = map[status] || {
    text: status,
    color: "#6b7280",
  };

  return (
    <span
      style={{
        padding: "6px 12px",
        borderRadius: 12,
        fontSize: 13,
        fontWeight: 500,
        color: "#ffffff",
        background: badge.color,
        whiteSpace: "nowrap",
      }}
    >
      {badge.text}
    </span>
  );
}

/* ================= HELPERS ================= */

function formatTime(time) {
  if (!time) return "-";

  return new Date(time).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ================= STYLES ================= */

const cardStyle = {
  background: "#ffffff",
  borderRadius: 12,
  padding: 18,
  marginBottom: 16,
  boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
};

const cardHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 12,
};

const cardRow = {
  display: "flex",
  justifyContent: "space-between",
  fontSize: 14,
  marginTop: 6,
  color: "#4b5563",
};

const viewBtn = {
  padding: "8px 16px",
  background: "#1f4fd8",
  color: "#ffffff",
  border: "none",
  borderRadius: 6,
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
};

const emptyStyle = {
  textAlign: "center",
  padding: 20,
  color: "#6b7280",
};
