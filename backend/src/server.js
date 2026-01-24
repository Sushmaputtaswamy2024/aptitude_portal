const app = require("./app");

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`);
});

server.on("error", (err) => {
  console.error("❌ Server startup error:", err);
});
