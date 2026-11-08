
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, ArrowLeft, Play } from "lucide-react";
import API from "../api";
import "./MyCourses.css";

function MyCourses() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        const response = await API.get("/enrollments/my-courses");
        setEnrollments(response.data);
      } catch (err) {
        setError(
          err.response?.data?.message || "Unable to load your courses."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMyCourses();
  }, []);

  return (
    <div className="my-courses-page">
      <header className="my-courses-header">
        <Link to="/" className="back-link">
          <ArrowLeft size={18} /> Dashboard
        </Link>

        <h1>My Courses</h1>
        <p>Continue learning and track your progress.</p>
      </header>

      {loading && <p>Loading your courses...</p>}

      {error && <p className="courses-error">{error}</p>}

      {!loading && !error && enrollments.length === 0 && (
        <div className="empty-courses">
          <BookOpen size={45} />
          <h2>No courses enrolled yet</h2>
          <p>Explore available courses and start learning today.</p>
          <Link to="/" className="browse-courses-btn">
            Browse Courses
          </Link>
        </div>
      )}

      <div className="my-course-grid">
        {enrollments.map((enrollment) => {
          const course = enrollment.course;

          if (!course) return null;

          return (
            <div className="my-course-card" key={enrollment._id}>
              <div className="my-course-art">
                <BookOpen size={45} />
                <span>{course.category}</span>
              </div>

              <div className="my-course-details">
                <p className="my-course-level">
                  {course.level || "Beginner"}
                </p>

                <h2>{course.title}</h2>
                <p>{course.description}</p>

                <div className="my-progress-info">
                  <span>Course Progress</span>
                  <strong>{enrollment.progress || 0}%</strong>
                </div>

                <div className="my-progress-track">
                  <div
                    className="my-progress-fill"
                    style={{
                      width: `${enrollment.progress || 0}%`
                    }}
                  />
                </div>

                <div className="my-course-bottom">
                  <span>
                    {enrollment.status === "completed"
                      ? "Completed"
                      : "In Progress"}
                  </span>

                  <Link
                    to={`/course/${course._id}`}
                    className="my-continue-btn"
                  >
                    Continue <Play size={14} />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MyCourses;
