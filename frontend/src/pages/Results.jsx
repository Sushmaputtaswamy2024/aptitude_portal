import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

export default function Results() {
  const { id } = useParams();

  const [candidate, setCandidate] = useState(null);
  const [summary, setSummary] = useState([]);

  /* ================= LOAD RESULT ================= */
  useEffect(() => {
    api.get(`/admin/results/${id}`).then((res) => {
      setCandidate(res.data.candidate || null);
      setSummary(res.data.summary || []);
    });
  }, [id]);

  /* ================= CALCULATIONS ================= */
  const totalCorrect = summary.reduce((sum, c) => sum + c.correct, 0);
  const totalQuestions = summary.reduce((sum, c) => sum + c.total, 0);

  const percentage =
    totalQuestions > 0
      ? ((totalCorrect / totalQuestions) * 100).toFixed(1)
      : 0;

  /* ================= RENDER ================= */
  return (
    <>
      <h2>Candidate Results</h2>
      <p style={{ marginTop: 6, color: "#6b7280" }}>
        Category-wise performance breakdown
      </p>

      {/* ================= CANDIDATE INFO ================= */}
      {candidate && (
        <div style={infoCard}>
          <div>
            <strong>Name</strong>
            <div>{candidate.name}</div>
          </div>

          <div>
            <strong>Email</strong>
            <div>{candidate.email}</div>
          </div>
        </div>
      )}

      {/* ================= OVERALL SCORE ================= */}
      <div style={overallCard}>
        <div>
          <strong>Total Score</strong>
          <div style={{ fontSize: 22, fontWeight: 600 }}>
            {totalCorrect} / {totalQuestions}
          </div>
        </div>

        <div>
          <strong>Percentage</strong>
          <div
            style={{
              fontSize: 22,
              fontWeight: 600,
              color: percentage >= 60 ? "#2e7d32" : "#c62828",
            }}
          >
            {percentage}%
          </div>
        </div>
      </div>

      {/* ================= CATEGORY WISE ================= */}
      <h3 style={{ marginTop: 30 }}>Category-wise Performance</h3>

      <div style={{ marginTop: 16 }}>
        {summary.map((item, index) => {
          const catPercent =
            item.total > 0
              ? ((item.correct / item.total) * 100).toFixed(1)
              : 0;

          return (
            <div key={index} style={categoryCard}>
              <div style={categoryHeader}>
                <strong>{item.category}</strong>
                <span style={scoreBadge}>
                  {item.correct} / {item.total}
                </span>
              </div>

              <div style={progressBar}>
                <div
                  style={{
                    ...progressFill,
                    width: `${catPercent}%`,
                    background:
                      catPercent >= 60 ? "#2e7d32" : "#c62828",
                  }}
                />
              </div>

              <small style={{ color: "#6b7280" }}>
                {catPercent}% correct
              </small>
            </div>
          );
        })}

        {summary.length === 0 && (
          <div style={emptyStyle}>No results available</div>
        )}
      </div>
    </>
  );
}

/* ================= STYLES ================= */

const infoCard = {
  display: "flex",
  gap: 40,
  background: "#ffffff",
  padding: 18,
  borderRadius: 12,
  marginTop: 20,
  boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
};

const overallCard = {
  display: "flex",
  justifyContent: "space-between",
  background: "#f9fafb",
  padding: 20,
  borderRadius: 12,
  marginTop: 20,
  boxShadow: "0 4px 14px rgba(0,0,0,0.05)",
};

const categoryCard = {
  background: "#ffffff",
  borderRadius: 12,
  padding: 16,
  marginBottom: 14,
  boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
};

const categoryHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 10,
};

const scoreBadge = {
  background: "#e5e7eb",
  padding: "4px 10px",
  borderRadius: 10,
  fontSize: 13,
  fontWeight: 500,
};

const progressBar = {
  width: "100%",
  height: 8,
  background: "#e5e7eb",
  borderRadius: 6,
  overflow: "hidden",
  marginBottom: 6,
};

const progressFill = {
  height: "100%",
  borderRadius: 6,
};

const emptyStyle = {
  textAlign: "center",
  padding: 20,
  color: "#6b7280",
};
