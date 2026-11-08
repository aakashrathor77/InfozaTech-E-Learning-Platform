import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen } from "lucide-react";
import API from "../api";

function AddLesson() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    course: "",
    title: "",
    content: "",
    videoUrl: "",
    order: 1
  });

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError("");

        const user = JSON.parse(
          localStorage.getItem("user") || "null"
        );

        if (!user?._id) {
          setError("Please login again.");
          return;
        }

        const response = await API.get("/courses");

        const allCourses = Array.isArray(response.data)
          ? response.data
          : response.data?.courses ||
            response.data?.value ||
            [];

        const myCourses = allCourses.filter((course) => {
          const instructorId =
            typeof course.instructor === "object"
              ? course.instructor?._id
              : course.instructor;

          return String(instructorId) === String(user._id);
        });

        setCourses(myCourses);

        if (myCourses.length === 0) {
          setError("No courses found. Please create a course first.");
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
          "Unable to load courses."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value
    }));

    setMessage("");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!formData.course) {
      setError("Please select a course.");
      return;
    }

    if (!formData.title.trim() || !formData.content.trim()) {
      setError("Please enter lesson title and content.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await API.post("/lessons", {
        course: formData.course,
        title: formData.title.trim(),
        content: formData.content.trim(),
        videoUrl: formData.videoUrl.trim(),
        order: Number(formData.order)
      });

      setMessage(
        response.data?.message || "Lesson added successfully!"
      );

      setFormData((previousData) => ({
        ...previousData,
        title: "",
        content: "",
        videoUrl: "",
        order: Number(previousData.order) + 1
      }));
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to add lesson."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "750px",
        margin: "40px auto",
        padding: "25px"
      }}
    >
      <Link
        to="/instructor"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "5px",
          marginBottom: "20px",
          textDecoration: "none"
        }}
      >
        <ArrowLeft size={18} />
        Back to Instructor Dashboard
      </Link>

      <h1
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px"
        }}
      >
        <BookOpen size={28} />
        Add Course Lesson
      </h1>

      <p>Add learning content to your course.</p>

      {message && (
        <p style={{ color: "green", margin: "15px 0" }}>
          {message}
        </p>
      )}

      {error && (
        <p style={{ color: "red", margin: "15px 0" }}>
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <label>Select Course</label>

        <select
          name="course"
          value={formData.course}
          onChange={handleChange}
          required
          disabled={loading || courses.length === 0}
          style={{
            display: "block",
            width: "100%",
            padding: "12px",
            margin: "10px 0 20px"
          }}
        >
          <option value="">
            {loading ? "Loading courses..." : "Choose a course"}
          </option>

          {courses.map((course) => (
            <option key={course._id} value={course._id}>
              {course.title}
            </option>
          ))}
        </select>

        <label>Lesson Title</label>

        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Enter lesson title"
          required
          style={{
            display: "block",
            width: "100%",
            padding: "12px",
            margin: "10px 0 20px",
            boxSizing: "border-box"
          }}
        />

        <label>Lesson Content</label>

        <textarea
          name="content"
          value={formData.content}
          onChange={handleChange}
          placeholder="Write lesson content"
          required
          rows={5}
          style={{
            display: "block",
            width: "100%",
            padding: "12px",
            margin: "10px 0 20px",
            boxSizing: "border-box"
          }}
        />

        <label>Video URL (Optional)</label>

        <input
          type="url"
          name="videoUrl"
          value={formData.videoUrl}
          onChange={handleChange}
          placeholder="Enter video URL"
          style={{
            display: "block",
            width: "100%",
            padding: "12px",
            margin: "10px 0 20px",
            boxSizing: "border-box"
          }}
        />

        <label>Lesson Order</label>

        <input
          type="number"
          name="order"
          min="1"
          value={formData.order}
          onChange={handleChange}
          required
          style={{
            display: "block",
            width: "100%",
            padding: "12px",
            margin: "10px 0 20px",
            boxSizing: "border-box"
          }}
        />

        <button
          type="submit"
          disabled={loading || submitting || courses.length === 0}
          style={{
            padding: "12px 25px",
            cursor: submitting ? "not-allowed" : "pointer"
          }}
        >
          {submitting ? "Adding Lesson..." : "Add Lesson"}
        </button>
      </form>
    </div>
  );
}

export default AddLesson;