
import { useState } from "react";
import {
  Bell,
  CheckCheck,
  ClipboardList,
  BookOpen,
  Megaphone,
  Info,
  Check,
} from "lucide-react";
import "./Notifications.css";

const initialNotifications = [
  {
    id: 1,
    title: "Welcome to PlacementPro",
    message: "Welcome! Start your placement preparation from your student dashboard.",
    type: "general",
    date: "Today",
    read: false,
  },
  {
    id: 2,
    title: "Practice Tests",
    message: "Explore practice tests to improve your preparation and track your performance.",
    type: "test",
    date: "Today",
    read: false,
  },
  {
    id: 3,
    title: "Study Materials Available",
    message: "Visit the Study Materials section to explore learning resources.",
    type: "material",
    date: "Yesterday",
    read: true,
  },
  {
    id: 4,
    title: "Placement Preparation",
    message: "Keep practising coding and interview questions to prepare for placements.",
    type: "announcement",
    date: "Yesterday",
    read: true,
  },
];

function Notifications() {
  const [notifications, setNotifications] = useState(
    initialNotifications
  );

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  const markAsRead = (id) => {
    setNotifications((previous) =>
      previous.map((notification) =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((previous) =>
      previous.map((notification) => ({
        ...notification,
        read: true,
      }))
    );
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "test":
        return <ClipboardList size={21} />;
      case "material":
        return <BookOpen size={21} />;
      case "announcement":
        return <Megaphone size={21} />;
      default:
        return <Info size={21} />;
    }
  };

  return (
    <div className="student-notifications-page">
      <header className="student-notifications-header">
        <div>
          <span className="notifications-eyebrow">
            STUDENT WORKSPACE
          </span>
          <h1>Notifications</h1>
          <p>Stay updated with your placement preparation.</p>
        </div>

        <div className="notifications-header-icon">
          <Bell size={34} />
          {unreadCount > 0 && (
            <span className="notifications-badge">
              {unreadCount}
            </span>
          )}
        </div>
      </header>

      <section className="notifications-summary">
        <div className="notifications-summary-icon">
          <Bell size={23} />
        </div>

        <div>
          <strong>{unreadCount} Unread Notifications</strong>
          <p>
            {unreadCount > 0
              ? "You have updates waiting to be read."
              : "You are all caught up!"}
          </p>
        </div>

        <button
          type="button"
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
        >
          <CheckCheck size={17} />
          Mark All as Read
        </button>
      </section>

      <section className="notifications-content">
        <div className="notifications-section-heading">
          <div>
            <h2>Recent Notifications</h2>
            <p>Your latest updates and announcements</p>
          </div>
        </div>

        {notifications.length > 0 ? (
          <div className="notifications-list">
            {notifications.map((notification) => (
              <article
                className={`student-notification-card ${
                  notification.read ? "read" : "unread"
                }`}
                key={notification.id}
              >
                <div className="student-notification-icon">
                  {getNotificationIcon(notification.type)}
                </div>

                <div className="student-notification-details">
                  <div className="student-notification-title-row">
                    <h3>{notification.title}</h3>

                    {!notification.read && (
                      <span className="notification-new-label">
                        NEW
                      </span>
                    )}
                  </div>

                  <p>{notification.message}</p>

                  <span className="student-notification-date">
                    {notification.date}
                  </span>
                </div>

                {!notification.read && (
                  <button
                    type="button"
                    className="notification-read-btn"
                    onClick={() => markAsRead(notification.id)}
                    title="Mark as read"
                  >
                    <Check size={18} />
                    <span>Mark Read</span>
                  </button>
                )}
              </article>
            ))}
          </div>
        ) : (
          <div className="notifications-empty">
            <Bell size={35} />
            <h3>No notifications</h3>
            <p>You don't have any notifications right now.</p>
          </div>
        )}
      </section>
    </div>
  );
}

export default Notifications;
