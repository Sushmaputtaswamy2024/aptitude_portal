import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";
import BrandLayout from "../components/BrandLayout";

export default function Test() {
  const [params] = useSearchParams();
  const token = params.get("token");

  const rootRef = useRef(null);

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  /* ================= FULLSCREEN ================= */

  const checkFullscreen = () => {
    const fs =
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement;

    setIsFullscreen(!!fs);
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

  const enterFullscreen = async () => {
    const el = rootRef.current || document.documentElement;

    try {
      if (el.requestFullscreen) await el.requestFullscreen();
      else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
      else if (el.mozRequestFullScreen) await el.mozRequestFullScreen();
      else if (el.msRequestFullscreen) await el.msRequestFullscreen();

      setTimeout(checkFullscreen, 300);
    } catch (e) {
      alert("Browser blocked fullscreen. Please allow fullscreen.");
      console.error(e);
    }
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
      .catch(() => alert("Invalid test link"));
  }, [token]);

  /* ================= TIMER ================= */

  useEffect(() => {
    if (!isFullscreen || loading || submitted) return;

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
  }, [isFullscreen, loading, submitted]);

  /* ================= ANSWERS ================= */

  const selectAnswer = (qid, val) => {
    setAnswers((p) => ({ ...p, [qid]: val }));
  };

  /* ================= SUBMIT ================= */

  const submitTest = async () => {
    if (submitted) return;
    setSubmitted(true);

    try {
      await api.post("/test/submit", { token, answers });
      alert("Test submitted");
    } catch {
      alert("Submit failed");
    }
  };

  /* ================= FULLSCREEN BLOCK ================= */

  if (!isFullscreen) {
    return (
      <BrandLayout>
        <div
          ref={rootRef}
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

          <button
            onClick={enterFullscreen}
            style={{ padding: "14px 40px", fontSize: 18 }}
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
        <p>Loading...</p>
      </BrandLayout>
    );
  }

  /* ================= TEST ================= */

  return (
    <BrandLayout>
      <h3>
        Time Left: {Math.floor(timeLeft / 60)}:
        {(timeLeft % 60).toString().padStart(2, "0")}
      </h3>

      {questions.map((q, i) => (
        <div key={q.id} style={{ marginTop: 20 }}>
          <strong>
            {i + 1}. {q.question}
          </strong>

          {q.options.map((o, k) => (
            <div key={k}>
              <label>
                <input
                  type="radio"
                  name={`q${q.id}`}
                  checked={answers[q.id] === o}
                  onChange={() => selectAnswer(q.id, o)}
                />
                {o}
              </label>
            </div>
          ))}
        </div>
      ))}

      <button onClick={submitTest} style={{ marginTop: 40 }}>
        Submit
      </button>
    </BrandLayout>
  );
}
