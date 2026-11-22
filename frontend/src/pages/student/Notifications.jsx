
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Bell,
  CheckCheck,
  ClipboardList,
  BookOpen,
  Megaphone,
  Info,
  Check,
} from "lucide-react";

import notificationService from "../../services/notificationService";
import "./Notifications.css";

const Notifications = () => {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await notificationService.getMyNotifications();

      const notificationList = response.data || [];

      setNotifications(notificationList);
      setUnreadCount(
        notificationList.filter((item) => !item.isRead).length
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load notifications"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);

      setNotifications((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, isRead: true } : item
        )
      );

      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to mark notification as read"
      );
    }
  };

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter(
      (item) => !item.isRead
    );

    try {
      for (const item of unreadNotifications) {
        await notificationService.markAsRead(item._id);
      }

      setNotifications((prev) =>
        prev.map((item) => ({ ...item, isRead: true }))
      );

      setUnreadCount(0);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to mark all as read"
      );

      await fetchNotifications();
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "test":
        return <ClipboardList size={20} />;

      case "study-material":
        return <BookOpen size={20} />;

      case "placement":
        return <Megaphone size={20} />;

      case "announcement":
        return <Bell size={20} />;

      default:
        return <Info size={20} />;
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div className="student-notifications-page">

      {/* Dashboard Topbar - Always Visible */}
      <header className="notifications-topbar">
        <button
          type="button"
          className="notifications-back-btn"
          onClick={() => navigate("/student/dashboard")}
        >
          <ArrowLeft size={18} />
          <span>Dashboard</span>
        </button>
      </header>

      {loading ? (
        <div className="notifications-empty">
          <div className="notifications-loader"></div>
          <p>Loading notifications...</p>
        </div>
      ) : (
        <>
          {/* Page Header */}
          <div className="student-notifications-header">
            <div>
              <span className="notifications-eyebrow">
                STUDENT UPDATES
              </span>

              <h1>Notifications</h1>

              <p>
                Stay updated with announcements and important activities.
              </p>
            </div>

            <div className="notifications-header-icon">
              <Bell size={28} />

              {unreadCount > 0 && (
                <span className="notifications-badge">
                  {unreadCount}
                </span>
              )}
            </div>
          </div>

          {/* Notification Summary */}
          <div className="notifications-summary">
            <div className="notifications-summary-icon">
              <Bell size={22} />
            </div>

            <div className="notifications-summary-details">
              <strong>
                You have {unreadCount} unread notifications
              </strong>

              <p>
                Check your latest updates and announcements.
              </p>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
              >
                <CheckCheck size={18} />
                Mark All as Read
              </button>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="notifications-error">
              <Info size={18} />
              <p>{error}</p>
            </div>
          )}

          {/* Notifications Content */}
          <div className="notifications-content">
            <div className="notifications-section-heading">
              <h2>Recent Notifications</h2>
              <p>Your latest notifications and updates.</p>
            </div>

            {notifications.length === 0 ? (
              <div className="notifications-empty">
                <Bell size={40} />

                <h3>No notifications yet</h3>

                <p>
                  New announcements will appear here.
                </p>
              </div>
            ) : (
              <div className="notifications-list">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`student-notification-card ${
                      notification.isRead ? "read" : "unread"
                    }`}
                  >
                    <div className="student-notification-icon">
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div className="student-notification-details">
                      <div className="student-notification-title-row">
                        <h3>{notification.title}</h3>

                        {!notification.isRead && (
                          <span className="notification-new-label">
                            NEW
                          </span>
                        )}
                      </div>

                      <p>{notification.message}</p>

                      <span className="student-notification-date">
                        {formatDate(notification.createdAt)}
                      </span>

                      {notification.link && (
                        <p className="notification-view-link">
                          <a
                            href={notification.link}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View Details
                          </a>
                        </p>
                      )}
                    </div>

                    {!notification.isRead && (
                      <button
                        type="button"
                        className="notification-read-btn"
                        onClick={() => markAsRead(notification._id)}
                        title="Mark as read"
                      >
                        <Check size={18} />
                        Mark Read
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Notifications;
