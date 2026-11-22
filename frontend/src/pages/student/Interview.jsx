
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Users,
  Code2,
  BriefcaseBusiness,
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-toastify";
import interviewService from "../../services/interviewService";
import "./Interview.css";

const categories = [
  { value: "all", label: "All Topics" },
  { value: "hr", label: "HR Interview" },
  { value: "technical", label: "Technical Interview" },
  { value: "behavioral", label: "Behavioral Interview" },
  { value: "managerial", label: "Managerial Interview" },
];

const categoryIcons = {
  hr: Users,
  technical: Code2,
  behavioral: MessageSquare,
  managerial: BriefcaseBusiness,
};

const LIMIT = 10;

function Interview() {
  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [questions, setQuestions] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: LIMIT,
    totalPages: 0,
  });

  const [page, setPage] = useState(1);
  const [openQuestion, setOpenQuestion] = useState(null);
  const [answers, setAnswers] = useState({});

  const [loading, setLoading] = useState(true);
  const [answerLoading, setAnswerLoading] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        page,
        limit: LIMIT,
      };

      if (activeCategory !== "all") {
        params.category = activeCategory;
      }

      if (difficulty !== "all") {
        params.difficulty = difficulty;
      }

      if (debouncedSearch.trim()) {
        params.topic = debouncedSearch.trim();
      }

      const response = await interviewService.getQuestions(params);

      setQuestions(response.questions || []);

      setPagination(
        response.pagination || {
          total: 0,
          page: 1,
          limit: LIMIT,
          totalPages: 0,
        }
      );

      setOpenQuestion(null);
    } catch (err) {
      console.error("Interview questions error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load interview questions."
      );
    } finally {
      setLoading(false);
    }
  }, [activeCategory, difficulty, debouncedSearch, page]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    setPage(1);
  };

  const handleDifficultyChange = (value) => {
    setDifficulty(value);
    setPage(1);
  };

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleQuestionClick = async (questionId) => {
    if (openQuestion === questionId) {
      setOpenQuestion(null);
      return;
    }

    setOpenQuestion(questionId);

    if (answers[questionId]) {
      return;
    }

    try {
      setAnswerLoading(questionId);

      const response = await interviewService.getAnswer(questionId);

      setAnswers((previous) => ({
        ...previous,
        [questionId]: response.answer,
      }));
    } catch (err) {
      console.error("Interview answer error:", err);

      toast.error(
        err.response?.data?.message ||
          "Unable to load the answer."
      );

      setOpenQuestion(null);
    } finally {
      setAnswerLoading(null);
    }
  };

  const getCategoryLabel = (category) => {
    return (
      categories.find((item) => item.value === category)?.label ||
      category
    );
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage((previous) => previous - 1);
    }
  };

  const handleNextPage = () => {
    if (page < pagination.totalPages) {
      setPage((previous) => previous + 1);
    }
  };

  return (
    <div className="interview-page">

      <button type="button" className="interview-dashboard-btn"
        onClick={() => navigate("/student/dashboard")}
      >
        <ArrowLeft size={18} />
        <span>Dashboard</span>
      </button>

      <header className="interview-header">
        <div>
          <span className="interview-eyebrow">
            CAREER DEVELOPMENT
          </span>
          <h1>Interview Preparation</h1>
          <p>
            Prepare confidently for HR, technical and other interviews.
          </p>
        </div>

        <div className="interview-header-icon">
          <MessageSquare size={34} />
        </div>
      </header>

      <section className="interview-welcome">
        <h2>Prepare. Practise. Succeed.</h2>
        <p>
          Explore common interview questions and learn how to structure
          your answers.
        </p>
      </section>

      <section className="interview-content">
        <div className="interview-section-heading">
          <div>
            <h2>Interview Questions</h2>
            <p>
              Select a category and difficulty to explore questions.
            </p>
          </div>
        </div>

        <div className="interview-tabs">
          {categories.map((category) => (
            <button key={category.value}
              className={
                activeCategory === category.value ? "active" : ""
              }
              onClick={() =>
                handleCategoryChange(category.value)
              }
            >
              {category.label}
            </button>
          ))}
        </div>

        <div className="interview-filters">
          <div className="interview-search">
            <Search size={18} />

            <input type="text" placeholder="Search by topic..." value={search} onChange={(event) =>
                handleSearchChange(event.target.value)
              }
            />
          </div>

          <select
            value={difficulty}
            onChange={(event) =>
              handleDifficultyChange(event.target.value)
            }
            aria-label="Filter by difficulty"
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        {loading ? (
          <div className="interview-loading">
            <Loader2 size={28} className="interview-spinner" />
            <p>Loading interview questions...</p>
          </div>
        ) : error ? (
          <div className="interview-empty">
            <p>{error}</p>
            <button onClick={fetchQuestions}>Try Again</button>
          </div>
        ) : questions.length === 0 ? (
          <div className="interview-empty">
            <MessageSquare size={32} />
            <h3>No Questions Found</h3>
            <p>
              No interview questions are available for the selected
              filters.
            </p>
          </div>
        ) : (
          <>
            <div className="interview-topic-list">
              {questions.map((question) => {
                const Icon =
                  categoryIcons[question.category] ||
                  MessageSquare;

                const isOpen = openQuestion === question._id;
                const answer = answers[question._id];

                return (
                  <article className="interview-topic-card" key={question._id}
                  >
                    <div className="interview-topic-heading">
                      <div className="interview-topic-icon">
                        <Icon size={21} />
                      </div>

                      <div>
                        <h3>
                          {getCategoryLabel(question.category)}
                        </h3>

                        <span>
                          {question.topic} ·{" "}
                          {question.difficulty || "medium"}
                        </span>
                      </div>
                    </div>

                    <div className="interview-question-list">
                      <div className="interview-question">
                        <button
                          className="interview-question-toggle"
                          onClick={() =>
                            handleQuestionClick(question._id)
                          }
                        >
                          <span>{question.question}</span>

                          {isOpen ? (
                            <ChevronUp size={19} />
                          ) : (
                            <ChevronDown size={19} />
                          )}
                        </button>

                        {isOpen && (
                          <div className="interview-answer">
                            {answerLoading === question._id ? (
                              <div className="interview-answer-loading">
                                <Loader2
                                  size={20}
                                  className="interview-spinner"
                                />
                                <span>Loading answer...</span>
                              </div>
                            ) : answer ? (
                              <>
                                <strong>Suggested Answer</strong>
                                <p>{answer.answer}</p>

                                {answer.sampleAnswer && (
                                  <>
                                    <strong>Sample Answer</strong>
                                    <p>{answer.sampleAnswer}</p>
                                  </>
                                )}

                                {answer.tips?.length > 0 && (
                                  <>
                                    <strong>Interview Tips</strong>
                                    <ul>
                                      {answer.tips.map(
                                        (tip, index) => (
                                          <li key={index}>
                                            {tip}
                                          </li>
                                        )
                                      )}
                                    </ul>
                                  </>
                                )}
                              </>
                            ) : null}
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {pagination.totalPages > 1 && (
              <div className="interview-pagination">
                <button
                  className="interview-pagination-btn"
                  onClick={handlePreviousPage}
                  disabled={page <= 1 || loading}
                >
                  <ChevronLeft size={18} />
                  <span>Previous</span>
                </button>

                <span className="interview-pagination-info">
                  Page {pagination.page} of{" "}
                  {pagination.totalPages}
                </span>

                <button
                  className="interview-pagination-btn"
                  onClick={handleNextPage}
                  disabled={
                    page >= pagination.totalPages || loading
                  }
                >
                  <span>Next</span>
                  <ChevronRight size={18} />
                </button>
              </div>
            )}

            <div className="interview-total-count">
              Showing {questions.length} of {pagination.total} questions
            </div>
          </>
        )}
      </section>
    </div>
  );
}

export default Interview;
