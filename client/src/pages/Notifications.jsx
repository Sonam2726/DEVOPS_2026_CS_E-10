import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

import "./Notifications.css";

const API_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  "http://localhost:5000/api";

const notificationIcons = {
  connection_request: "🤝",
  connection_accepted: "🤝",
  skill_request: "📚",
  skill_request_accepted: "📚",
  session_reminder: "🎯",
  message: "💬",
  system: "🔔",
};

const getTokenError = (token) => {
  if (!token) {
    return "Please log in to view and manage your notifications.";
  }

  if (token === "demo-token") {
    return "Demo login is not valid for API requests. Log in with a server account.";
  }

  return "";
};

const getErrorMessage = (error, fallback) =>
  error instanceof TypeError
    ? "Could not connect to the server. Please try again."
    : error.message || fallback;

const formatNotificationTime = (createdAt) => {
  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleString();
};

function Notifications() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [updatingNotifications, setUpdatingNotifications] = useState({});
  const [markingAll, setMarkingAll] = useState(false);
  const [markAllError, setMarkAllError] = useState("");
  const [actionErrors, setActionErrors] = useState({});
  const actionsInProgress = useRef(new Set());
  const markAllInProgress = useRef(false);

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  useEffect(() => {
    const controller = new AbortController();

    const fetchNotifications = async () => {
      const token = localStorage.getItem("skillbridgeToken");
      const tokenError = getTokenError(token);

      if (tokenError) {
        setError(tokenError);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/notifications/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });
        const result = await response.json().catch(() => ({}));

        if (
          !response.ok ||
          result.success !== true ||
          !Array.isArray(result.data?.notifications)
        ) {
          throw new Error(result.message || "Failed to load notifications.");
        }

        setNotifications(result.data.notifications);
        setError("");
      } catch (fetchError) {
        if (fetchError.name !== "AbortError") {
          setError(
            getErrorMessage(
              fetchError,
              "Unable to load notifications. Please try again."
            )
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchNotifications();
    return () => controller.abort();
  }, [reloadKey]);

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  const retryLoading = () => {
    setLoading(true);
    setError("");
    setReloadKey((key) => key + 1);
  };

  const markAsRead = async (notification) => {
    const { _id: id } = notification;

    if (
      notification.isRead ||
      !id ||
      markAllInProgress.current ||
      actionsInProgress.current.has(id)
    ) {
      return;
    }

    const token = localStorage.getItem("skillbridgeToken");
    const tokenError = getTokenError(token);
    if (tokenError) {
      setActionErrors((current) => ({ ...current, [id]: tokenError }));
      return;
    }

    actionsInProgress.current.add(id);
    setUpdatingNotifications((current) => ({ ...current, [id]: true }));
    setActionErrors((current) => ({ ...current, [id]: "" }));

    try {
      const response = await fetch(`${API_URL}/notifications/${id}/read`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json().catch(() => ({}));
      const updatedNotification = result.data?.notification;

      if (
        !response.ok ||
        result.success !== true ||
        String(updatedNotification?._id) !== String(id) ||
        updatedNotification.isRead !== true
      ) {
        throw new Error(
          result.message || "Unable to mark this notification as read."
        );
      }

      setNotifications((current) =>
        current.map((item) =>
          item._id === id ? { ...item, isRead: true } : item
        )
      );
    } catch (actionError) {
      setActionErrors((current) => ({
        ...current,
        [id]: getErrorMessage(
          actionError,
          "Unable to mark this notification as read."
        ),
      }));
    } finally {
      actionsInProgress.current.delete(id);
      setUpdatingNotifications((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });
    }
  };

  const markAllAsRead = async () => {
    if (markAllInProgress.current || actionsInProgress.current.size > 0) {
      return;
    }

    const token = localStorage.getItem("skillbridgeToken");
    const tokenError = getTokenError(token);
    if (tokenError) {
      setMarkAllError(tokenError);
      return;
    }

    markAllInProgress.current = true;
    setMarkingAll(true);
    setMarkAllError("");

    try {
      const response = await fetch(`${API_URL}/notifications/read-all`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json().catch(() => ({}));

      if (
        !response.ok ||
        result.success !== true ||
        !Number.isInteger(result.data?.updatedCount)
      ) {
        throw new Error(
          result.message || "Unable to mark all notifications as read."
        );
      }

      setNotifications((current) =>
        current.map((notification) => ({ ...notification, isRead: true }))
      );
    } catch (actionError) {
      setMarkAllError(
        getErrorMessage(
          actionError,
          "Unable to mark all notifications as read."
        )
      );
    } finally {
      markAllInProgress.current = false;
      setMarkingAll(false);
    }
  };

  const getRequestTarget = (notification) => {
    const requestId = notification.request?._id || notification.request;
    const incoming = notification.type === "skill_request";
    const outgoing = [
      "skill_request_accepted",
      "skill_request_rejected",
    ].includes(notification.type);

    if (!incoming && !outgoing) return null;

    const params = new URLSearchParams({
      type: incoming ? "incoming" : "outgoing",
    });

    if (requestId) {
      params.set("requestId", requestId);
    }

    return `/requests?${params.toString()}`;
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

      <Sidebar
        isOpen={sidebarOpen}
        onClose={closeSidebar}
      />

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

            {!loading && !error && unreadCount > 0 && (
              <button
                className="mark-all-button"
                onClick={markAllAsRead}
                disabled={markingAll || Object.keys(updatingNotifications).length > 0}
              >
                {markingAll ? "Marking as read..." : "Mark all as read"}
              </button>
            )}

          </div>

          {markAllError && (
            <p role="alert">
              {markAllError}
            </p>
          )}

          {/* Loading State */}
          {loading && (
            <div className="notifications-state">

              <div className="state-spinner" />

              <h2>
                Loading notifications
              </h2>

              <p>
                Please wait while we load your latest updates.
              </p>

            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="notifications-state error-state">

              <div className="state-icon">
                ⚠️
              </div>

              <h2>
                Unable to load notifications
              </h2>

              <p>
                Something went wrong while loading your notifications.
                Please try again.
              </p>

              <button
                className="state-retry-button"
                onClick={retryLoading}
              >
                Try again
              </button>

            </div>
          )}

          {/* Loaded State */}
          {!loading && !error && (
            <>
              <div className="notifications-summary">

                <span className="notifications-summary-title">
                  Your notifications
                </span>

                {unreadCount > 0 ? (
                  <span className="notifications-count">
                    {unreadCount} unread
                  </span>
                ) : (
                  <span className="notifications-all-caught-up">
                    All caught up
                  </span>
                )}

              </div>

              {/* Empty State */}
              {notifications.length === 0 ? (
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
              ) : (
                <div className="notifications-list">

                  {notifications.map((notification) => (
                    <article
                      className={`notification-card ${
                        !notification.isRead
                          ? "notification-unread"
                          : ""
                      }`}
                      key={notification._id}
                    >

                      <div className="notification-icon">
                        {notificationIcons[notification.type] || "🔔"}
                      </div>

                      <div className="notification-content">

                        <div className="notification-title-row">

                          <h2>
                            {notification.title}
                          </h2>

                          {!notification.isRead && (
                            <span className="unread-dot" />
                          )}

                        </div>

                        <p>
                          {notification.message}
                        </p>

                        <span className="notification-time">
                          {formatNotificationTime(notification.createdAt)}
                        </span>

                        {getRequestTarget(notification) && (
                          <button
                            type="button"
                            className="view-request-button"
                            onClick={() =>
                              navigate(getRequestTarget(notification))
                            }
                          >
                            View Request
                          </button>
                        )}

                        {actionErrors[notification._id] && (
                          <p role="alert">
                            {actionErrors[notification._id]}
                          </p>
                        )}

                      </div>

                      {!notification.isRead && (
                        <button
                          className="mark-read-button"
                          onClick={() => markAsRead(notification)}
                          disabled={updatingNotifications[notification._id] || markingAll}
                        >
                          {updatingNotifications[notification._id]
                            ? "Marking as read..."
                            : "Mark as read"}
                        </button>
                      )}

                    </article>
                  ))}

                </div>
              )}
            </>
          )}

        </section>

      </div>

    </main>
  );
}

export default Notifications;