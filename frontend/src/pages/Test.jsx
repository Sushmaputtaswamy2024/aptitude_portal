import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";
import BrandLayout from "../components/BrandLayout";

export default function Test() {
  const [params] = useSearchParams();
  const token = params.get("token");

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  /* ================= FULLSCREEN DETECTOR ================= */

  useEffect(() => {
    const handler = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  /* ================= ENTER FULLSCREEN (BUTTON ONLY) ================= */

  const enterFullscreen = (e) => {
    const el = e.currentTarget;

    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    else if (el.msRequestFullscreen) el.msRequestFullscreen();
  };

  /* ================= LOAD QUESTIONS ================= */

  useEffect(() => {
    if (!token) return;

    api
      .get(`/test/start?token=${token}`)
      .then((res) => {
        setQuestions(res.data.questions || []);
        setTimeLeft(res.data.duration || 1800);
        setLoading(false);
      })
      .catch(() => {
        alert("Invalid or expired test link");
      });
  }, [token]);

  /* ================= TIMER (ONLY AFTER FULLSCREEN) ================= */

  useEffect(() => {
    if (loading || submitted || !isFullscreen) return;

    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          submitTest();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, submitted, isFullscreen]);

  /* ================= ANSWERS ================= */

  const selectAnswer = (qid, value) => {
    setAnswers((prev) => ({
      ...prev,
      [qid]: value,
    }));
  };

  /* ================= SUBMIT ================= */

  const submitTest = async () => {
    if (submitted) return;
    setSubmitted(true);

    try {
      await api.post("/test/submit", {
        token,
        answers,
      });

      alert("Test submitted successfully");
    } catch {
      alert("Submission failed");
    }
  };

  /* ================= FULLSCREEN BLOCK ================= */

  if (!isFullscreen) {
    return (
      <BrandLayout>
        <div
          style={{
            height: "80vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <h2>Start Assessment</h2>

          <p>Click below to enter fullscreen and begin.</p>

          <button
            onClick={enterFullscreen}
            style={{
              marginTop: 20,
              padding: "12px 30px",
              fontSize: 16,
              cursor: "pointer",
            }}
          >
            Start Test
          </button>
        </div>
      </BrandLayout>
    );
  }

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <BrandLayout>
        <p>Loading test...</p>
      </BrandLayout>
    );
  }

  /* ================= MAIN UI ================= */

  return (
    <BrandLayout>
      <div>
        <h3>
          Time Remaining: {Math.floor(timeLeft / 60)}:
          {(timeLeft % 60).toString().padStart(2, "0")}
        </h3>

        {questions.map((q, idx) => (
          <div key={q.id} style={{ marginTop: 25 }}>
            <strong>
              {idx + 1}. {q.question}
            </strong>

            {q.options.map((opt, i) => (
              <div key={i}>
                <label>
                  <input
                    type="radio"
                    name={`q-${q.id}`}
                    checked={answers[q.id] === opt}
                    onChange={() => selectAnswer(q.id, opt)}
                  />
                  {opt}
                </label>
              </div>
            ))}
          </div>
        ))}

        <button
          onClick={submitTest}
          style={{
            marginTop: 40,
            padding: "10px 30px",
            fontSize: 16,
          }}
        >
          Submit Test
        </button>
      </div>
    </BrandLayout>
  );
}
