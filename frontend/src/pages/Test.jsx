import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Test() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token");

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(50 * 60);
  const [submitted, setSubmitted] = useState(false);

  // prevents double submit
  const submittingRef = useRef(false);

  /* ================= LOAD QUESTIONS ================= */
  useEffect(() => {
    if (!token) return;

    api
      .get(`/test/start?token=${token}`)
      .then((res) => {
        setQuestions(res.data.questions || []);
        setTimeLeft(res.data.duration || 50 * 60);
        setLoading(false);
      })
      .catch(() => alert("Invalid test link"));
  }, [token]);

  /* ================= TIMER ================= */
  useEffect(() => {
    if (loading || submitted) return;

    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          handleSubmit(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, submitted]);

  /* ================= ANSWER SELECT ================= */
  const selectAnswer = (qid, index) => {
    const key = String.fromCharCode(65 + index); // A/B/C/D
    setAnswers((prev) => ({ ...prev, [qid]: key }));
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (auto = false) => {
    if (submittingRef.current) return;

    submittingRef.current = true;
    setSubmitted(true);

    try {
      await api.post("/test/submit", {
        token,
        answers,
      });

      if (!auto) alert("Test submitted successfully");

      navigate("/thank-you");
    } catch {
      alert("Submit failed");
      submittingRef.current = false;
      setSubmitted(false);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: 30, maxWidth: 900, margin: "0 auto" }}>
      <h3>
        Time Left: {Math.floor(timeLeft / 60)}:
        {(timeLeft % 60).toString().padStart(2, "0")}
      </h3>

      {questions.map((q, i) => (
        <div key={q.id} style={{ marginTop: 20 }}>
          <strong>
            {i + 1}. {q.question}
          </strong>

          {q.options.map((opt, idx) => (
            <div key={idx}>
              <label>
                <input
                  type="radio"
                  name={`q${q.id}`}
                  checked={answers[q.id] === String.fromCharCode(65 + idx)}
                  onChange={() => selectAnswer(q.id, idx)}
                />
                {opt}
              </label>
            </div>
          ))}
        </div>
      ))}

      <button
        onClick={() => handleSubmit(false)}
        disabled={submitted}
        style={{ marginTop: 40 }}
      >
        Submit
      </button>
    </div>
  );
}
