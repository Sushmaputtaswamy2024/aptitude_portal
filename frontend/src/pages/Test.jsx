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

  const submittingRef = useRef(false);

  /* LOAD QUESTIONS */
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

  /* TIMER */
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

  const selectAnswer = (qid, index) => {
    const key = String.fromCharCode(65 + index);
    setAnswers((p) => ({ ...p, [qid]: key }));
  };

  const handleSubmit = async (auto = false) => {
    if (submittingRef.current) return;

    submittingRef.current = true;
    setSubmitted(true);

    try {
      await api.post("/test/submit", { token, answers });
      if (!auto) alert("Test submitted");
      navigate("/thank-you");
    } catch {
      alert("Submit failed");
      submittingRef.current = false;
      setSubmitted(false);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={page}>
      <h3>
        Time Left: {Math.floor(timeLeft / 60)}:
        {(timeLeft % 60).toString().padStart(2, "0")}
      </h3>

      {questions.map((q, i) => (
        <div key={q.id} style={card}>
          <strong>{i + 1}. {q.question}</strong>

          {q.options.map((o, idx) => (
            <label key={idx} style={opt}>
              <input
                type="radio"
                name={`q${q.id}`}
                checked={answers[q.id] === String.fromCharCode(65 + idx)}
                onChange={() => selectAnswer(q.id, idx)}
              />
              {o}
            </label>
          ))}
        </div>
      ))}

      <button disabled={submitted} onClick={() => handleSubmit(false)} style={btn}>
        Submit
      </button>
    </div>
  );
}

const page = { padding: 30, maxWidth: 900, margin: "0 auto" };
const card = { marginTop: 20 };
const opt = { display: "block", marginTop: 6 };
const btn = { marginTop: 40, padding: "10px 20px" };
