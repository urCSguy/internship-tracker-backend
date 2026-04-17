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
 * GET TASKS
 */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;

    const skip = (page - 1) * limit;

    const sort = (req.query.sort || "desc").toLowerCase();
    
    const { completed } = req.query;

    const whereClause = {
      userId: req.user.userId
    };

    if (completed !== undefined) {
      whereClause.completed = completed === "true";
    }

    console.log("SORT VALUE:", sort);

    const tasks = await prisma.task.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: {
          id: sort === "asc" ? "asc" : "desc"
        }
    });

    const total = await prisma.task.count({
      where: {
        userId: req.user.userId
      }
    });

    res.json({
      data: tasks,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (err) {
    console.log("GET TASKS ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * UPDATE TASK
 */
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const { title, completed } = req.body || {};

    const updated = await prisma.task.updateMany({
      where: {
        id: taskId,
        userId: req.user.userId
      },
      data: {
        ...(title !== undefined && { title }),
        ...(completed !== undefined && { completed })
      }
    });

    if (updated.count === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json({ message: "Task updated successfully" });

  } catch (err) {
    console.log("UPDATE ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * DELETE TASK (MISSING BEFORE — THIS FIXES YOUR ERROR)
 */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);

    const deleted = await prisma.task.deleteMany({
      where: {
        id: taskId,
        userId: req.user.userId
      }
    });

    if (deleted.count === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json({ message: "Task deleted successfully" });

  } catch (err) {
    console.log("DELETE ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;