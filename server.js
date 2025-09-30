const express = require('express');
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware
app.use(cors());              // cho phép gọi từ trình duyệt/game
app.use(express.json());      // parse JSON body

// Bộ nhớ tạm leaderboard
let leaderboard = {};

// API lấy leaderboard (top 5)
app.get('/leaderboard', (req, res) => {
  const top = Object.entries(leaderboard)
    .map(([name, score]) => ({ name, score }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
  res.json(top);
});

// API submit điểm
app.post('/submit', (req, res) => {
  const { name, score } = req.body;

  if (!name || typeof score !== "number") {
    return res.status(400).json({ error: "Missing or invalid name/score" });
  }

  // update nếu điểm mới cao hơn
  if (!leaderboard[name] || score > leaderboard[name]) {
    leaderboard[name] = score;
  }

  res.json({ success: true, leaderboard });
});

// Start server
app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
});