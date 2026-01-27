import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Test() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);

  const submittedRef = useRef(false);
  const timerRef = useRef(null);

  /* ================= LOAD TEST ================= */
  useEffect(() => {
    if (!token) {
      alert("Invalid test link");
      navigate("/");
      return;
    }

    api
      .get(`/test/start?token=${token}`)
      .then((res) => {
        setQuestions(res.data.questions || []);
        setTimeLeft(res.data.duration || 0);
      })
      .catch(() => {
        alert("Invalid or expired test link.");
        navigate("/");
      })
      .finally(() => setLoading(false));
  }, [token, navigate]);

  /* ================= TIMER ================= */
  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [timeLeft]);

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    if (submittedRef.current) return;
    submittedRef.current = true;

    clearInterval(timerRef.current);

    try {
      await api.post("/test/submit", { token, answers });
      navigate("/thank-you");
    } catch {
      alert("Submission failed. Please contact support.");
      submittedRef.current = false;
    }
  };

  if (loading) return <p style={{ padding: 40 }}>Loading test...</p>;

  /* ================= TEST UI ================= */
  return (
    <div style={page}>
      <div style={card}>
        <div style={header}>
          <h2>Aptitude Test</h2>

          <div style={timer}>
            ⏱ {Math.floor(timeLeft / 60)}:
            {String(timeLeft % 60).padStart(2, "0")}
          </div>
        </div>

        {questions.map((q, i) => (
          <div key={q.id} style={questionBox}>
            <p style={questionText}>
              {i + 1}. {q.question}
            </p>

            {Object.entries(q.options).map(([key, value]) => (
              <div
                key={key}
                style={{
                  ...option,
                  ...(answers[q.id] === key ? optionSelected : {}),
                }}
                onClick={() =>
                  setAnswers((prev) => ({ ...prev, [q.id]: key }))
                }
              >
                <b>{key}.</b> {value}
              </div>
            ))}
          </div>
        ))}

        <button onClick={handleSubmit} style={submitBtn}>
          Submit Test
        </button>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const page = {
  minHeight: "100vh",
  background: "#f4f6fb",
  padding: 30,
};

const card = {
  maxWidth: 900,
  margin: "0 auto",
  background: "#ffffff",
  padding: 32,
  borderRadius: 16,
  boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
};

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 30,
};

const timer = {
  background: "#1f4fd8",
  color: "#ffffff",
  padding: "10px 18px",
  borderRadius: 20,
  fontWeight: 600,
};

const questionBox = {
  marginBottom: 28,
};

const questionText = {
  fontSize: 18,
  fontWeight: 600,
  marginBottom: 12,
};

const option = {
  padding: "12px 16px",
  border: "1px solid #e5e7eb",
  borderRadius: 10,
  marginBottom: 10,
  cursor: "pointer",
};

const optionSelected = {
  background: "#eef3ff",
  border: "1px solid #1f4fd8",
};

const submitBtn = {
  marginTop: 30,
  width: "100%",
  padding: 14,
  background: "#1f4fd8",
  color: "#ffffff",
  border: "none",
  borderRadius: 10,
  fontWeight: 600,
  cursor: "pointer",
};
