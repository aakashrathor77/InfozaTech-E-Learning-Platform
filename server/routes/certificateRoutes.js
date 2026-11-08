
const express = require("express");
const Certificate = require("../models/Certificate");
const Enrollment = require("../models/Enrollment");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/my", protect, async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({
        message: "Only students can access certificates."
      });
    }

    const enrollments = await Enrollment.find({
      student: req.user.id,
      progress: 100
    }).populate("course", "title instructor");

    const certificates = [];

    for (const enrollment of enrollments) {
      let certificate = await Certificate.findOne({
        student: req.user.id,
        course: enrollment.course._id
      });

      if (!certificate) {
        certificate = await Certificate.create({
          student: req.user.id,
          course: enrollment.course._id,
          certificateId: `INFOZA-${enrollment._id.toString().slice(-8).toUpperCase()}`
        });
      }

      certificates.push({
        _id: certificate._id,
        certificateId: certificate.certificateId,
        issueDate: certificate.issueDate,
        course: enrollment.course
      });
    }

    res.json(certificates);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch certificates.",
      error: error.message
    });
  }
});

module.exports = router;
