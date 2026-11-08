
const express = require("express");
const Lesson = require("../models/Lesson");
const Course = require("../models/Course");
const { protect, instructorOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// Get lessons of a course
router.get("/course/:courseId", async (req, res) => {
  try {
    const lessons = await Lesson.find({
      course: req.params.courseId
    }).sort({ order: 1 });

    res.json(lessons);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch lessons",
      error: error.message
    });
  }
});

// Create lesson - Instructor only
router.post("/", protect, instructorOnly, async (req, res) => {
  try {
    const { course, title, content, videoUrl, order } = req.body;

    if (!course || !title || !content) {
      return res.status(400).json({
        message: "Course, title and content are required"
      });
    }

    const selectedCourse = await Course.findById(course);

    if (!selectedCourse) {
      return res.status(404).json({
        message: "Course not found"
      });
    }

    if (selectedCourse.instructor.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You can only add lessons to your own courses"
      });
    }

    const lesson = await Lesson.create({
      course,
      title,
      content,
      videoUrl: videoUrl || "",
      order: Number(order) || 1
    });

    res.status(201).json({
      message: "Lesson created successfully",
      lesson
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create lesson",
      error: error.message
    });
  }
});

module.exports = router;
