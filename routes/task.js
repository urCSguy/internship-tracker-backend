const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const authMiddleware = require("../middleware/authMiddleware");

/**
 * CREATE TASK
 */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title } = req.body || {};

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const task = await prisma.task.create({
      data: {
        title,
        userId: req.user.userId
      }
    });

    res.json(task);
  } catch (err) {
    console.log("CREATE TASK ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * GET TASKS (USER ONLY)
 */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: {
        userId: req.user.userId
      }
    });

    res.json(tasks);
  } catch (err) {
    console.log("GET TASKS ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const { title, completed } = req.body || {};

    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        userId: req.user.userId
      }
    });

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    const updatedTask = await prisma.task.update({
      where: {
        id: taskId
      },
      data: {
        title: title ?? task.title,
        completed: completed ?? task.completed
      }
    });

    res.json(updatedTask);

  } catch (err) {
    console.log("UPDATE ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const { title, completed } = req.body || {};

    const updatedTask = await prisma.task.updateMany({
      where: {
        id: taskId,
        userId: req.user.userId   // 🔥 ownership enforced here
      },
      data: {
        ...(title !== undefined && { title }),
        ...(completed !== undefined && { completed })
      }
    });

    if (updatedTask.count === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json({ message: "Task updated successfully" });

  } catch (err) {
    console.log("UPDATE ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});
module.exports = router;