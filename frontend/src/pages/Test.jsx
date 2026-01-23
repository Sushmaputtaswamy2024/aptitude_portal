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
  const [violations, setViolations] = useState(0);

  const submittedRef = useRef(false);
  const MAX_VIOLATIONS = 3;

  /* ================= LOAD TEST ================= */
  useEffect(() => {
    if (!token) {
      alert("Invalid test link");
      navigate("/");
      return;
    }

    api
      .get(`/test/start?token=${token}`)
      .then(res => {
        setQuestions(res.data.questions || []);
        setTimeLeft(res.data.duration || 0);
        setLoading(false);
      })
      .catch(err => {
        if (err.response?.status === 410) {
          alert("This test link has expired.");
        } else {
          alert("Invalid test link.");
        }
        navigate("/");
      });
  }, [token, navigate]);

  /* ================= FULLSCREEN ================= */
  useEffect(() => {
    const enterFullscreen = async () => {
      try {
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
        }
      } catch {
        alert("Fullscreen permission is required.");
      }
    };

    enterFullscreen();
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setViolations(v => v + 1);
        alert("Do not exit fullscreen during the test.");
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  /* ================= TAB SWITCH ================= */
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) setViolations(v => v + 1);
    };
    const onBlur = () => setViolations(v => v + 1);

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
    };
  }, []);

  /* ================= VIOLATION CHECK ================= */
  useEffect(() => {
    if (violations === 0) return;

    alert(`Warning: ${violations}/${MAX_VIOLATIONS}`);

    if (violations >= MAX_VIOLATIONS) {
      alert("Test auto-submitted due to violations.");
      handleSubmit();
    }
  }, [violations]);

  /* ================= TIMER ================= */
  useEffect(() => {
    if (loading) return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(t => t - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, loading]);

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    if (submittedRef.current) return;
    submittedRef.current = true;

    try {
      await api.post("/test/submit", { token, answers });
      if (document.fullscreenElement) document.exitFullscreen();
      navigate("/thank-you");
    } catch {
      alert("Submission failed");
      submittedRef.current = false;
    }
  };

  if (loading) return <p style={{ padding: 40 }}>Loading test...</p>;

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

            {Object.entries(q.options).map(([key, value]) => {
              const selected = answers[q.id] === key;
              return (
                <div
                  key={key}
                  style={{
                    ...option,
                    ...(selected ? optionSelected : {}),
                  }}
                  onClick={() =>
                    setAnswers(prev => ({ ...prev, [q.id]: key }))
                  }
                >
                  <b>{key}.</b> {value}
                </div>
              );
            })}
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
  background: "#fff",
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
  color: "#fff",
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
  color: "#fff",
  border: "none",
  borderRadius: 10,
  fontWeight: 600,
  cursor: "pointer",
};
