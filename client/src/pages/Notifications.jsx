import { useState } from "react";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

import "./Notifications.css";

function Notifications() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      icon: "🤝",
      title: "New skill connection",
      message:
        "You have a new connection request from another learner.",
      time: "10 minutes ago",
      unread: true,
    },
    {
      id: 2,
      icon: "📚",
      title: "Learning session completed",
      message:
        "Your Python Basics learning session has been completed.",
      time: "2 hours ago",
      unread: true,
    },
    {
      id: 3,
      icon: "💡",
      title: "New skill recommendation",
      message:
        "React has been recommended based on your learning interests.",
      time: "Yesterday",
      unread: false,
    },
    {
      id: 4,
      icon: "🎯",
      title: "Learning session reminder",
      message:
        "You have an upcoming JavaScript practice session.",
      time: "Yesterday",
      unread: false,
    },
  ]);

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const unreadCount = notifications.filter(
    (notification) => notification.unread
  ).length;

  const markAsRead = (id) => {
    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) =>
        notification.id === id
          ? { ...notification, unread: false }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) => ({
        ...notification,
        unread: false,
      }))
    );
  };

  return (
    <main className="notifications-page">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="notifications-sidebar-overlay"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={closeSidebar}
      />

      {/* Main area */}
      <div className="notifications-main">

        <Topbar
          onMenuClick={() => setSidebarOpen(true)}
        />

        <section className="notifications-content">

          {/* Header */}
          <div className="notifications-header">

            <div>
              <p className="notifications-eyebrow">
                Updates
              </p>

              <h1>
                Notifications
              </h1>

              <p>
                Stay updated with your learning activities,
                connections and recommendations.
              </p>
            </div>

            {unreadCount > 0 && (
              <button
                className="mark-all-button"
                onClick={markAllAsRead}
              >
                Mark all as read
              </button>
            )}

          </div>

          {/* Notification count */}
          <div className="notifications-summary">

            <span className="notifications-summary-title">
              Your notifications
            </span>

            <span className="notifications-count">
              {unreadCount} unread
            </span>

          </div>

          {/* Notifications */}
          {notifications.length > 0 ? (
            <div className="notifications-list">

              {notifications.map((notification) => (
                <article
                  className={`notification-card ${
                    notification.unread
                      ? "notification-unread"
                      : ""
                  }`}
                  key={notification.id}
                >

                  <div className="notification-icon">
                    {notification.icon}
                  </div>

                  <div className="notification-content">

                    <div className="notification-title-row">

                      <h2>
                        {notification.title}
                      </h2>

                      {notification.unread && (
                        <span className="unread-dot" />
                      )}

                    </div>

                    <p>
                      {notification.message}
                    </p>

                    <span className="notification-time">
                      {notification.time}
                    </span>

                  </div>

                  {notification.unread && (
                    <button
                      className="mark-read-button"
                      onClick={() =>
                        markAsRead(notification.id)
                      }
                    >
                      Mark as read
                    </button>
                  )}

                </article>
              ))}

            </div>
          ) : (
            /* Empty state */
            <div className="notifications-empty">

              <div className="empty-notification-icon">
                🔔
              </div>

              <h2>
                No notifications
              </h2>

              <p>
                You're all caught up. New updates will
                appear here.
              </p>

            </div>
          )}

        </section>

      </div>

    </main>
  );
}

export default Notifications;