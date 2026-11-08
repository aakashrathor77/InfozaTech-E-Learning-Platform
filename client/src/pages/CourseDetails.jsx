
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle,
  ClipboardList,
  Award
} from "lucide-react";
import API from "../api";
import "./CourseDetails.css";

function CourseDetails() {
  const { courseId } = useParams();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState("");

  const [activeLesson, setActiveLesson] = useState("");
  const [quizzes, setQuizzes] = useState([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState("");
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState({});
  const [submittingId, setSubmittingId] = useState("");

  const fetchData = async () => {
    try {
      const [courseRes, lessonsRes, enrollmentsRes] = await Promise.all([
        API.get(`/courses/${courseId}`),
        API.get(`/lessons/course/${courseId}`),
        API.get("/enrollments/my-courses")
      ]);

      setCourse(courseRes.data);
      setLessons(lessonsRes.data);

      const currentEnrollment = enrollmentsRes.data.find(
        (item) => item.course?._id === courseId
      );

      setEnrollment(currentEnrollment || null);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load course."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [courseId]);

  const completeLesson = async (lessonId) => {
    if (!enrollment) {
      alert("Please enroll in this course first.");
      return;
    }

    try {
      setUpdatingId(lessonId);

      await API.put(
        `/enrollments/${enrollment._id}/progress`,
        { lessonId }
      );

      await fetchData();
      alert("Lesson completed successfully!");
    } catch (err) {
      alert(
        err.response?.data?.message || "Could not update progress."
      );
    } finally {
      setUpdatingId("");
    }
  };

  const openQuiz = async (lessonId) => {
    if (!enrollment) {
      alert("Please enroll in this course first.");
      return;
    }

    if (activeLesson === lessonId) {
      setActiveLesson("");
      return;
    }

    setActiveLesson(lessonId);
    setQuizLoading(true);
    setQuizError("");
    setQuizzes([]);

    try {
      const response = await API.get(`/quizzes/lesson/${lessonId}`);
      setQuizzes(response.data);
    } catch (err) {
      setQuizError(
        err.response?.data?.message || "Unable to load quizzes."
      );
    } finally {
      setQuizLoading(false);
    }
  };

  const selectAnswer = (quizId, questionIndex, optionIndex) => {
    setAnswers((previous) => ({
      ...previous,
      [quizId]: {
        ...previous[quizId],
        [questionIndex]: optionIndex
      }
    }));
  };

  const submitQuiz = async (quiz) => {
    const quizAnswers = answers[quiz._id] || {};

    if (Object.keys(quizAnswers).length !== quiz.questions.length) {
      alert("Please answer every question before submitting.");
      return;
    }

    const answerList = quiz.questions.map(
      (_, index) => quizAnswers[index]
    );

    try {
      setSubmittingId(quiz._id);

      const response = await API.post(
        `/quizzes/${quiz._id}/submit`,
        { answers: answerList }
      );

      setResults((previous) => ({
        ...previous,
        [quiz._id]: response.data
      }));
    } catch (err) {
      alert(
        err.response?.data?.message || "Unable to submit quiz."
      );
    } finally {
      setSubmittingId("");
    }
  };

  if (loading) {
    return <div className="course-details-page">Loading course...</div>;
  }

  if (error) {
    return <div className="course-details-page">{error}</div>;
  }

  if (!course) {
    return <div className="course-details-page">Course not found.</div>;
  }

  const completedIds =
    enrollment?.completedLessons?.map(
      (lesson) => lesson._id || lesson
    ) || [];

  return (
    <div className="course-details-page">
      <Link to="/my-courses" className="back-link">
        <ArrowLeft size={18} /> My Courses
      </Link>

      <div className="course-details-header">
        <BookOpen size={35} />

        <h1>{course.title}</h1>
        <p>{course.description}</p>

        <div className="course-progress-summary">
          <strong>{enrollment?.progress || 0}% Completed</strong>

          <div className="my-progress-track">
            <div
              className="my-progress-fill"
              style={{
                width: `${enrollment?.progress || 0}%`
              }}
            />
          </div>
        </div>
      </div>

      <section className="lessons-section">
        <h2>Course Lessons</h2>

        {lessons.length === 0 && (
          <p>No lessons have been added yet.</p>
        )}

        {lessons.map((lesson, index) => {
          const isCompleted = completedIds.includes(lesson._id);

          return (
            <div className="lesson-card" key={lesson._id}>
              <div className="lesson-number">{index + 1}</div>

              <div className="lesson-info">
                <h3>{lesson.title}</h3>
                <p>{lesson.content}</p>
              </div>

              {isCompleted ? (
                <span className="lesson-completed">
                  <CheckCircle size={17} /> Completed
                </span>
              ) : (
                <button
                  className="lesson-complete-btn"
                  disabled={updatingId === lesson._id}
                  onClick={() => completeLesson(lesson._id)}
                >
                  {updatingId === lesson._id
                    ? "Saving..."
                    : "Complete Lesson"}
                </button>
              )}

              {enrollment && (
                <button
                  type="button"
                  className="lesson-complete-btn"
                  onClick={() => openQuiz(lesson._id)}
                >
                  <ClipboardList size={16} />
                  {activeLesson === lesson._id
                    ? "Hide Quiz"
                    : "Take Quiz"}
                </button>
              )}

              {activeLesson === lesson._id && (
                <div
                  style={{
                    flexBasis: "100%",
                    width: "100%",
                    marginTop: "18px",
                    padding: "20px",
                    background: "#f8faff",
                    border: "1px solid #dbeafe",
                    borderRadius: "12px"
                  }}
                >
                  <h3>Lesson Quiz</h3>

                  {quizLoading && <p>Loading quizzes...</p>}

                  {quizError && (
                    <p style={{ color: "#dc2626" }}>{quizError}</p>
                  )}

                  {!quizLoading && !quizError && quizzes.length === 0 && (
                    <p>No quizzes available for this lesson yet.</p>
                  )}

                  {quizzes.map((quiz) => {
                    const result = results[quiz._id];

                    return (
                      <div key={quiz._id} style={{ marginTop: "18px" }}>
                        <h3>{quiz.title}</h3>

                        {quiz.questions.map((question, questionIndex) => (
                          <div
                            key={questionIndex}
                            style={{
                              background: "#fff",
                              padding: "16px",
                              borderRadius: "10px",
                              marginTop: "14px",
                              border: "1px solid #e2e8f0"
                            }}
                          >
                            <strong>
                              {questionIndex + 1}. {question.question}
                            </strong>

                            {question.options.map((option, optionIndex) => (
                              <label
                                key={optionIndex}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "10px",
                                  padding: "10px",
                                  marginTop: "7px",
                                  border: "1px solid #e2e8f0",
                                  borderRadius: "8px",
                                  cursor: result ? "default" : "pointer"
                                }}
                              >
                                <input
                                  type="radio"
                                  name={`${quiz._id}-${questionIndex}`}
                                  checked={
                                    answers[quiz._id]?.[questionIndex] ===
                                    optionIndex
                                  }
                                  disabled={!!result}
                                  onChange={() =>
                                    selectAnswer(
                                      quiz._id,
                                      questionIndex,
                                      optionIndex
                                    )
                                  }
                                />
                                {option}
                              </label>
                            ))}
                          </div>
                        ))}

                        {!result ? (
                          <button
                            type="button"
                            className="lesson-complete-btn"
                            style={{ marginTop: "18px" }}
                            disabled={submittingId === quiz._id}
                            onClick={() => submitQuiz(quiz)}
                          >
                            {submittingId === quiz._id
                              ? "Submitting..."
                              : "Submit Quiz"}
                          </button>
                        ) : (
                          <div
                            style={{
                              marginTop: "18px",
                              padding: "18px",
                              background: "#ecfdf5",
                              border: "1px solid #bbf7d0",
                              borderRadius: "10px"
                            }}
                          >
                            <Award size={28} color="#15803d" />
                            <h3 style={{ color: "#15803d" }}>
                              Quiz Completed!
                            </h3>
                            <p>
                              Your Score: <strong>{result.score} / {result.total}</strong>
                            </p>
                            <p>
                              Percentage: <strong>{result.percentage}%</strong>
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </section>
    </div>
  );
}

export default CourseDetails;
