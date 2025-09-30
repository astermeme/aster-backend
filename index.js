// index.js
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ====== CONFIG SECRET (đọc từ Render Env) ======
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "123456"; // đổi trên Render
const JWT_SECRET     = process.env.JWT_SECRET     || "secret123"; // đổi trên Render

// ====== LEADERBOARD (RAM) ======
let leaderboard = [];

// GET:  leaderboard
app.get("/leaderboard", (req, res) => {
  res.json(leaderboard);
});

// POST: 
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

// ====== ADMIN LOGIN ->  JWT ======
app.post("/admin/login", (req, res) => {
  const { password } = req.body || {};
  if (password === ADMIN_PASSWORD) {
    const token = jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "1h" });
    return res.json({ success: true, token });
  }
  res.status(401).json({ success: false, error: "Wrong password" });
});

// Middleware  JWT
function checkAuth(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ error: "No token" });
  const token = (authHeader || "").split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    res.status(403).json({ error: "Invalid token" });
  }
}

// ADMIN: Reset leaderboard
app.post("/admin/reset", checkAuth, (req, res) => {
  leaderboard = [];
  res.json({ success: true, message: "Leaderboard reset ✅" });
});

// ADMIN: 
app.delete("/admin/player/:name", checkAuth, (req, res) => {
  const { name } = req.params;
  const before = leaderboard.length;
  leaderboard = leaderboard.filter(p => p.name !== name);
  res.json({ success: true, removed: before - leaderboard.length, leaderboard });
});

// ADMIN: 
app.get("/admin/top/:n", checkAuth, (req, res) => {
  const n = Math.max(1, Math.min(100, Number(req.params.n) || 5));
  res.json(leaderboard.slice(0, n));
});

// Root test
app.get("/", (req, res) => {
  res.send("Aster backend is running 🚀");
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
