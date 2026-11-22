
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {Users,UserCheck,GraduationCap,BookOpen,Code2,MessageSquare,ClipboardList,FileCheck,Trophy,Library,Bell,Bookmark,TrendingUp,RefreshCw,LogOut,LayoutDashboard,} from "lucide-react";
import { toast } from "react-toastify";

import api from "../../services/api";
import useAuth from "../../hooks/useAuth";
import "./AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await api.get("/admin/dashboard");
      setStats(response.data.data);
    } catch (error) {
      
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };


  const menuItems = [
    {
      label: "Dashboard",
      path: "/admin/dashboard",
      icon: LayoutDashboard,
      active: location.pathname === "/admin/dashboard",
    },
    {
      label: "Students Management",
      path: "/admin/students",
      icon: Users,
      active: location.pathname.startsWith("/admin/students"),
    },
    {
      label: "Questions Management",
      path: "/admin/questions",
      icon: BookOpen,
      active: location.pathname === "/admin/questions",
    },
    {
      label: "Coding Questions",
      path: "/admin/coding-questions",
      icon: Code2,
      active: location.pathname === "/admin/coding-questions",
    },
    {
      label: "Interview Questions",
      path: "/admin/interview-questions",
      icon: MessageSquare,
      active: location.pathname === "/admin/interview-questions",
    },
    {
      label: "Study Materials",
      path: "/admin/materials",
      icon: Library,
      active: location.pathname === "/admin/materials",
    },
    {
      label: "Tests Management",
      path: "/admin/tests",
      icon: ClipboardList,
      active: location.pathname === "/admin/tests",
    },
    {
      label: "Results & Analytics",
      path: "/admin/results",
      icon: Trophy,
      active: location.pathname === "/admin/results",
    },
    {
      label: "Notifications",
      path: "/admin/notifications",
      icon: Bell,
      active: location.pathname === "/admin/notifications",
    },
    {
      label: "Admin Settings",
      path: "/admin/settings",
      icon: TrendingUp,
      active: location.pathname === "/admin/settings",
    },
  ];

  const statCards = stats
    ? [
        {
          title: "Total Users",
          value: stats.users.total,
          icon: Users,
          color: "blue",
          detail: `${stats.users.active} active users`,
        },
        {
          title: "Total Students",
          value: stats.users.students,
          icon: GraduationCap,
          color: "purple",
          detail: `${stats.users.admins} administrators`,
        },
        {
          title: "Active Users",
          value: stats.users.active,
          icon: UserCheck,
          color: "green",
          detail: `${stats.users.inactive} inactive users`,
        },
        {
          title: "Total Questions",
          value: stats.questions.total,
          icon: BookOpen,
          color: "orange",
          detail: "Across all categories",
        },
        {
          title: "Coding Questions",
          value: stats.questions.coding,
          icon: Code2,
          color: "cyan",
          detail: "Programming practice",
        },
        {
          title: "Interview Questions",
          value: stats.questions.interview,
          icon: MessageSquare,
          color: "pink",
          detail: "Interview preparation",
        },
        {
          title: "Total Tests",
          value: stats.tests.total,
          icon: ClipboardList,
          color: "indigo",
          detail: `${stats.tests.active} active tests`,
        },
        {
          title: "Completed Attempts",
          value: stats.tests.completedAttempts,
          icon: FileCheck,
          color: "teal",
          detail: "Test submissions",
        },
        {
          title: "Total Results",
          value: stats.results.total,
          icon: Trophy,
          color: "yellow",
          detail: `Highest: ${stats.results.highestPercentage}%`,
        },
        {
          title: "Study Materials",
          value: stats.studyMaterials,
          icon: Library,
          color: "purple",
          detail: "Learning resources",
        },
        {
          title: "Notifications",
          value: stats.notifications,
          icon: Bell,
          color: "pink",
          detail: "Portal notifications",
        },
        {
          title: "Bookmarks",
          value: stats.bookmarks,
          icon: Bookmark,
          color: "orange",
          detail: `${stats.progressRecords} progress records`,
        },
      ]
    : [];

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-loading-spinner" />
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="admin-brand-icon">
            <GraduationCap size={25} />
          </div>
          <div>
            <h2>Placement</h2>
            <span>PORTAL ADMIN</span>
          </div>
        </div>

        <div className="admin-sidebar-label">MAIN MENU</div>

        <nav className="admin-sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <button key={item.path} type="button" className={`admin-sidebar-link ${ item.active ? "active" : ""}`} onClick={() => navigate(item.path)}>
                <Icon size={19} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-profile-avatar">
            {user?.name?.charAt(0)?.toUpperCase() || "A"}
          </div>
          <div className="admin-profile-info">
            <strong>{user?.name || "Administrator"}</strong>
            <span>Administrator</span>
          </div>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <span className="admin-breadcrumb">Pages / Dashboard</span>
            <h1>Admin Dashboard</h1>
          </div>

          <div className="admin-topbar-actions">
            <button className="admin-refresh-btn" onClick={() => fetchDashboard(true)} disabled={refreshing} title="Refresh dashboard" >
              <RefreshCw size={17} className={refreshing ? "refresh-spinning" : ""}/>
              <span>Refresh</span>
            </button>

            <button className="admin-logout-btn" onClick={handleLogout}>
              <LogOut size={17} />
              <span>Logout</span>
            </button>
          </div>
        </header>

        <section className="admin-welcome">
          <div>
            <span className="admin-welcome-tag">ADMIN OVERVIEW</span>
            <h2>
              Welcome back, {user?.name?.split(" ")[0] || "Admin"}!
            </h2>
            <p>
              Here's what's happening with your Placement Portal today.
            </p>
          </div>

          <div className="admin-welcome-icon">
            <GraduationCap size={62} />
          </div>
        </section>

        {stats ? (
          <>
            <section className="admin-section-heading">
              <div>
                <h2>Platform Statistics</h2>
                <p>Live information fetched from your backend</p>
              </div>
              <span className="admin-live-status">
                <span /> Live Data
              </span>
            </section>

            <section className="admin-stats-grid">
              {statCards.map((card) => {
                const Icon = card.icon;

                return (
                  <article className="admin-stat-card" key={card.title}>
                    <div className={`admin-stat-icon ${card.color}`}>
                      <Icon size={22} />
                    </div>

                    <div className="admin-stat-content">
                      <p>{card.title}</p>
                      <h3>{card.value ?? 0}</h3>
                      <span>{card.detail}</span>
                    </div>
                  </article>
                );
              })}
            </section>

            <section className="admin-bottom-grid">
              <div className="admin-summary-card">
                <div className="admin-card-heading">
                  <div>
                    <h3>Question Categories</h3>
                    <p>Question distribution</p>
                  </div>
                  <BookOpen size={21} />
                </div>

                <div className="admin-category-row">
                  <span>Aptitude & Other</span>
                  <strong>{stats.questions.aptitudeAndOther}</strong>
                </div>
                <div className="admin-category-row">
                  <span>Coding</span>
                  <strong>{stats.questions.coding}</strong>
                </div>
                <div className="admin-category-row">
                  <span>Interview</span>
                  <strong>{stats.questions.interview}</strong>
                </div>
                <div className="admin-category-total">
                  <span>Total Questions</span>
                  <strong>{stats.questions.total}</strong>
                </div>
              </div>

              <div className="admin-summary-card">
                <div className="admin-card-heading">
                  <div>
                    <h3>Test Performance</h3>
                    <p>Overall result summary</p>
                  </div>
                  <TrendingUp size={21} />
                </div>

                <div className="admin-performance-value">
                  {stats.results.averagePercentage}%
                </div>
                <p className="admin-performance-label">
                  Average Result Percentage
                </p>

                <div className="admin-performance-divider" />

                <div className="admin-performance-row">
                  <span>Highest Percentage</span>
                  <strong>{stats.results.highestPercentage}%</strong>
                </div>
                <div className="admin-performance-row">
                  <span>Completed Attempts</span>
                  <strong>{stats.tests.completedAttempts}</strong>
                </div>
                <div className="admin-performance-row">
                  <span>Total Results</span>
                  <strong>{stats.results.total}</strong>
                </div>
              </div>
            </section>
          </>
        ) : (
          <div className="admin-empty-state">
            <h3>Dashboard data unavailable</h3>
            <p>Please refresh to try loading the dashboard again.</p>
            <button onClick={() => fetchDashboard(true)}>
              <RefreshCw size={16} /> Try Again
            </button>
          </div>
        )}

        <footer className="admin-footer">
          © {new Date().getFullYear()} Placement Portal. All rights reserved.
        </footer>
      </main>
    </div>
  );
}

export default AdminDashboard;
