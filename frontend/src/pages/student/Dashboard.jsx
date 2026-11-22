
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  Award,
  Bookmark,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Code2,
  FileText,
  LogOut,
  RefreshCw,
  Target,
  TrendingUp,
  MessageSquare,
  Bell,
} from "lucide-react";
import { toast } from "react-toastify";

import dashboardService from "../../services/dashboardService";
import notificationService from "../../services/notificationService";
import useAuth from "../../hooks/useAuth";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [dashboard, setDashboard] = useState({
    totalTests: 0,
    averageScore: 0,
    totalBookmarks: 0,
    recentResults: [],
    progress: [],
  });

  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const response = await dashboardService.getDashboard();
      setDashboard(response.dashboard || {});
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await notificationService.getUnreadCount();
      setUnreadCount(response.unreadCount || 0);
    } catch (error) {
      console.error("Unread notification count error:", error);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
    fetchUnreadCount();
  }, [fetchDashboard, fetchUnreadCount]);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const getScoreColor = (score) => {
    if (score >= 75) return "success";
    if (score >= 40) return "warning";
    return "danger";
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const displayName = user?.name || user?.fullName || "Student";
  const firstName = displayName.split(" ")[0];

  if (loading) {
    return (
      <div className="student-dashboard-loading">
        <div className="dashboard-spinner" />
        <p>Preparing your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="student-dashboard">
      <aside className="student-sidebar">
        <div className="student-brand">
          <div className="student-brand-icon">
            <BookOpen size={23} />
          </div>

          <div>
            <h2>
              Placement<span>Pro</span>
            </h2>
            <p>STUDENT PORTAL</p>
          </div>
        </div>

        <div className="student-sidebar-label">WORKSPACE</div>

        <nav className="student-nav">
          <button
            className="student-nav-link active"
            onClick={() => navigate("/student/dashboard")}
          >
            <Activity size={19} />
            <span>Dashboard</span>
          </button>

          <button
            className="student-nav-link"
            onClick={() => navigate("/student/tests")}
          >
            <FileText size={19} />
            <span>Practice Tests</span>
          </button>

          <button
            className="student-nav-link"
            onClick={() => navigate("/student/results")}
          >
            <Award size={19} />
            <span>My Results</span>
          </button>

          <button
            className="student-nav-link"
            onClick={() => navigate("/student/materials")}
          >
            <BookOpen size={19} />
            <span>Study Materials</span>
          </button>

          <button
            className="student-nav-link"
            onClick={() => navigate("/student/bookmarks")}
          >
            <Bookmark size={19} />
            <span>My Bookmarks</span>
          </button>

          <button
            className="student-nav-link"
            onClick={() => navigate("/student/progress")}
          >
            <TrendingUp size={19} />
            <span>My Progress</span>
          </button>

          <button
            className="student-nav-link"
            onClick={() => navigate("/student/coding")}
          >
            <Code2 size={19} />
            <span>Coding Practice</span>
          </button>

          <button
            className="student-nav-link"
            onClick={() => navigate("/student/interview")}
          >
            <MessageSquare size={19} />
            <span>Interview Preparation</span>
          </button>

          <button
            className="student-nav-link"
            onClick={() => navigate("/student/notifications")}
          >
            <Bell size={19} />
            <span>Notifications</span>

            {unreadCount > 0 && (
              <span className="student-notification-count">
                {unreadCount}
              </span>
            )}
          </button>
        </nav>

        
        <div className="student-sidebar-bottom">
          <div className="student-sidebar-user">
            <div className="student-avatar">
              {firstName.charAt(0).toUpperCase()}
            </div>

            <div className="student-user-info">
              <strong>{displayName}</strong>
              <span>Student Account</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="student-main">
        <header className="student-topbar">
          <div>
            <span className="student-topbar-label">
              STUDENT WORKSPACE
            </span>
            <h1>My Dashboard</h1>
          </div>

          <div className="student-topbar-actions">
            
            <button className="student-refresh-btn"
              onClick={async () => {
                await fetchDashboard(true);
                await fetchUnreadCount();
              }}
              disabled={refreshing}
            >
              <RefreshCw
                size={17}
                className={refreshing ? "refresh-spinning" : ""}
              />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>

            
            <button
              className="student-logout"
              onClick={handleLogout}
            >
              <LogOut size={17} />
              <span>Logout</span>
            </button>
          </div>
        </header>

        <section className="student-welcome">
          <div className="student-welcome-content">
            <span className="student-welcome-tag">
              YOUR PLACEMENT JOURNEY
            </span>

            <h2>Welcome back, {firstName}! 👋</h2>

            <p>
              Track your preparation, review your performance and keep moving
              closer to your placement goals.
            </p>
          </div>

          <div className="student-welcome-art">
            <div className="welcome-art-circle">
              <Award size={58} />
            </div>
          </div>
        </section>

        <section className="student-stats-grid">
          <div className="student-stat-card">
            <div className="student-stat-icon purple">
              <FileText size={22} />
            </div>

            <div className="student-stat-content">
              <span>Completed Tests</span>
              <h3>{dashboard.totalTests ?? 0}</h3>
              <small>Tests completed</small>
            </div>
          </div>

          <div className="student-stat-card">
            <div className="student-stat-icon green">
              <Target size={22} />
            </div>

            <div className="student-stat-content">
              <span>Average Score</span>
              <h3>{Number(dashboard.averageScore || 0).toFixed(1)}%</h3>
              <small>Overall performance</small>
            </div>
          </div>

          <div className="student-stat-card">
            <div className="student-stat-icon orange">
              <Bookmark size={22} />
            </div>

            <div className="student-stat-content">
              <span>My Bookmarks</span>
              <h3>{dashboard.totalBookmarks ?? 0}</h3>
              <small>Saved questions</small>
            </div>
          </div>

          <div className="student-stat-card">
            <div className="student-stat-icon blue">
              <TrendingUp size={22} />
            </div>

            <div className="student-stat-content">
              <span>Progress Topics</span>
              <h3>{dashboard.progress?.length ?? 0}</h3>
              <small>Tracked topics</small>
            </div>
          </div>
        </section>

        <section className="student-content-grid">
          <div className="student-panel student-results-panel">
            <div className="student-panel-header">
              <div>
                <h3>Recent Test Results</h3>
                <p>Your latest completed tests</p>
              </div>

              <button
                className="student-text-btn"
                onClick={() => navigate("/student/results")}
              >
                View all
              </button>
            </div>

            {dashboard.recentResults?.length > 0 ? (
              <div className="student-results-list">
                {dashboard.recentResults.map((result, index) => {
                  const score = Number(result.percentage || 0);
                  const scoreClass = getScoreColor(score);

                  return (
                    <div
                      className="student-result-row"
                      key={result._id || index}
                    >
                      <div className="student-result-icon">
                        <Award size={19} />
                      </div>

                      <div className="student-result-info">
                        <strong>
                          {result.test?.title ||
                            result.testTitle ||
                            result.title ||
                            "Practice Test"}
                        </strong>

                        <span>
                          <CalendarDays size={13} />
                          {formatDate(result.createdAt)}
                        </span>
                      </div>

                      <div className="student-result-score">
                        <strong className={scoreClass}>
                          {score.toFixed(1)}%
                        </strong>
                        <span>Score</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="student-empty-state">
                <div className="student-empty-icon">
                  <FileText size={28} />
                </div>

                <h4>No test results yet</h4>
                <p>
                  Complete your first practice test to see your results here.
                </p>

                <button onClick={() => navigate("/student/tests")}>
                  Explore Tests
                </button>
              </div>
            )}
          </div>

          <div className="student-panel student-progress-panel">
            <div className="student-panel-header">
              <div>
                <h3>Learning Progress</h3>
                <p>Your topic-wise preparation</p>
              </div>

              <TrendingUp
                size={21}
                className="student-panel-heading-icon"
              />
            </div>

            {dashboard.progress?.length > 0 ? (
              <div className="student-progress-list">
                {dashboard.progress.map((item, index) => {
                  const progressValue = Math.min(
                    100,
                    Math.max(
                      0,
                      Number(
                        item.progress ||
                          item.completionPercentage ||
                          0
                      )
                    )
                  );

                  return (
                    <div
                      className="student-progress-item"
                      key={item._id || index}
                    >
                      <div className="student-progress-label">
                        <strong>
                          {item.topic ||
                            item.category ||
                            item.subject ||
                            "Learning"}
                        </strong>

                        <span>{progressValue}%</span>
                      </div>

                      <div className="student-progress-track">
                        <div
                          className="student-progress-fill"
                          style={{ width: `${progressValue}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="student-empty-state compact">
                <div className="student-empty-icon">
                  <TrendingUp size={27} />
                </div>

                <h4>Progress will appear here</h4>
                <p>
                  Start practising to build your learning progress.
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="student-quick-section">
          <div className="student-section-heading">
            <div>
              <h3>Quick Access</h3>
              <p>Continue your placement preparation</p>
            </div>
          </div>

          <div className="student-quick-grid">
            <button
              className="student-quick-card"
              onClick={() => navigate("/student/tests")}
            >
              <div className="student-quick-icon purple">
                <FileText size={23} />
              </div>

              <div>
                <strong>Practice Tests</strong>
                <span>Test your knowledge</span>
              </div>

              <span className="student-quick-arrow">→</span>
            </button>

            <button
              className="student-quick-card"
              onClick={() => navigate("/student/materials")}
            >
              <div className="student-quick-icon blue">
                <BookOpen size={23} />
              </div>

              <div>
                <strong>Study Materials</strong>
                <span>Learn new concepts</span>
              </div>

              <span className="student-quick-arrow">→</span>
            </button>

            <button
              className="student-quick-card"
              onClick={() => navigate("/student/bookmarks")}
            >
              <div className="student-quick-icon orange">
                <Bookmark size={23} />
              </div>

              <div>
                <strong>My Bookmarks</strong>
                <span>Revisit saved questions</span>
              </div>

              <span className="student-quick-arrow">→</span>
            </button>
          </div>
        </section>

        <footer className="student-dashboard-footer">
          <span>PlacementPro Student Portal</span>

          <span>
            <CheckCircle2 size={14} />
            Keep learning, keep growing
          </span>
        </footer>
      </main>
    </div>
  );
}

export default Dashboard;
