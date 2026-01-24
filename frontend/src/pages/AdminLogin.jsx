import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const login = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/auth/login", {
        email,
        password,
      });

      // ✅ Store token
      localStorage.setItem("adminToken", res.data.token);

      // ✅ Redirect to dashboard
      navigate("/admin/dashboard");
    } catch (err) {
      setError(
        err?.response?.data?.message || "Invalid admin credentials"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={pageStyle}>
      <form onSubmit={login} style={cardStyle}>
        <h2 style={{ marginBottom: 6 }}>Admin Login</h2>
        <p style={{ color: "#666", marginBottom: 25 }}>
          Sign in to access the admin dashboard
        </p>

        {error && <p style={errorStyle}>{error}</p>}

        <label style={labelStyle}>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@example.com"
          style={inputStyle}
          autoComplete="email"
        />

        <label style={labelStyle}>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          style={inputStyle}
          autoComplete="current-password"
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            ...buttonStyle,
            opacity: loading ? 0.7 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

/* ================= STYLES ================= */

const pageStyle = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#f4f6f9",
};

const cardStyle = {
  width: 360,
  padding: 30,
  background: "#ffffff",
  borderRadius: 8,
  boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
};

const labelStyle = {
  display: "block",
  marginBottom: 6,
  fontSize: 13,
  fontWeight: 600,
};

const inputStyle = {
  width: "100%",
  padding: 10,
  marginBottom: 18,
  borderRadius: 4,
  border: "1px solid #ccc",
  fontSize: 14,
};

const buttonStyle = {
  width: "100%",
  padding: 12,
  background: "#2f3640",
  color: "#ffffff",
  border: "none",
  borderRadius: 4,
  fontSize: 14,
};

const errorStyle = {
  background: "#fdecea",
  color: "#b02a37",
  padding: "8px 10px",
  borderRadius: 4,
  marginBottom: 15,
  fontSize: 13,
};
