
import "./CreateQuiz.css";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api";

const CreateQuiz = () => {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingLessons, setFetchingLessons] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    course: "",
    lesson: "",
    title: "",
    questions: [
      {
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0
      }
    ]
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await API.get("/courses");

      const data = Array.isArray(response.data)
        ? response.data
        : response.data.courses ||
          response.data.value ||
          [];

      const user = JSON.parse(localStorage.getItem("user") || "{}");

      const instructorCourses = data.filter((course) => {
        const instructorId =
          typeof course.instructor === "object"
            ? course.instructor?._id
            : course.instructor;

        return String(instructorId) === String(user._id);
      });

      setCourses(instructorCourses);
    } catch (err) {
      console.error("Courses Error:", err.response?.data || err);
      setError("Unable to load courses.");
    }
  };

  const fetchLessons = async (courseId) => {
    setFetchingLessons(true);
    setLessons([]);

    try {
      const response = await API.get(
        `/lessons/course/${courseId}`
      );

      const data = Array.isArray(response.data)
        ? response.data
        : response.data.lessons ||
          response.data.value ||
          [];

      setLessons(data);
    } catch (err) {
      console.error("Lessons Error:", err.response?.data || err);
      setError("Unable to load lessons.");
    } finally {
      setFetchingLessons(false);
    }
  };

  const handleCourseChange = (e) => {
    const courseId = e.target.value;

    setFormData((prev) => ({
      ...prev,
      course: courseId,
      lesson: ""
    }));

    setLessons([]);
    setMessage("");
    setError("");

    if (courseId) {
      fetchLessons(courseId);
    }
  };

  const handleQuestionChange = (index, value) => {
    setFormData((prev) => {
      const questions = [...prev.questions];
      questions[index] = {
        ...questions[index],
        question: value
      };

      return { ...prev, questions };
    });
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    setFormData((prev) => {
      const questions = [...prev.questions];
      const options = [...questions[questionIndex].options];

      options[optionIndex] = value;
      questions[questionIndex] = {
        ...questions[questionIndex],
        options
      };

      return { ...prev, questions };
    });
  };

  const handleCorrectAnswerChange = (questionIndex, value) => {
    setFormData((prev) => {
      const questions = [...prev.questions];

      questions[questionIndex] = {
        ...questions[questionIndex],
        correctAnswer: Number(value)
      };

      return { ...prev, questions };
    });
  };

  const addQuestion = () => {
    setFormData((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          question: "",
          options: ["", "", "", ""],
          correctAnswer: 0
        }
      ]
    }));
  };

  const removeQuestion = (index) => {
    if (formData.questions.length === 1) return;

    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (
      !formData.course ||
      !formData.lesson ||
      !formData.title.trim()
    ) {
      setError("Please select a course, lesson and enter quiz title.");
      return;
    }

    if (formData.questions.length === 0) {
      setError("Please add at least one question.");
      return;
    }

    const invalidQuestion = formData.questions.some(
      (q) =>
        !q.question.trim() ||
        q.options.length !== 4 ||
        q.options.some((option) => !option.trim()) ||
        !Number.isInteger(q.correctAnswer) ||
        q.correctAnswer < 0 ||
        q.correctAnswer > 3
    );

    if (invalidQuestion) {
      setError("Please fill all questions and four options, and select the correct answer.");
      return;
    }

    const quizData = {
      course: formData.course,
      lesson: formData.lesson,
      title: formData.title.trim(),
      questions: formData.questions
    };

    console.log("Quiz Data:", quizData);

    try {
      setLoading(true);

      const response = await API.post("/quizzes", quizData);

      setMessage(
        response.data.message || "Quiz created successfully!"
      );

      setFormData({
        course: "",
        lesson: "",
        title: "",
        questions: [
          {
            question: "",
            options: ["", "", "", ""],
            correctAnswer: 0
          }
        ]
      });

      setLessons([]);
    } catch (err) {
      console.error(
        "Quiz Error:",
        err.response?.data || err
      );

      setError(
        err.response?.data?.message ||
        "Unable to create quiz. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-quiz-page">
      <div className="create-quiz-header">
        <div>
          <h1>Create Quiz</h1>
          <p>Create a quiz for your course lessons.</p>
        </div>

        <Link to="/instructor" className="back-button">
          Back to Dashboard
        </Link>
      </div>

      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="create-quiz-form">
        <div className="form-group">
          <label>Quiz Title</label>
          <input
            type="text"
            placeholder="Enter quiz title"
            value={formData.title}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                title: e.target.value
              }))
            }
            required
          />
        </div>

        <div className="form-group">
          <label>Select Course</label>
          <select
            value={formData.course}
            onChange={handleCourseChange}
            required
          >
            <option value="">Choose a course</option>
            {courses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Select Lesson</label>
          <select
            value={formData.lesson}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                lesson: e.target.value
              }))
            }
            disabled={!formData.course || fetchingLessons}
            required
          >
            <option value="">
              {fetchingLessons
                ? "Loading lessons..."
                : "Choose a lesson"}
            </option>

            {lessons.map((lesson) => (
              <option key={lesson._id} value={lesson._id}>
                {lesson.title}
              </option>
            ))}
          </select>

          {formData.course && !fetchingLessons && lessons.length === 0 && (
            <p>No lessons found for this course.</p>
          )}
        </div>

        <div className="questions-heading">
          <h2>Quiz Questions</h2>
        </div>

        {formData.questions.map((question, questionIndex) => (
          <div className="question-card" key={questionIndex}>
            <div className="question-card-header">
              <h3>Question {questionIndex + 1}</h3>

              {formData.questions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeQuestion(questionIndex)}
                  className="remove-question-button"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="form-group">
              <label>Question</label>
              <textarea
                placeholder="Enter your question"
                value={question.question}
                onChange={(e) =>
                  handleQuestionChange(questionIndex, e.target.value)
                }
                required
              />
            </div>

            <div className="options-grid">
              {question.options.map((option, optionIndex) => (
                <div className="form-group" key={optionIndex}>
                  <label>Option {optionIndex + 1}</label>
                  <input
                    type="text"
                    placeholder={`Enter option ${optionIndex + 1}`}
                    value={option}
                    onChange={(e) =>
                      handleOptionChange(
                        questionIndex,
                        optionIndex,
                        e.target.value
                      )
                    }
                    required
                  />
                </div>
              ))}
            </div>

            <div className="form-group">
              <label>Correct Answer</label>
              <select
                value={question.correctAnswer}
                onChange={(e) =>
                  handleCorrectAnswerChange(
                    questionIndex,
                    e.target.value
                  )
                }
              >
                <option value={0}>Option 1</option>
                <option value={1}>Option 2</option>
                <option value={2}>Option 3</option>
                <option value={3}>Option 4</option>
              </select>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addQuestion}
          className="add-question-button"
        >
          + Add Another Question
        </button>

        <button
          type="submit"
          className="submit-quiz-button"
          disabled={loading}
        >
          {loading ? "Creating Quiz..." : "Create Quiz"}
        </button>
      </form>
    </div>
  );
};

export default CreateQuiz;
