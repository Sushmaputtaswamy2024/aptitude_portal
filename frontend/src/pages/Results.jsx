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
    if (!id) return;

    setLoading(true);

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

  /* ================= CALCULATIONS ================= */

  const totalQuestions = summary.reduce((s, c) => s + c.total, 0);
  const totalCorrect = summary.reduce((s, c) => s + c.correct, 0);

  const overallPercent =
    totalQuestions > 0
      ? Math.round((totalCorrect / totalQuestions) * 100)
      : 0;

  const result = overallPercent >= 50 ? "Passed" : "Failed";

  // For now fixed (later we can fetch from DB)
  const maxScore = totalQuestions;
  const totalTimeTaken = "—"; // optional: later from DB

  return (
    <div style={page}>
      <h2>Assessment Score Card</h2>

      {candidate && (
        <p style={{ marginTop: 20 }}>
          <strong>Name :</strong> {candidate.name}
        </p>
      )}

      <div style={{ marginTop: 25 }}>
        {summary.map((c, i) => {
          const pct =
            c.total > 0 ? Math.round((c.correct / c.total) * 100) : 0;

          return (
            <p key={i}>
              Total percentage for {c.category} : {pct}%
            </p>
          );
        })}
      </div>

      <p style={{ marginTop: 15 }}>
        <strong>Result :</strong> {result}
      </p>

      <p>
        <strong>Maximum score :</strong> {maxScore}
      </p>

      <p>
        <strong>Total scored :</strong> {score}
      </p>

      <p>
        <strong>Total time taken :</strong> {totalTimeTaken}
      </p>
    </div>
  );
}

/* ================= STYLES ================= */

const page = {
  padding: 50,
  maxWidth: 700,
  margin: "0 auto",
  fontSize: 16,
  lineHeight: "1.8",
};
