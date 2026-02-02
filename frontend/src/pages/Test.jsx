import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";

export default function Test() {
  const [params] = useSearchParams();
  const token = params.get("token");

  const containerRef = useRef(null);

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(1800);
  const [fullscreen, setFullscreen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  /* ================= FULLSCREEN ================= */
  const checkFullscreen = () => {
    const fs =
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement;

    setFullscreen(!!fs);
  };

  const enterFullscreen = async () => {
    const el = containerRef.current || document.documentElement;
    try {
      if (el.requestFullscreen) await el.requestFullscreen();
      else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
      else if (el.mozRequestFullScreen) await el.mozRequestFullScreen();
      else if (el.msRequestFullscreen) await el.msRequestFullscreen();
      setTimeout(checkFullscreen, 300);
    } catch (err) {
      alert("Browser blocked fullscreen");
    }
  };

  useEffect(() => {
    document.addEventListener("fullscreenchange", checkFullscreen);
    document.addEventListener("webkitfullscreenchange", checkFullscreen);
    checkFullscreen();

    return () => {
      document.removeEventListener("fullscreenchange", checkFullscreen);
      document.removeEventListener("webkitfullscreenchange", checkFullscreen);
    };
  }, []);

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
      .catch(() => alert("Invalid test link"));
  }, [token]);

  /* ================= TIMER ================= */
  useEffect(() => {
    if (!fullscreen || loading || submitted) return;

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
  }, [fullscreen, loading, submitted]);

  /* ================= ANSWER SELECT ================= */
  const selectAnswer = (qid, index) => {
    // Convert index → A/B/C/D
    const key = String.fromCharCode(65 + index);
    setAnswers((prev) => ({ ...prev, [qid]: key }));
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
      alert("Submit failed");
    }
  };

  /* ================= UI ================= */

  if (!fullscreen) {
    return (
      <div
        ref={containerRef}
        style={{
          height: "80vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <h2>Start Test</h2>
        <p>Click below to enter fullscreen.</p>
        <button onClick={enterFullscreen} style={{ padding: "14px 40px" }}>
          Start Test
        </button>
      </div>
    );
  }

  if (loading) return <p>Loading...</p>;

  return (
    <div ref={containerRef} style={{ padding: 30 }}>
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

      <button onClick={submitTest} style={{ marginTop: 40 }}>
        Submit
      </button>
    </div>
  );
}
