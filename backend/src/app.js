const express = require("express");
const cors = require("cors");

const app = express();

/* ================= MIDDLEWARE ================= */
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());

/* ================= ROUTES ================= */
app.use("/api/auth", require("./auth.routes"));
app.use("/api/admin", require("./admin.routes"));
app.use("/api/invitations", require("./invitations.routes"));
app.use("/api/verify", require("./verify.routes"));
app.use("/api/test", require("./test.routes"));

/* ================= HEALTH ================= */
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Backend running" });
});

/* ================= FALLBACK ================= */
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

module.exports = app;
