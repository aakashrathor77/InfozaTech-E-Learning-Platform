
const express = require("express");
const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");
const Lesson = require("../models/Lesson");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Enroll in a course
router.post("/:courseId", protect, async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({
        message: "Only students can enroll in courses"
      });
    }

    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({
        message: "Course not found"
      });
    }

    const existingEnrollment = await Enrollment.findOne({
      student: req.user.id,
      course: req.params.courseId
    });

    if (existingEnrollment) {
      return res.status(409).json({
        message: "Already enrolled in this course"
      });
    }

    const enrollment = await Enrollment.create({
      student: req.user.id,
      course: req.params.courseId
    });

    res.status(201).json({
      message: "Course enrollment successful",
      enrollment
    });
  } catch (error) {
    res.status(500).json({
      message: "Enrollment failed",
      error: error.message
    });
  }
});

// Get my enrolled courses
router.get("/my-courses", protect, async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({
        message: "Only students can view enrollments"
      });
    }

    const enrollments = await Enrollment.find({
      student: req.user.id
    })
      .populate("course")
      .populate("completedLessons");

    res.json(enrollments);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch enrolled courses",
      error: error.message
    });
  }
});

// Mark a lesson as completed
router.put("/:enrollmentId/progress", protect, async (req, res) => {
  try {
    const { lessonId } = req.body;

    if (req.user.role !== "student") {
      return res.status(403).json({
        message: "Only students can update progress"
      });
    }

    if (!lessonId) {
      return res.status(400).json({
        message: "Lesson ID is required"
      });
    }

    const enrollment = await Enrollment.findOne({
      _id: req.params.enrollmentId,
      student: req.user.id
    });

    if (!enrollment) {
      return res.status(404).json({
        message: "Enrollment not found"
      });
    }

    const lesson = await Lesson.findOne({
      _id: lessonId,
      course: enrollment.course
    });

    if (!lesson) {
      return res.status(404).json({
        message: "Lesson not found in this course"
      });
    }

    const alreadyCompleted = enrollment.completedLessons.some(
      (id) => id.toString() === lessonId
    );

    if (!alreadyCompleted) {
      enrollment.completedLessons.push(lesson._id);
    }

    const totalLessons = await Lesson.countDocuments({
      course: enrollment.course
    });

    enrollment.progress = totalLessons === 0
      ? 0
      : Math.round(
          (enrollment.completedLessons.length / totalLessons) * 100
        );

    enrollment.status = enrollment.progress === 100
      ? "completed"
      : "active";

    await enrollment.save();

    res.json({
      message: "Lesson completed successfully",
      progress: enrollment.progress,
      status: enrollment.status
    });
  } catch (error) {
    res.status(500).json({
      message: "Progress update failed",
      error: error.message
    });
  }
});

module.exports = router;
