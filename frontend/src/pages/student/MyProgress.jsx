import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  RefreshCw,
  TrendingUp,
  Target,
  BookOpen,
  Award,
  Activity,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-toastify";

import progressService from "../../services/progressService";
import "./MyProgress.css";

function MyProgress() {
  const navigate = useNavigate();

  const [progress, setProgress] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);

  const loadProgress = async () => {
    setLoading(true);

    try {
      const [progressResponse, summaryResponse] = await Promise.all([
        progressService.getMyProgress(),
        progressService.getProgressSummary(),
      ]);

      const progressData =
        progressResponse?.progress ||
        progressResponse?.data?.progress ||
        progressResponse?.data ||
        [];

      const summaryData =
        summaryResponse?.summary ||
        summaryResponse?.data?.summary ||
        summaryResponse?.data ||
        summaryResponse ||
        {};

      setProgress(Array.isArray(progressData) ? progressData : []);
      setSummary(summaryData && typeof summaryData === "object" ? summaryData : {});
    } catch (error) {
      console.error("Progress loading error:", error);
      setProgress([]);
      setSummary({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProgress();
  }, []);

  const getValue = (...keys) => {
    for (const key of keys) {
      const value = summary?.[key];
      if (value !== undefined && value !== null) return value;
    }
    return 0;
  };

  const totalTopics = getValue("totalTopics", "topicsCovered", "total");
  const completedTopics = getValue("completedTopics", "topicsCompleted", "completed");
  const averageScore = getValue("averageScore", "avgScore", "averagePercentage");
  const totalAttempts = getValue("totalAttempts", "attempts", "totalTests");

  const getTopicName = (item) =>
    item.topic ||
    item.category ||
    item.subject ||
    item.title ||
    item.name ||
    "General";

  const getTopicScore = (item) =>
    Number(
      item.percentage ??
        item.scorePercentage ??
        item.averageScore ??
        item.score ??
        item.progress ??
        0
    );

  const getTopicAttempts = (item) =>
    item.attempts ?? item.totalAttempts ?? item.count ?? item.testsCompleted ?? 0;

  const getTopicStatus = (item) =>
    item.completed === true ||
    item.isCompleted === true ||
    item.status === "completed";

  return (
    <div className="my-progress-page">
      <header className="progress-topbar">
        <button className="progress-back-btn"
          onClick={() => navigate("/student/dashboard")}
        >
          <ArrowLeft size={18} />
          Dashboard
        </button>

        <button className="progress-refresh-btn" onClick={loadProgress} disabled={loading}
        >
          <RefreshCw size={17} className={loading ? "progress-spin" : ""} />
          Refresh
        </button>
      </header>

      <section className="progress-hero">
        <div>
          <span className="progress-eyebrow">STUDENT ANALYTICS</span>
          <h1>My Learning Progress</h1>
          <p>Track your learning journey and review your practice performance.</p>
        </div>

        <div className="progress-hero-icon">
          <TrendingUp size={34} />
        </div>
      </section>

      <section className="progress-stats-grid">
        <div className="progress-stat-card">
          <div className="progress-stat-icon purple">
            <BookOpen size={21} />
          </div>
          <div>
            <span className="progress-stat-label">Topics Covered</span>
            <h2>{loading ? "—" : totalTopics}</h2>
          </div>
        </div>

        <div className="progress-stat-card">
          <div className="progress-stat-icon green">
            <Award size={21} />
          </div>
          <div>
            <span className="progress-stat-label">Topics Completed</span>
            <h2>{loading ? "—" : completedTopics}</h2>
          </div>
        </div>

        <div className="progress-stat-card">
          <div className="progress-stat-icon blue">
            <Target size={21} />
          </div>
          <div>
            <span className="progress-stat-label">Average Score</span>
            <h2>{loading ? "—" : `${averageScore}%`}</h2>
          </div>
        </div>

        <div className="progress-stat-card">
          <div className="progress-stat-icon orange">
            <Activity size={21} />
          </div>
          <div>
            <span className="progress-stat-label">Total Attempts</span>
            <h2>{loading ? "—" : totalAttempts}</h2>
          </div>
        </div>
      </section>

      <section className="progress-content-section">
        <div className="progress-section-heading">
          <div>
            <h2>Topic-wise Performance</h2>
            <p>Your performance across different learning topics.</p>
          </div>
        </div>

        {loading ? (
          <div className="progress-loading">
            <div className="progress-loader"></div>
            <p>Loading your progress...</p>
          </div>
        ) : progress.length === 0 ? (
          <div className="progress-empty">
            <div className="progress-empty-icon">
              <TrendingUp size={32} />
            </div>
            <h3>No progress data yet</h3>
            <p>
              Start practicing questions and tests to see your learning progress
              here.
            </p>
            <button className="progress-primary-btn" onClick={() => navigate("/student/tests")}
            >
              Start Practicing
              <ChevronRight size={18} />
            </button>
          </div>
        ) : (
          <div className="progress-topic-list">
            {progress.map((item, index) => {
              const score = Math.max(
                0,
                Math.min(100, getTopicScore(item))
              );
              const isCompleted = getTopicStatus(item);

              return (
                <div
                  className="progress-topic-card"
                  key={item._id || item.id || index}
                >
                  <div className="progress-topic-header">
                    <div className="progress-topic-title">
                      <div className="progress-topic-number">
                        {index + 1}
                      </div>
                      <div>
                        <h3>{getTopicName(item)}</h3>
                        <span className="progress-topic-attempts">
                          {getTopicAttempts(item)} attempts
                        </span>
                      </div>
                    </div>

                    <div className="progress-topic-score">
                      <strong>{score}%</strong>
                      <span className={isCompleted ? "completed" : "in-progress"}>
                        {isCompleted ? "Completed" : "In Progress"}
                      </span>
                    </div>
                  </div>

                  <div className="progress-bar-track">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${score}%` }}
                    ></div>
                  </div>

                  {item.lastPracticed || item.updatedAt || item.lastAttempt ? (
                    <div className="progress-topic-footer">
                      Last practiced:{" "}
                      {new Date(
                        item.lastPracticed || item.updatedAt || item.lastAttempt
                      ).toLocaleDateString()}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="progress-bottom-banner">
        <div className="progress-bottom-icon">
          <Target size={24} />
        </div>
        <div>
          <h3>Keep improving, one topic at a time!</h3>
          <p>Consistent practice is the key to placement preparation.</p>
        </div>
        <button onClick={() => navigate("/student/tests")}>
          Practice Now <ChevronRight size={17} />
        </button>
      </section>
    </div>
  );
}

export default MyProgress;