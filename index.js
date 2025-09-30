const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 3000;

// Environment Variables
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "changeme";
const JWT_SECRET = process.env.JWT_SECRET || "secret";

app.use(cors());
app.use(express.json());

// ========== Leaderboard ==========
let leaderboard = [];

// GET leaderboard
app.get("/leaderboard", (req, res) => {
  res.json(leaderboard);
});

// POST leaderboard
app.post("/leaderboard", (req, res) => {
  const { name, score } = req.body;
  if (!name || typeof score !== "number") {
    return res.status(400).json({ error: "Invalid data" });
  }

  const existing = leaderboard.find(p => p.name === name);
  if (existing) {
    existing.score = Math.max(existing.score, score);
  } else {
    leaderboard.push({ name, score });
  }
  leaderboard.sort((a, b) => b.score - a.score);

  res.json({ success: true, leaderboard });
});

// ========== Admin Login ==========
app.post("/admin/login", (req, res) => {
  const { password } = req.body;
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Wrong password" });
  }
  const token = jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "2h" });
  res.json({ success: true, token });
});

// Middleware check token
function authMiddleware(req, res, next) {
  const header = req.headers["authorization"];
  if (!header) return res.status(401).json({ error: "No token" });
  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
}

// ========== Admin Actions ==========
app.post("/admin/reset", authMiddleware, (req, res) => {
  leaderboard = [];
  res.json({ success: true, message: "Leaderboard reset!" });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
