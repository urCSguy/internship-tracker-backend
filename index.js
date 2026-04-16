require("dotenv").config();

const express = require("express");
const app = express();

app.use(express.json());

const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes)

const taskRoutes = require("./routes/task");;
app.use("/tasks", taskRoutes);

const authMiddleware = require("./middleware/authMiddleware");

app.get("/dashboard", authMiddleware, (req, res) => {
  res.json({
    message: "Welcome to dashboard",
    user: req.user
  });
});
app.get("/test", (req, res) => {
  res.json({ ok: true });
});

const cors = require("cors");
app.use(cors());

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});