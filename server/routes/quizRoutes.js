const express = require("express");
const mongoose = require("mongoose");
const Quiz = require("../models/Quiz");
const Course = require("../models/Course");
const Lesson = require("../models/Lesson");
const { protect, instructorOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// Create quiz - Instructor only
router.post("/", protect, instructorOnly, async (req, res) => {
  try {
    const { course, lesson, title, questions } = req.body;

    if (!course || !lesson || !title || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        message: "Course, lesson, title and questions are required."
      });
    }

    const selectedCourse = await Course.findById(course);
    const selectedLesson = await Lesson.findById(lesson);

    if (!selectedCourse || !selectedLesson) {
      return res.status(404).json({
        message: "Course or lesson not found."
      });
    }

    if (selectedCourse.instructor.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You can only create quizzes for your own courses."
      });
    }

    if (selectedLesson.course.toString() !== course) {
      return res.status(400).json({
        message: "This lesson does not belong to the selected course."
      });
    }

    for (const question of questions) {
      if (
        !question.question ||
        !Array.isArray(question.options) ||
        question.options.length < 2 ||
        !Number.isInteger(question.correctAnswer) ||
        question.correctAnswer < 0 ||
        question.correctAnswer >= question.options.length
      ) {
        return res.status(400).json({
          message: "Each question needs text, at least two options and a valid correct answer index."
        });
      }
    }

    const quiz = await Quiz.create({
      course,
      lesson,
      title,
      questions
    });

    res.status(201).json({
      message: "Quiz created successfully!",
      quizId: quiz._id
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create quiz.",
      error: error.message
    });
  }
});

// Get quiz questions - Student view (hide correct answers)
router.get("/lesson/:lessonId", protect, async (req, res) => {
  try {
    const quizzes = await Quiz.find({
      lesson: req.params.lessonId
    }).select("-questions.correctAnswer");

    res.json(quizzes);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch quizzes.",
      error: error.message
    });
  }
});

// Submit quiz answers - Student only
router.post("/:quizId/submit", protect, async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({
        message: "Only students can submit quiz answers."
      });
    }

    if (!mongoose.isValidObjectId(req.params.quizId)) {
      return res.status(400).json({
        message: "Invalid quiz ID."
      });
    }

    const quiz = await Quiz.findById(req.params.quizId);

    if (!quiz) {
      return res.status(404).json({
        message: "Quiz not found."
      });
    }

    const { answers } = req.body;

    if (!Array.isArray(answers) || answers.length !== quiz.questions.length) {
      return res.status(400).json({
        message: "Please answer every question."
      });
    }

    let score = 0;

    quiz.questions.forEach((question, index) => {
      if (Number(answers[index]) === question.correctAnswer) {
        score++;
      }
    });

    const total = quiz.questions.length;
    const percentage = Math.round((score / total) * 100);

    res.json({
      message: "Quiz submitted successfully!",
      score,
      total,
      percentage
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to submit quiz.",
      error: error.message
    });
  }
});

module.exports = router;