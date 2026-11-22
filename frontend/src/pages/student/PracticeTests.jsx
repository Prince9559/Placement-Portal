
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  Clock3,
  FileText,
  Search,
  Target,
  RefreshCw,
  ChevronRight,
  ClipboardCheck,
  Award,
} from "lucide-react";
import { toast } from "react-toastify";

import testService from "../../services/testService";
import "./PracticeTests.css";

const categories = [
  { value: "", label: "All Categories" },
  { value: "aptitude", label: "Aptitude" },
  { value: "reasoning", label: "Reasoning" },
  { value: "verbal", label: "Verbal Ability" },
  { value: "technical", label: "Technical" },
  { value: "mixed", label: "Mixed Tests" },
];

function PracticeTests() {
  const navigate = useNavigate();

  const [tests, setTests] = useState([]);
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [startingId, setStartingId] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });

  const fetchTests = useCallback(async (page = 1, isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const response = await testService.getTests({
        page,
        limit: 12,
        ...(category ? { category } : {}),
      });

      setTests(response.tests || []);
      setPagination({
        page: response.pagination?.page || page,
        totalPages: response.pagination?.totalPages || 1,
        total: response.pagination?.total || 0,
      });
    } catch (error) {
      console.error("Fetch tests error:", error);
      setTests([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [category]);

  useEffect(() => {
    fetchTests(1);
  }, [fetchTests]);

  const filteredTests = tests.filter((test) =>
    `${test.title || ""} ${test.description || ""} ${test.category || ""}`
      .toLowerCase()
      .includes(search.toLowerCase().trim())
  );

  const handleStartTest = async (test) => {
    try {
      setStartingId(test._id);

      const response = await testService.startTest(test._id);

      if (!response.attemptId) {
        throw new Error("Test attempt could not be created.");
      }

      toast.success(response.message || "Test started successfully!");
      navigate(`/student/tests/${test._id}/attempt`, {
        state: {
          attemptId: response.attemptId,
          startedAt: response.startedAt,
          expiresAt: response.expiresAt,
          durationMinutes: response.durationMinutes,
          questions: response.questions || [],
          testTitle: test.title,
          totalMarks: test.totalMarks,
        },
      });
    } catch (error) {
      console.error("Start test error:", error);
    } finally {
      setStartingId(null);
    }
  };

  const formatCategory = (value) => {
    if (!value) return "General";
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  return (
    <div className="practice-page">
      <header className="practice-header">
        <button className="practice-back-btn" onClick={() => navigate("/student/dashboard")}
        >
          <ArrowLeft size={18} />
          Dashboard
        </button>

        <div className="practice-header-actions">
          <span className="practice-header-label">STUDENT WORKSPACE</span>
          <button className="practice-refresh-btn" onClick={() => fetchTests(1, true)} disabled={refreshing}
            aria-label="Refresh tests"
          >
            <RefreshCw
              size={17}
              className={refreshing ? "practice-spin" : ""}
            />
          </button>
        </div>
      </header>

      <main className="practice-container">
        <section className="practice-hero">
          <div className="practice-hero-content">
            <span className="practice-eyebrow">
              <Target size={15} /> PREPARE. PRACTISE. SUCCEED.
            </span>
            <h1>Practice Tests</h1>
            <p>
              Challenge yourself with placement-focused tests and track your
              preparation journey.
            </p>
          </div>

          <div className="practice-hero-art">
            <div className="practice-hero-icon">
              <ClipboardCheck size={52} />
            </div>
            <div className="practice-hero-decoration decoration-one" />
            <div className="practice-hero-decoration decoration-two" />
          </div>
        </section>

        <section className="practice-stats">
          <div className="practice-stat-card">
            <div className="practice-stat-icon purple">
              <FileText size={21} />
            </div>
            <div>
              <span>Available Tests</span>
              <strong>{pagination.total}</strong>
            </div>
          </div>

          <div className="practice-stat-card">
            <div className="practice-stat-icon blue">
              <BookOpen size={21} />
            </div>
            <div>
              <span>Categories</span>
              <strong>{categories.length - 1}</strong>
            </div>
          </div>

          <div className="practice-stat-card">
            <div className="practice-stat-icon green">
              <Award size={21} />
            </div>
            <div>
              <span>Practice Mode</span>
              <strong>Online</strong>
            </div>
          </div>
        </section>

        <section className="practice-toolbar">
          <div className="practice-toolbar-heading">
            <div>
              <h2>Explore Tests</h2>
              <p>Choose a test and start practising</p>
            </div>
          </div>

          <div className="practice-filters">
            <div className="practice-search">
              <Search size={18} />
              <input type="text" placeholder="Search tests..." value={search} onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter by category"
            >
              {categories.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </section>

        {loading ? (
          <div className="practice-loading">
            <div className="practice-loader" />
            <p>Loading practice tests...</p>
          </div>
        ) : filteredTests.length > 0 ? (
          <>
            <div className="practice-results-info">
              Showing {filteredTests.length} of {pagination.total} tests
            </div>

            <section className="practice-test-grid">
              {filteredTests.map((test) => (
                <article className="practice-test-card" key={test._id}>
                  <div className="practice-card-top">
                    <div className="practice-card-icon">
                      <FileText size={23} />
                    </div>
                    <span className="practice-category-badge">
                      {formatCategory(test.category)}
                    </span>
                  </div>

                  <div className="practice-card-body">
                    <h3>{test.title}</h3>
                    <p>
                      {test.description ||
                        "Improve your skills with this placement preparation test."}
                    </p>
                  </div>

                  <div className="practice-card-meta">
                    <div>
                      <Clock3 size={16} />
                      <span>{test.durationMinutes || 0} min</span>
                    </div>
                    <div>
                      <BookOpen size={16} />
                      <span>{test.questionsCount ?? test.questions?.length ?? "—"} questions</span>
                    </div>
                    <div>
                      <Target size={16} />
                      <span>{test.totalMarks ?? 0} marks</span>
                    </div>
                  </div>

                  <div className="practice-card-footer">
                    <div className="practice-passing">
                      <span>Passing marks</span>
                      <strong>{test.passingMarks ?? "—"}</strong>
                    </div>

                    <button className="practice-start-btn" onClick={() => handleStartTest(test)} disabled={startingId === test._id}
                    >
                      {startingId === test._id ? (
                        "Starting..."
                      ) : (
                        <>
                          Start Test <ChevronRight size={17} />
                        </>
                      )}
                    </button>
                  </div>
                </article>
              ))}
            </section>

            {pagination.totalPages > 1 && (
              <div className="practice-pagination">
                <button disabled={pagination.page <= 1}  onClick={() => fetchTests(pagination.page - 1)}
                >
                  Previous
                </button>

                <span>
                  Page {pagination.page} of {pagination.totalPages}
                </span>

                <button disabled={pagination.page >= pagination.totalPages} onClick={() => fetchTests(pagination.page + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="practice-empty">
            <div className="practice-empty-icon">
              <FileText size={34} />
            </div>
            <h3>No tests found</h3>
            <p>
              {search
                ? "Try another search term or category."
                : "There are no active tests in this category right now."}
            </p>
            {search && (
              <button onClick={() => setSearch("")}>Clear Search</button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default PracticeTests;
