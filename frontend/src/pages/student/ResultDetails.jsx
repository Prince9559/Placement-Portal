
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, Award, CheckCircle2, XCircle, MinusCircle,
  Clock3, CalendarDays, Target, BookOpen, RefreshCw,
} from "lucide-react";
import { toast } from "react-toastify";
import testService from "../../services/testService";
import "./ResultDetails.css";

function ResultDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchResult = async () => {
      try {
        setLoading(true);
        const response = await testService.getMyResultById(id);
        if (mounted) setResult(response.result || null);
      } catch (error) {
        console.error("Fetch result details error:", error);
        toast.error(error.response?.data?.message || "Unable to load result details.");
        navigate("/student/results");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchResult();
    return () => { mounted = false; };
  }, [id, navigate]);

  const formatDate = (date) => {
    if (!date) return "Not available";
    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="result-detail-loading">
        <RefreshCw size={32} className="result-detail-spin" />
        <p>Loading result details...</p>
      </div>
    );
  }

  if (!result) return null;

  const percentage = Number(result.percentage || 0);

  return (
    <main className="result-detail-page">
      <header className="result-detail-header">
        <div className="result-detail-header-inner">
          <button
            className="result-detail-back"
            onClick={() => navigate("/student/results")}
          >
            <ArrowLeft size={18} />
            All Results
          </button>
          <div>
            <span>PERFORMANCE REPORT</span>
            <h1>Test Result Details</h1>
          </div>
        </div>
      </header>

      <section className="result-detail-content">
        <div className={`result-detail-hero ${result.passed ? "hero-passed" : "hero-failed"}`}>
          <div className="result-detail-hero-icon">
            {result.passed ? <Award size={35} /> : <Target size={35} />}
          </div>
          <div className="result-detail-hero-copy">
            <span>{result.passed ? "CONGRATULATIONS" : "KEEP PRACTICING"}</span>
            <h2>{result.passed ? "You passed this test!" : "You did not pass this time."}</h2>
            <p>{result.test?.title || "Practice Test"}</p>
          </div>
          <div className="result-detail-percentage">
            <strong>{percentage.toFixed(1)}%</strong>
            <span>Overall Score</span>
          </div>
        </div>

        <div className="result-detail-score-card">
          <div className="result-detail-score-main">
            <span>Your Score</span>
            <strong>{result.score} <small>/ {result.totalMarks}</small></strong>
            <div className="result-detail-track">
              <span style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }} />
            </div>
          </div>
          <div className="result-detail-meta">
            <div><BookOpen size={17} /><span>{result.test?.category || "General"}</span></div>
            <div><Clock3 size={17} /><span>{result.test?.durationMinutes ?? "—"} minutes</span></div>
            <div><CalendarDays size={17} /><span>{formatDate(result.completedAt)}</span></div>
          </div>
        </div>

        <h3 className="result-detail-section-title">Answer Summary</h3>
        <div className="result-detail-summary-grid">
          <div className="result-summary-box correct">
            <CheckCircle2 size={23} />
            <span>Correct Answers</span>
            <strong>{result.correctAnswers ?? 0}</strong>
          </div>
          <div className="result-summary-box wrong">
            <XCircle size={23} />
            <span>Wrong Answers</span>
            <strong>{result.wrongAnswers ?? 0}</strong>
          </div>
          <div className="result-summary-box skipped">
            <MinusCircle size={23} />
            <span>Unanswered</span>
            <strong>{Math.max(0, Number(result.totalQuestions || 0) - Number(result.attemptedQuestions || 0))}</strong>
          </div>
          <div className="result-summary-box attempted">
            <Target size={23} />
            <span>Attempted</span>
            <strong>{result.attemptedQuestions ?? 0} / {result.totalQuestions ?? 0}</strong>
          </div>
        </div>

        <div className="result-detail-bottom">
          <div>
            <span>Final Status</span>
            <strong className={result.passed ? "text-passed" : "text-failed"}>
              {result.passed ? "Passed" : "Not Passed"}
            </strong>
          </div>
          <button
            className="result-detail-primary"
            onClick={() => navigate("/student/tests")}
          >
            Practice More Tests
          </button>
        </div>
      </section>
    </main>
  );
}

export default ResultDetails;
