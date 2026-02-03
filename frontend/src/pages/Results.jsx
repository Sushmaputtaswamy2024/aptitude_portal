import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

export default function Results() {
  const { id } = useParams();

  const [candidate, setCandidate] = useState(null);
  const [summary, setSummary] = useState([]);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/admin/results/${id}`)
      .then((res) => {
        setCandidate(res.data.candidate);
        setSummary(res.data.summary || []);
        setScore(res.data.score || 0);
      })
      .catch(() => setError("Unable to load results"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p style={{ padding: 40 }}>Loading...</p>;
  if (error) return <p style={{ padding: 40, color: "red" }}>{error}</p>;

  const totalQuestions = summary.reduce((a, b) => a + b.total, 0);
  const totalCorrect = summary.reduce((a, b) => a + b.correct, 0);

  const percent =
    totalQuestions > 0
      ? Math.round((totalCorrect / totalQuestions) * 100)
      : 0;

  const result = percent >= 50 ? "PASSED" : "FAILED";

  return (
    <div style={page}>
      <h2>Assessment Score Card</h2>

      {candidate && (
        <div style={card}>
          <p><strong>Name:</strong> {candidate.name}</p>
          <p><strong>Email:</strong> {candidate.email}</p>
        </div>
      )}

      <div style={{ ...card, display: "flex", justifyContent: "space-between" }}>
        <div>
          <strong>Total Score</strong>
          <h3>{score} / {totalQuestions}</h3>
        </div>

        <div>
          <strong>Percentage</strong>
          <h3 style={{ color: percent >= 50 ? "green" : "red" }}>{percent}%</h3>
        </div>

        <div>
          <strong>Result</strong>
          <h3 style={{ color: percent >= 50 ? "green" : "red" }}>{result}</h3>
        </div>
      </div>

      <h3 style={{ marginTop: 30 }}>Category Breakdown</h3>

      {summary.map((c, i) => {
        const p =
          c.total > 0 ? Math.round((c.correct / c.total) * 100) : 0;

        return (
          <div key={i} style={card}>
            <div style={row}>
              <strong>{c.category}</strong>
              <span>{c.correct}/{c.total}</span>
            </div>

            <div style={bar}>
              <div
                style={{
                  ...fill,
                  width: `${p}%`,
                  background: p >= 50 ? "#2e7d32" : "#c62828",
                }}
              />
            </div>

            <small>{p}% correct</small>
          </div>
        );
      })}
    </div>
  );
}

/* ===== styles ===== */

const page = {
  maxWidth: 900,
  margin: "auto",
  padding: 40,
};

const card = {
  background: "#fff",
  padding: 20,
  marginTop: 15,
  borderRadius: 10,
  boxShadow: "0 4px 12px rgba(0,0,0,.08)",
};

const row = {
  display: "flex",
  justifyContent: "space-between",
};

const bar = {
  height: 8,
  background: "#ddd",
  borderRadius: 5,
  marginTop: 8,
};

const fill = {
  height: "100%",
  borderRadius: 5,
};
