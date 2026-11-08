const express = require("express");
const Course = require("../models/Course");
const { protect, instructorOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// Get all courses
router.get("/", async (req, res) => {
  try {
    const courses = await Course.find()
      .populate("instructor", "name email")
      .sort({ createdAt: -1 });

    res.json(courses);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch courses",
      error: error.message
    });
  }
});

// Get single course
router.get("/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("instructor", "name email");

    if (!course) {
      return res.status(404).json({
        message: "Course not found"
      });
    }

    res.json(course);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch course",
      error: error.message
    });
  }
});

// Create course - Instructor only
router.post("/", protect, instructorOnly, async (req, res) => {
  try {
    const { title, description, category, level, thumbnail } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({
        message: "Title, description and category are required"
      });
    }

    const course = await Course.create({
      title,
      description,
      category,
      level,
      thumbnail,
      instructor: req.user.id
    });

    res.status(201).json({
      message: "Course created successfully",
      course
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create course",
      error: error.message
    });
  }
});

module.exports = router;