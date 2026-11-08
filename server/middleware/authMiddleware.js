const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Not authorized. Please login first."
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
};

const instructorOnly = (req, res, next) => {
  if (req.user && req.user.role === "instructor") {
    return next();
  }

  return res.status(403).json({
    message: "Access denied. Instructor only."
  });
};

module.exports = { protect, instructorOnly };