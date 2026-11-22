
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {ArrowLeft, Award, BookOpen, CheckCircle2, Clock3, Search,TrendingUp, XCircle, RefreshCw, ChevronRight, ClipboardList,} from "lucide-react";
import { toast } from "react-toastify";
import testService from "../../services/testService";
import "./TestResult.css";

function Results() {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const fetchResults = useCallback(async (refresh = false) => {
    try {
      if (refresh) setRefreshing(true);
      else setLoading(true);

      const response = await testService.getMyResults();
      setResults(response.results || []);
    } catch (error) {
      console.error("Fetch results error:", error);
      toast.error(error.response?.data?.message || "Unable to load your results.");
      setResults([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const stats = useMemo(() => {
    if (!results.length) {
      return { total: 0, average: 0, passed: 0, failed: 0 };
    }

    const average =
      results.reduce((sum, item) => sum + Number(item.percentage || 0), 0) /
      results.length;

    return {
      total: results.length,
      average: average.toFixed(1),
      passed: results.filter((item) => item.passed).length,
      failed: results.filter((item) => !item.passed).length,
    };
  }, [results]);

  const filteredResults = useMemo(() => {
    const term = search.trim().toLowerCase();

    return results.filter((item) => {
      const title = item.test?.title || "Practice Test";
      const category = item.test?.category || "";
      const matchesSearch = `${title} ${category}`.toLowerCase().includes(term);

      const matchesFilter =
        filter === "all" ||
        (filter === "passed" && item.passed) ||
        (filter === "failed" && !item.passed);

      return matchesSearch && matchesFilter;
    });
  }, [results, search, filter]);

  const formatDate = (date) => {
    if (!date) return "Date unavailable";
    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCategory = (category) =>
    category ? category.charAt(0).toUpperCase() + category.slice(1) : "General";

  return (
    <main className="results-page">
      <header className="results-header">
        <div className="results-header-inner">
          <button className="results-back-btn" onClick={() => navigate("/student/dashboard")}
          >
            <ArrowLeft size={18} />
            Dashboard
          </button>

          <div className="results-heading">
            <span>YOUR PERFORMANCE</span>
            <h1>My Test Results</h1>
            <p>Track your progress and review your completed tests.</p>
          </div>

          <button className="results-refresh-btn" onClick={() => fetchResults(true)} disabled={refreshing}
          >
            <RefreshCw size={17} className={refreshing ? "results-spin" : ""} />
            Refresh
          </button>
        </div>
      </header>

      <section className="results-content">
        <div className="results-stats-grid">
          <div className="results-stat-card">
            <div className="results-stat-icon purple"><ClipboardList size={21} /></div>
            <div><span>Tests Completed</span><strong>{stats.total}</strong></div>
          </div>
          <div className="results-stat-card">
            <div className="results-stat-icon blue"><TrendingUp size={21} /></div>
            <div><span>Average Score</span><strong>{stats.average}%</strong></div>
          </div>
          <div className="results-stat-card">
            <div className="results-stat-icon green"><CheckCircle2 size={21} /></div>
            <div><span>Tests Passed</span><strong>{stats.passed}</strong></div>
          </div>
          <div className="results-stat-card">
            <div className="results-stat-icon red"><XCircle size={21} /></div>
            <div><span>Tests Not Passed</span><strong>{stats.failed}</strong></div>
          </div>
        </div>

        <section className="results-list-panel">
          <div className="results-list-heading">
            <div>
              <h2>Completed Tests</h2>
              <p>{filteredResults.length} result(s) found</p>
            </div>
            <div className="results-search">
              <Search size={17} />
              <input type="search"  placeholder="Search tests..." value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </div>

          <div className="results-filter-row">
            {[
              ["all", "All Results"],
              ["passed", "Passed"],
              ["failed", "Not Passed"],
            ].map(([value, label]) => (
              <button
                key={value}
                className={filter === value ? "active" : ""}
                onClick={() => setFilter(value)}
              >
                {label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="results-state">
              <RefreshCw className="results-spin" size={30} />
              <h3>Loading your results...</h3>
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="results-state">
              <div className="results-empty-icon"><Award size={30} /></div>
              <h3>{results.length ? "No matching results" : "No test results yet"}</h3>
              <p>
                {results.length
                  ? "Try changing your search or filter."
                  : "Complete a practice test and your result will appear here."}
              </p>
              {!results.length && (
                <button
                  className="results-primary-btn"
                  onClick={() => navigate("/student/tests")}
                >
                  Explore Practice Tests <ChevronRight size={17} />
                </button>
              )}
            </div>
          ) : (
            <div className="results-table-wrap">
              <table className="results-table">
                <thead>
                  <tr>
                    <th>Test</th>
                    <th>Score</th>
                    <th>Percentage</th>
                    <th>Status</th>
                    <th>Completed</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.map((item) => (
                    <tr key={item._id}>
                      <td>
                        <div className="result-test-name">
                          <div className="result-test-icon"><BookOpen size={18} /></div>
                          <div>
                            <strong>{item.test?.title || "Practice Test"}</strong>
                            <span>{formatCategory(item.test?.category)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="result-score-cell">
                        {item.score} / {item.totalMarks}
                      </td>
                      <td>
                        <div className="result-percentage">
                          <strong>{Number(item.percentage || 0).toFixed(1)}%</strong>
                          <div className="result-mini-track">
                            <span style={{ width: `${Math.min(100, Math.max(0, Number(item.percentage || 0)))}%` }} />
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`result-status ${item.passed ? "passed" : "failed"}`}>
                          {item.passed ? "Passed" : "Not Passed"}
                        </span>
                      </td>
                      <td className="result-date-cell">
                        <Clock3 size={14} />
                        {formatDate(item.completedAt)}
                      </td>
                      <td>
                        <button className="result-view-btn"
                          onClick={() => navigate(`/student/results/${item._id}`)}
                        >
                          Details <ChevronRight size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="results-mobile-list">
                {filteredResults.map((item) => (
                  <article className="result-mobile-card" key={item._id}>
                    <div className="result-mobile-top">
                      <div className="result-test-icon"><BookOpen size={18} /></div>
                      <span className={`result-status ${item.passed ? "passed" : "failed"}`}>
                        {item.passed ? "Passed" : "Not Passed"}
                      </span>
                    </div>
                    <h3>{item.test?.title || "Practice Test"}</h3>
                    <p>{formatCategory(item.test?.category)} · {formatDate(item.completedAt)}</p>
                    <div className="result-mobile-score">
                      <strong>{item.score} / {item.totalMarks}</strong>
                      <span>{Number(item.percentage || 0).toFixed(1)}%</span>
                    </div>
                    <button className="result-view-btn"
                      onClick={() => navigate(`/student/results/${item._id}`)}
                    >
                      View Result Details <ChevronRight size={16} />
                    </button>
                  </article>
                ))}
              </div>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

export default Results;
