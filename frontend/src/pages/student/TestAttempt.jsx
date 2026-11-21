
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Clock3,
  CheckCircle2,
  Circle,
  Send,
  LoaderCircle,
  Trophy,
  RotateCcw,
} from "lucide-react";
import { toast } from "react-toastify";
import testService from "../../services/testService";
import "./TestAttempt.css";

function TestAttempt() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [attempt, setAttempt] = useState(location.state || null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [result, setResult] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const submittedRef = useRef(false);

  const loadAttempt = useCallback(async () => {
    try {
      setLoading(true);

      let data = attempt;

      // If the page was refreshed, ask the backend to resume the attempt.
      if (!data?.attemptId || !data?.questions?.length) {
        data = await testService.startTest(id);
      }

      if (!data?.attemptId || !data?.questions?.length) {
        throw new Error("Test questions could not be loaded.");
      }

      setAttempt(data);

      const expiry = new Date(data.expiresAt).getTime();
      setTimeLeft(
        Number.isFinite(expiry)
          ? Math.max(0, Math.floor((expiry - Date.now()) / 1000))
          : Math.max(0, Number(data.durationMinutes || 0) * 60)
      );
    } catch (error) {
      console.error("Load test attempt error:", error);
      toast.error(
        error.response?.data?.message || error.message || "Unable to load test."
      );
      navigate("/student/tests");
    } finally {
      setLoading(false);
    }
  }, [attempt, id, navigate]);

  useEffect(() => {
    loadAttempt();
  }, [loadAttempt]);

  const handleSubmit = useCallback(async (automatic = false) => {
    if (!attempt?.attemptId || submittedRef.current || submitting) return;

    if (!automatic) {
      const unanswered = (attempt.questions || []).filter(
        (question) => answers[question._id] === undefined
      ).length;

      if (unanswered > 0) {
        const confirmed = window.confirm(
          `You have ${unanswered} unanswered question(s). Submit anyway?`
        );
        if (!confirmed) return;
      }
    }

    submittedRef.current = true;
    setSubmitting(true);

    try {
      const formattedAnswers = Object.entries(answers).map(
        ([questionId, selectedOptionIndex]) => ({
          questionId,
          selectedOptionIndex,
        })
      );

      const response = await testService.submitTest(
        attempt.attemptId,
        formattedAnswers
      );

      setResult(response.result || response);
      toast.success(
        automatic ? "Time is up. Your test was submitted." : "Test submitted successfully!"
      );
    } catch (error) {
      submittedRef.current = false;
      console.error("Submit test error:", error);
      toast.error(
        error.response?.data?.message || "Unable to submit test. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }, [answers, attempt, submitting]);

  useEffect(() => {
    if (loading || result || !attempt?.expiresAt) return;

    const updateTimer = () => {
      const remaining = Math.max(
        0,
        Math.floor((new Date(attempt.expiresAt).getTime() - Date.now()) / 1000)
      );

      setTimeLeft(remaining);

      if (remaining <= 0 && !submittedRef.current) {
        handleSubmit(true);
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, [attempt, handleSubmit, loading, result]);

  const selectAnswer = (questionId, optionIndex) => {
    if (result || submitting) return;

    setAnswers((previous) => ({
      ...previous,
      [questionId]: optionIndex,
    }));
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  const questions = attempt?.questions || [];
  const activeQuestion = questions[currentQuestion];
  const answeredCount = Object.keys(answers).length;

  if (loading) {
    return (
      <div className="attempt-loading">
        <LoaderCircle className="spin-icon" size={38} />
        <h2>Preparing your test...</h2>
        <p>Please wait while we load your questions.</p>
      </div>
    );
  }

  if (result) {
    const score = result.score ?? result.marksObtained ?? result.totalScore;
    const totalMarks = result.totalMarks ?? attempt?.totalMarks;

    return (
      <main className="attempt-result-page">
        <section className="attempt-result-card">
          <div className="result-trophy">
            <Trophy size={38} />
          </div>

          <span className="result-eyebrow">TEST COMPLETED</span>
          <h1>Your test has been submitted!</h1>
          <p>Your answers have been recorded successfully.</p>

          {score !== undefined && (
            <div className="result-score">
              <strong>{score}</strong>
              {totalMarks !== undefined && <span>/ {totalMarks}</span>}
              <small>Score</small>
            </div>
          )}

          <button
            className="attempt-primary-btn"
            onClick={() => navigate("/student/tests")}
          >
            <RotateCcw size={18} />
            Back to Practice Tests
          </button>
        </section>
      </main>
    );
  }

  if (!activeQuestion) {
    return (
      <div className="attempt-loading">
        <h2>No questions available</h2>
        <button onClick={() => navigate("/student/tests")}>
          Back to Tests
        </button>
      </div>
    );
  }

  return (
    <main className="attempt-page">
      <header className="attempt-header">
        <button
          className="attempt-back-btn"
          onClick={() => navigate("/student/tests")}
        >
          <ArrowLeft size={18} />
          Exit Test
        </button>

        <div className="attempt-heading">
          <span>PLACEMENT PORTAL</span>
          <h1>{attempt.testTitle || "Practice Test"}</h1>
        </div>

        <div className={`attempt-timer ${timeLeft <= 60 ? "timer-warning" : ""}`}>
          <Clock3 size={19} />
          <div>
            <small>Time Remaining</small>
            <strong>{formatTime(timeLeft)}</strong>
          </div>
        </div>
      </header>

      <section className="attempt-layout">
        <div className="attempt-main">
          <div className="attempt-progress-card">
            <div>
              <span>Test Progress</span>
              <strong>{answeredCount} of {questions.length} answered</strong>
            </div>
            <div className="attempt-progress-track">
              <div
                style={{
                  width: `${questions.length ? (answeredCount / questions.length) * 100 : 0}%`,
                }}
              />
            </div>
          </div>

          <article className="attempt-question-card">
            <div className="question-card-top">
              <span>QUESTION {currentQuestion + 1} OF {questions.length}</span>
              <span>{activeQuestion.marks || 1} Mark(s)</span>
            </div>

            <h2>{activeQuestion.question}</h2>

            <div className="attempt-options">
              {(activeQuestion.options || []).map((option, index) => {
                const selected = answers[activeQuestion._id] === index;

                return (
                  <button
                    type="button"
                    key={index}
                    className={`attempt-option ${selected ? "selected" : ""}`}
                    onClick={() => selectAnswer(activeQuestion._id, index)}
                    disabled={submitting}
                  >
                    {selected ? (
                      <CheckCircle2 size={20} />
                    ) : (
                      <Circle size={20} />
                    )}
                    <span className="option-letter">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="option-text">
                      {typeof option === "string"
                        ? option
                        : option.text || option.option || ""}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="attempt-question-actions">
              <button
                className="attempt-secondary-btn"
                disabled={currentQuestion === 0}
                onClick={() => setCurrentQuestion((value) => value - 1)}
              >
                Previous
              </button>

              {currentQuestion < questions.length - 1 ? (
                <button
                  className="attempt-primary-btn"
                  onClick={() => setCurrentQuestion((value) => value + 1)}
                >
                  Next Question
                </button>
              ) : (
                <button
                  className="attempt-submit-btn"
                  onClick={() => handleSubmit(false)}
                  disabled={submitting}
                >
                  {submitting ? (
                    <LoaderCircle className="spin-icon" size={18} />
                  ) : (
                    <Send size={18} />
                  )}
                  Submit Test
                </button>
              )}
            </div>
          </article>
        </div>

        <aside className="attempt-sidebar">
          <div className="question-navigation-card">
            <h3>Question Palette</h3>
            <p>Select a question to navigate.</p>

            <div className="question-number-grid">
              {questions.map((question, index) => (
                <button
                  key={question._id}
                  className={[
                    "question-number",
                    currentQuestion === index ? "current" : "",
                    answers[question._id] !== undefined ? "answered" : "",
                  ].join(" ")}
                  onClick={() => setCurrentQuestion(index)}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            <div className="palette-legend">
              <span><i className="legend-current" /> Current</span>
              <span><i className="legend-answered" /> Answered</span>
              <span><i className="legend-pending" /> Not answered</span>
            </div>

            <div className="palette-summary">
              <div>
                <span>Answered</span>
                <strong>{answeredCount}</strong>
              </div>
              <div>
                <span>Remaining</span>
                <strong>{questions.length - answeredCount}</strong>
              </div>
            </div>

            <button
              className="attempt-submit-btn sidebar-submit"
              onClick={() => handleSubmit(false)}
              disabled={submitting}
            >
              <Send size={17} />
              Submit Test
            </button>
          </div>
        </aside>
      </section>
    </main>
  );
}

export default TestAttempt;
