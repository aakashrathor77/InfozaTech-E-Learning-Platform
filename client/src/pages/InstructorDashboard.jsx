
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  LayoutDashboard,
  BookOpen,
  PlusCircle,
  ClipboardList,
  GraduationCap,
  Video,
  Users,
  UserRound,
  Settings,
  LogOut,
  ArrowRight,
  Search
} from "lucide-react";

import API from "../api";
import "./InstructorDashboard.css";

function InstructorDashboard() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    level: "Beginner",
    thumbnail: ""
  });

  const fetchCourses = async () => {
    try {
      setError("");
      const response = await API.get("/courses");

      const myCourses = response.data.filter(
        (course) => course.instructor?._id === user?._id
      );

      setCourses(myCourses);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load courses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setSubmitting(true);

    try {
      await API.post("/courses", formData);

      setMessage("Course created successfully!");

      setFormData({
        title: "",
        description: "",
        category: "",
        level: "Beginner",
        thumbnail: ""
      });

      await fetchCourses();
    } catch (err) {
      setError(err.response?.data?.message || "Could not create course.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  const userName = user?.name || "Instructor";
  const initial = userName.charAt(0).toUpperCase();

  return (
    <div className="instructor-dashboard">
      <aside className="instructor-sidebar">
        <div className="instructor-brand">
          <div className="instructor-brand-icon">I</div>
          <span>Infoza<span>Tech</span></span>
        </div>

        <p className="instructor-menu-label">MAIN MENU</p>

        <nav className="instructor-nav">
          <a href="#dashboard" className="instructor-nav-link active">
            <LayoutDashboard size={19} /> Dashboard
          </a>

          <a href="#my-courses" className="instructor-nav-link">
            <BookOpen size={19} /> My Courses
          </a>

          <a href="#create-course" className="instructor-nav-link">
            <PlusCircle size={19} /> Add Course
          </a>

          <Link to="/add-lesson" className="instructor-nav-link">
            <Video size={19} /> Add Lesson
          </Link>

          <Link to="/create-quiz" className="instructor-nav-link">
            <ClipboardList size={19} /> Create Quiz
          </Link>
        </nav>

        <p className="instructor-menu-label">ACCOUNT</p>

        <nav className="instructor-nav">
          <a
            href="#student-progress"
            className="instructor-nav-link"
            onClick={(e) => {
              e.preventDefault();
              alert("Student Progress feature is coming soon.");
            }}
          >
            <Users size={19} /> Student Progress
          </a>

          <a
            href="#profile"
            className="instructor-nav-link"
            onClick={(e) => {
              e.preventDefault();
              alert(`Logged in as ${userName}`);
            }}
          >
            <UserRound size={19} /> Profile
          </a>

          <a
            href="#settings"
            className="instructor-nav-link"
            onClick={(e) => {
              e.preventDefault();
              alert("Settings feature is coming soon.");
            }}
          >
            <Settings size={19} /> Settings
          </a>
        </nav>

        <div className="instructor-sidebar-bottom">
          <div className="instructor-user">
            <div className="instructor-avatar">{initial}</div>
            <div>
              <strong>{userName}</strong>
              <span>Instructor</span>
            </div>
          </div>

          <button
            className="instructor-logout"
            onClick={handleLogout}
          >
            <LogOut size={18} /> Logout
          </button>

          <p>© 2026 InfozaTech</p>
        </div>
      </aside>

      <main className="instructor-main" id="dashboard">
        <header className="instructor-topbar">
          <div>
            <h1>Instructor Dashboard</h1>
            <p>Manage your courses and learning content.</p>
          </div>

          <div className="instructor-top-actions">
            <div className="instructor-search">
              <Search size={18} />
              <input placeholder="Search..." />
            </div>

            <div className="instructor-top-avatar">{initial}</div>
          </div>
        </header>

        <section className="instructor-welcome">
          <div>
            <span>INSTRUCTOR PANEL</span>
            <h2>Welcome back, {userName}!</h2>
            <p>
              Create courses, share knowledge and help students learn.
            </p>
          </div>

          <GraduationCap size={85} strokeWidth={1.3} />
        </section>

        <section className="instructor-stats">
          <div className="instructor-stat-card">
            <div className="instructor-stat-icon">
              <BookOpen />
            </div>
            <p>Total Courses</p>
            <h2>{courses.length.toString().padStart(2, "0")}</h2>
          </div>

          <div className="instructor-stat-card">
            <div className="instructor-stat-icon green">
              <Video />
            </div>
            <p>Learning Content</p>
            <h2>Manage</h2>
          </div>

          <div className="instructor-stat-card">
            <div className="instructor-stat-icon orange">
              <ClipboardList />
            </div>
            <p>Quizzes</p>
            <h2>Create</h2>
          </div>
        </section>

        <section className="instructor-quick-actions">
          <div className="instructor-section-heading">
            <div>
              <h2>Quick Actions</h2>
              <p>Choose what you want to do today.</p>
            </div>
          </div>

          <div className="instructor-action-grid">
            <a href="#create-course" className="instructor-action-card">
              <PlusCircle size={28} />
              <h3>Add New Course</h3>
              <span>Create a new learning course</span>
              <ArrowRight size={17} />
            </a>

            <Link to="/add-lesson" className="instructor-action-card">
              <Video size={28} />
              <h3>Add Lesson</h3>
              <span>Add content to your courses</span>
              <ArrowRight size={17} />
            </Link>

            <Link to="/create-quiz" className="instructor-action-card">
              <ClipboardList size={28} />
              <h3>Create Quiz</h3>
              <span>Prepare student assessments</span>
              <ArrowRight size={17} />
            </Link>
          </div>
        </section>

        <section
          className="create-course-section"
          id="create-course"
        >
          <div className="instructor-section-heading">
            <div>
              <h2>Create New Course</h2>
              <p>Fill in the details to publish your course.</p>
            </div>
          </div>

          {message && (
            <p className="instructor-success">{message}</p>
          )}

          {error && (
            <p className="instructor-error">{error}</p>
          )}

          <form onSubmit={handleSubmit}>
            <label>Course Title</label>
            <input
              type="text"
              name="title"
              placeholder="Enter course title"
              value={formData.title}
              onChange={handleChange}
              required
            />

            <label>Description</label>
            <textarea
              name="description"
              placeholder="Enter course description"
              value={formData.description}
              onChange={handleChange}
              required
            />

            <label>Category</label>
            <input
              type="text"
              name="category"
              placeholder="e.g. Web Development"
              value={formData.category}
              onChange={handleChange}
              required
            />

            <label>Course Level</label>
            <select
              name="level"
              value={formData.level}
              onChange={handleChange}
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>

            <label>Thumbnail URL (Optional)</label>
            <input
              type="url"
              name="thumbnail"
              placeholder="https://example.com/image.jpg"
              value={formData.thumbnail}
              onChange={handleChange}
            />

            <button type="submit" disabled={submitting}>
              {submitting ? "Creating Course..." : "Create Course"}
            </button>
          </form>
        </section>

        <section
          className="instructor-courses-section"
          id="my-courses"
        >
          <div className="instructor-section-heading">
            <div>
              <h2>My Courses</h2>
              <p>All courses created by you.</p>
            </div>
          </div>

          {loading && <p>Loading courses...</p>}

          {!loading && !error && courses.length === 0 && (
            <p>You have not created any courses yet.</p>
          )}

          <div className="instructor-course-grid">
            {courses.map((course) => (
              <div
                className="instructor-course-card"
                key={course._id}
              >
                <BookOpen size={28} />
                <h3>{course.title}</h3>
                <p>{course.category}</p>
                <span>{course.level || "Beginner"}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default InstructorDashboard;
