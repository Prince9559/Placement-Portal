
import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Search,
  RefreshCw,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  FileText,
  TrendingUp,
} from "lucide-react";
import { toast } from "react-toastify";
import api from "../../services/api";
import "./Results.css";

const Results = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
  });
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedResult, setSelectedResult] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const fetchResults = async () => {
    try {
      setLoading(true);

      const params = { page, limit: 10 };

      if (status !== "all") {
        params.passed = status === "passed" ? "true" : "false";
      }

      const response = await api.get("/results", { params });
      const data = response.data;

      setResults(data.results || []);
      setPagination({
        total: data.pagination?.total || 0,
        totalPages: data.pagination?.totalPages || 1,
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load results");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [page, status]);

  const filteredResults = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return results;

    return results.filter((result) => {
      const studentName = result.user?.name || "";
      const email = result.user?.email || "";
      const testName = result.test?.title || "";

      return (
        studentName.toLowerCase().includes(term) ||
        email.toLowerCase().includes(term) ||
        testName.toLowerCase().includes(term)
      );
    });
  }, [results, search]);

  const summary = useMemo(() => {
    const passed = results.filter((item) => item.passed).length;
    const failed = results.length - passed;

    const average =
      results.length > 0
        ? results.reduce(
            (total, item) => total + (Number(item.percentage) || 0),
            0
          ) / results.length
        : 0;

    return {
      passed,
      failed,
      average: average.toFixed(1),
    };
  }, [results]);

  const openDetails = async (id) => {
    try {
      setDetailsLoading(true);
      setSelectedResult(null);

      const response = await api.get(`/results/${id}`);
      setSelectedResult(response.data.result);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load result details");
    } finally {
      setDetailsLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="admin-results">
      <div className="results-header">
        <div>
          <h1>
            <BarChart3 size={27} /> Results & Analytics
          </h1>
          <p>Monitor student test performance and results.</p>
        </div>

        <button className="results-refresh-btn" onClick={fetchResults}>
          <RefreshCw size={17} /> Refresh
        </button>
      </div>

      <div className="results-summary-grid">
        <div className="results-summary-card">
          <div className="results-summary-icon blue">
            <FileText size={23} />
          </div>
          <div>
            <span>Total Results</span>
            <h2>{pagination.total}</h2>
          </div>
        </div>

        <div className="results-summary-card">
          <div className="results-summary-icon green">
            <CheckCircle size={23} />
          </div>
          <div>
            <span>Passed (Current Page)</span>
            <h2>{summary.passed}</h2>
          </div>
        </div>

        <div className="results-summary-card">
          <div className="results-summary-icon red">
            <XCircle size={23} />
          </div>
          <div>
            <span>Failed (Current Page)</span>
            <h2>{summary.failed}</h2>
          </div>
        </div>

        <div className="results-summary-card">
          <div className="results-summary-icon purple">
            <TrendingUp size={23} />
          </div>
          <div>
            <span>Average (Current Page)</span>
            <h2>{summary.average}%</h2>
          </div>
        </div>
      </div>

      <div className="results-content-card">
        <div className="results-toolbar">
          <div className="results-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search student or test..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="results-filter"
          >
            <option value="all">All Results</option>
            <option value="passed">Passed</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        <div className="results-table-wrapper">
          <table className="results-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Test</th>
                <th>Score</th>
                <th>Percentage</th>
                <th>Status</th>
                <th>Completed At</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="results-empty">
                    Loading results...
                  </td>
                </tr>
              ) : filteredResults.length === 0 ? (
                <tr>
                  <td colSpan="7" className="results-empty">
                    No results found.
                  </td>
                </tr>
              ) : (
                filteredResults.map((result) => (
                  <tr key={result._id}>
                    <td>
                      <div className="results-student">
                        <strong>{result.user?.name || "Unknown Student"}</strong>
                        <span>{result.user?.email || "N/A"}</span>
                      </div>
                    </td>

                    <td>{result.test?.title || "Test unavailable"}</td>

                    <td>
                      {result.score ?? result.correctAnswers ?? 0}
                      {result.totalQuestions != null
                        ? ` / ${result.totalQuestions}`
                        : ""}
                    </td>

                    <td>
                      <strong>
                        {Number(result.percentage || 0).toFixed(1)}%
                      </strong>
                    </td>

                    <td>
                      <span
                        className={`results-status ${
                          result.passed ? "passed" : "failed"
                        }`}
                      >
                        {result.passed ? "Passed" : "Failed"}
                      </span>
                    </td>

                    <td>{formatDate(result.completedAt)}</td>

                    <td>
                      <button
                        className="results-view-btn"
                        onClick={() => openDetails(result._id)}
                        title="View Details"
                      >
                        <Eye size={17} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="results-pagination">
          <span>
            Total {pagination.total} results
          </span>

          <div>
            <button
              disabled={page <= 1 || loading}
              onClick={() => setPage((prev) => prev - 1)}
            >
              <ChevronLeft size={18} />
            </button>

            <span>
              Page {page} of {pagination.totalPages}
            </span>

            <button
              disabled={page >= pagination.totalPages || loading}
              onClick={() => setPage((prev) => prev + 1)}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {(selectedResult || detailsLoading) && (
        <div
          className="results-modal-overlay"
          onClick={() => {
            if (!detailsLoading) setSelectedResult(null);
          }}
        >
          <div
            className="results-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="results-modal-header">
              <div>
                <h2>Result Details</h2>
                <p>Detailed student test performance</p>
              </div>

              <button
                onClick={() => setSelectedResult(null)}
                disabled={detailsLoading}
              >
                <X size={21} />
              </button>
            </div>

            {detailsLoading ? (
              <p className="results-modal-loading">Loading details...</p>
            ) : (
              selectedResult && (
                <div className="results-detail-body">
                  <div className="results-detail-student">
                    <h3>{selectedResult.user?.name || "Unknown Student"}</h3>
                    <p>{selectedResult.user?.email || "N/A"}</p>
                  </div>

                  <div className="results-detail-grid">
                    <div>
                      <span>Test</span>
                      <strong>{selectedResult.test?.title || "N/A"}</strong>
                    </div>
                    <div>
                      <span>Category</span>
                      <strong>{selectedResult.test?.category || "N/A"}</strong>
                    </div>
                    <div>
                      <span>Score</span>
                      <strong>
                        {selectedResult.score ?? selectedResult.correctAnswers ?? 0}
                        {selectedResult.totalQuestions != null
                          ? ` / ${selectedResult.totalQuestions}`
                          : ""}
                      </strong>
                    </div>
                    <div>
                      <span>Percentage</span>
                      <strong>
                        {Number(selectedResult.percentage || 0).toFixed(1)}%
                      </strong>
                    </div>
                    <div>
                      <span>Correct Answers</span>
                      <strong>{selectedResult.correctAnswers ?? "N/A"}</strong>
                    </div>
                    <div>
                      <span>Wrong Answers</span>
                      <strong>{selectedResult.wrongAnswers ?? "N/A"}</strong>
                    </div>
                    <div>
                      <span>Duration</span>
                      <strong>
                        {selectedResult.test?.durationMinutes != null
                          ? `${selectedResult.test.durationMinutes} minutes`
                          : "N/A"}
                      </strong>
                    </div>
                    <div>
                      <span>Completed At</span>
                      <strong>{formatDate(selectedResult.completedAt)}</strong>
                    </div>
                  </div>

                  <div className="results-detail-status">
                    <span>Status</span>
                    <strong className={selectedResult.passed ? "passed" : "failed"}>
                      {selectedResult.passed ? "Passed" : "Failed"}
                    </strong>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Results;
