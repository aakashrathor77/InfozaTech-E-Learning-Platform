
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  Award,
  UserRound,
  Settings,
  Search,
  Bell,
  Clock,
  TrendingUp,
  Code,
  Database,
  Palette,
  ArrowRight,
  LogOut,
  GraduationCap,
  Menu,
  X
} from "lucide-react";

import API from "../api";
import "./Home.css";

function Home() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [enrollingId, setEnrollingId] = useState("");
  const [search, setSearch] = useState("");
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const userName = user?.name || "Student";
  const userInitial = userName.charAt(0).toUpperCase();

  useEffect(() => {
    if (user?.role === "instructor") {
      navigate("/instructor", { replace: true });
    }
  }, [navigate, user?.role]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [courseResponse, enrolledResponse, certificateResponse] =
        await Promise.allSettled([
          API.get("/courses"),
          API.get("/enrollments/my-courses"),
          API.get("/certificates/my")
        ]);

      if (courseResponse.status === "fulfilled") {
        setCourses(courseResponse.value.data || []);
      } else {
        setError("Courses load nahi ho paaye. Backend check karo.");
      }

      if (enrolledResponse.status === "fulfilled") {
        setMyCourses(enrolledResponse.value.data || []);
      }

      if (certificateResponse.status === "fulfilled") {
        setCertificates(certificateResponse.value.data || []);
      }
    } catch (err) {
      setError("Dashboard load nahi ho paaya.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleEnroll = async (courseId) => {
    try {
      setEnrollingId(courseId);
      await API.post(`/enrollments/${courseId}`);
      alert("Course enrolled successfully!");
      await loadDashboard();
      setActiveSection("learning");
    } catch (err) {
      if (err.response?.status === 401) {
        alert("Your session has expired. Please login again.");
        handleLogout();
      } else {
        alert(
          err.response?.data?.message ||
          "Enrollment failed. Please try again."
        );
      }
    } finally {
      setEnrollingId("");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  const goToSection = (section) => {
    setActiveSection(section);
    setSidebarOpen(false);

    document.getElementById(section)?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  };

  const getCourseIcon = (category = "") => {
    const value = category.toLowerCase();

    if (value.includes("python") || value.includes("database")) {
      return Database;
    }

    if (value.includes("design")) {
      return Palette;
    }

    return Code;
  };

  const enrolledCourseIds = myCourses.map((item) =>
    item.course?._id || item.course
  );

  const filteredCourses = courses.filter((course) =>
    course.title?.toLowerCase().includes(search.toLowerCase()) ||
    course.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dashboard">
      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-icon">I</div>
          <span>Infoza<span className="brand-blue">Tech</span></span>
          <button className="mobile-close" onClick={() => setSidebarOpen(false)}>
            <X />
          </button>
        </div>

        <p className="menu-label">LEARNING MENU</p>

        <nav>
          <button
            className={`nav-link ${activeSection === "dashboard" ? "active" : ""}`}
            onClick={() => goToSection("dashboard")}
          >
            <LayoutDashboard /> Dashboard
          </button>

          <button
            className={`nav-link ${activeSection === "courses" ? "active" : ""}`}
            onClick={() => goToSection("courses")}
          >
            <BookOpen /> Explore Courses
          </button>

          <button
            className={`nav-link ${activeSection === "learning" ? "active" : ""}`}
            onClick={() => goToSection("learning")}
          >
            <GraduationCap /> My Learning
          </button>

          <button
            className={`nav-link ${activeSection === "quizzes" ? "active" : ""}`}
            onClick={() => goToSection("quizzes")}
          >
            <ClipboardList /> Quizzes
          </button>

          <button
            className={`nav-link ${activeSection === "certificates" ? "active" : ""}`}
            onClick={() => goToSection("certificates")}
          >
            <Award /> Certificates
          </button>

          <button
            className={`nav-link ${activeSection === "profile" ? "active" : ""}`}
            onClick={() => goToSection("profile")}
          >
            <UserRound /> My Profile
          </button>

          <button
            className={`nav-link ${activeSection === "settings" ? "active" : ""}`}
            onClick={() => goToSection("settings")}
          >
            <Settings /> Settings
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="help-card">
            <h3>Need Help?</h3>
            <p>Keep learning and growing with InfozaTech.</p>
            <button onClick={() => alert("Support feature coming soon!")}>
              Contact Support
            </button>
          </div>

          <p className="sidebar-footer">© 2026 InfozaTech</p>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <main className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <button className="mobile-menu" onClick={() => setSidebarOpen(true)}>
              <Menu />
            </button>
            <div>
              <h2>Student Dashboard</h2>
              <p>Welcome back, {userName}! Keep learning every day.</p>
            </div>
          </div>

          <div className="top-actions">
            <div className="search-box">
              <Search size={18} />
              <input
                placeholder="Search courses..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  goToSection("courses");
                }}
              />
            </div>

            <button
              className="notification"
              onClick={() => alert("No new notifications.")}
              title="Notifications"
            >
              <Bell />
            </button>

            <div className="profile-avatar">{userInitial}</div>

            <button
              className="notification logout-button"
              onClick={handleLogout}
              title="Logout"
            >
              <LogOut />
            </button>
          </div>
        </header>

        <section className="welcome-banner" id="dashboard">
          <div className="welcome-text">
            <span className="welcome-tag">YOUR LEARNING JOURNEY</span>
            <h1>
              Learn Today,
              <br />
              Build Tomorrow.
            </h1>
            <p>
              Expand your skills, explore new topics and achieve your goals
              with InfozaTech.
            </p>

            <button
              className="explore-btn"
              onClick={() => goToSection("courses")}
            >
              Explore Courses <ArrowRight size={17} />
            </button>
          </div>

          <div className="banner-decoration">
            <BookOpen size={110} strokeWidth={1.2} />
            <GraduationCap className="banner-cap" size={55} />
          </div>
        </section>

        {loading && <p className="loading-message">Loading your dashboard...</p>}
        {error && <p className="error-message">{error}</p>}

        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon blue-bg"><BookOpen /></div>
            <p>Available Courses</p>
            <h2>{courses.length.toString().padStart(2, "0")}</h2>
            <span>Courses on InfozaTech</span>
          </div>

          <div className="stat-card">
            <div className="stat-icon green-bg"><TrendingUp /></div>
            <p>My Enrolled Courses</p>
            <h2>{myCourses.length.toString().padStart(2, "0")}</h2>
            <span>Your learning journey</span>
          </div>

          <div className="stat-card">
            <div className="stat-icon orange-bg"><Award /></div>
            <p>My Certificates</p>
            <h2>{certificates.length.toString().padStart(2, "0")}</h2>
            <span>Your achievements</span>
          </div>
        </section>

        <section className="courses-section" id="courses">
          <div className="section-heading">
            <div>
              <h2>Explore Courses</h2>
              <p>Choose a course and start learning something new.</p>
            </div>
            <span className="section-count">{filteredCourses.length} Courses</span>
          </div>

          <div className="course-grid">
            {filteredCourses.map((course) => {
              const CourseIcon = getCourseIcon(course.category);
              const isEnrolled = enrolledCourseIds.includes(course._id);

              return (
                <div className="course-card" key={course._id}>
                  <div className="course-art">
                    <CourseIcon size={55} />
                    <span>{course.category || "Programming"}</span>
                  </div>

                  <div className="course-details">
                    <p className="instructor">
                      {course.instructor?.name || "InfozaTech Instructor"}
                    </p>
                    <h3>{course.title}</h3>
                    <p>{course.description}</p>

                    <div className="progress-info">
                      <span>Level: {course.level || "Beginner"}</span>
                    </div>

                    <button
                      className="continue-btn"
                      onClick={() =>
                        isEnrolled
                          ? navigate(`/course/${course._id}`)
                          : handleEnroll(course._id)
                      }
                      disabled={enrollingId === course._id}
                    >
                      {enrollingId === course._id
                        ? "Enrolling..."
                        : isEnrolled
                          ? "Continue Learning"
                          : "Enroll Now"}
                      <ArrowRight size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {!loading && filteredCourses.length === 0 && (
            <div className="empty-state">
              <BookOpen size={35} />
              <h3>No courses found</h3>
              <p>Try searching with another course name.</p>
            </div>
          )}
        </section>

        <section className="courses-section" id="learning">
          <div className="section-heading">
            <div>
              <h2>My Learning</h2>
              <p>Continue your enrolled courses.</p>
            </div>
            <span className="section-count">{myCourses.length} Enrolled</span>
          </div>

          <div className="course-grid">
            {myCourses.map((item) => {
              const course = item.course || item;
              if (!course?._id) return null;

              const CourseIcon = getCourseIcon(course.category);

              return (
                <div className="course-card" key={item._id || course._id}>
                  <div className="course-art">
                    <CourseIcon size={55} />
                    <span>{course.category || "Course"}</span>
                  </div>

                  <div className="course-details">
                    <p className="instructor">Enrolled Course</p>
                    <h3>{course.title}</h3>
                    <p>{course.description}</p>
                    <div className="progress-info">
                      <span>Progress: {item.progress || 0}%</span>
                    </div>
                    <button
                      className="continue-btn"
                      onClick={() => navigate(`/course/${course._id}`)}
                    >
                      Continue Learning <ArrowRight size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {!loading && myCourses.length === 0 && (
            <div className="empty-state">
              <GraduationCap size={35} />
              <h3>No enrolled courses yet</h3>
              <p>Explore available courses and enroll to begin.</p>
              <button className="explore-btn" onClick={() => goToSection("courses")}>
                Explore Courses <ArrowRight size={16} />
              </button>
            </div>
          )}
        </section>

        <section className="info-section" id="quizzes">
          <div className="section-heading">
            <div>
              <h2>My Quizzes</h2>
              <p>Test your knowledge through course quizzes.</p>
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-icon purple-bg"><ClipboardList /></div>
            <div>
              <h3>Course Quizzes</h3>
              <p>Open your enrolled course and select a lesson to find its quiz.</p>
            </div>
            <button onClick={() => goToSection("learning")}>
              View My Courses <ArrowRight size={16} />
            </button>
          </div>
        </section>

        <section className="info-section" id="certificates">
          <div className="section-heading">
            <div>
              <h2>My Certificates</h2>
              <p>View certificates earned after completing courses.</p>
            </div>
            <button className="view-all" onClick={() => navigate("/certificates")}>
              Open Certificates <ArrowRight size={16} />
            </button>
          </div>

          <div className="feature-card">
            <div className="feature-icon orange-bg"><Award /></div>
            <div>
              <h3>{certificates.length} Certificates Available</h3>
              <p>Visit your certificates page to view or print your achievements.</p>
            </div>
            <button onClick={() => navigate("/certificates")}>
              View Certificates <ArrowRight size={16} />
            </button>
          </div>
        </section>

        <section className="info-section" id="profile">
          <div className="section-heading">
            <div>
              <h2>My Profile</h2>
              <p>Your account information.</p>
            </div>
          </div>

          <div className="profile-card">
            <div className="large-avatar">{userInitial}</div>
            <div>
              <h3>{userName}</h3>
              <p>{user?.email || "Student account"}</p>
              <span className="role-label">STUDENT</span>
            </div>
          </div>
        </section>

        <section className="info-section" id="settings">
          <div className="section-heading">
            <div>
              <h2>Settings</h2>
              <p>Manage your account session.</p>
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-icon blue-bg"><Settings /></div>
            <div>
              <h3>Account Settings</h3>
              <p>Log out safely from your InfozaTech student account.</p>
            </div>
            <button onClick={handleLogout}>
              Logout <LogOut size={16} />
            </button>
          </div>
        </section>

        <footer className="dashboard-footer">
          © 2026 InfozaTech. All rights reserved.
        </footer>
      </main>
    </div>
  );
}

export default Home;
