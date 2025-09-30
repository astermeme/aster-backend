const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

//  leaderboard
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
  leaderboard.push({ name, score });
  res.json({ success: true, leaderboard });
});

// Test route
app.get("/", (req, res) => {
  res.send("Aster backend is running 🚀");
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
