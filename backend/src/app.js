const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.set("trust proxy", 1);

app.use(
  cors({
    origin: [
      "https://aptitude.vindiainfrasec.com",
      "https://vindiainfrasec.com",
    ],
    credentials: true,
  })
);

app.options("*", cors());
app.use(express.json());

app.use("/api/auth", require("./auth.routes"));
app.use("/api/admin", require("./admin.routes"));
app.use("/api/invitations", require("./invitations.routes"));
app.use("/api/verify", require("./verify.routes"));
app.use("/api/test", require("./test.routes"));

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Backend running" });
});

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

module.exports = app;
