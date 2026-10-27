import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

import "./Dashboard.css";

const API_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  "http://localhost:5000/api";

const getActivityIcon = (type) => {
  switch (type) {
    case "connection_request":
    case "connection_accepted":
    case "skill_request":
    case "skill_request_accepted":
      return "🤝";
    case "session_reminder":
      return "📚";
    case "message":
      return "💬";
    default:
      return "🔔";
  }
};

const formatActivityTime = (createdAt) => {
  if (!createdAt) return "Date unavailable";

  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return date.toLocaleString();
};

function Dashboard() {
  const [token] = useState(() => localStorage.getItem("skillbridgeToken"));
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));
  const [error, setError] = useState(
    token ? "" : "Please log in to view your dashboard."
  );
  const [requiresLogin, setRequiresLogin] = useState(!token);

  useEffect(() => {
    if (!token) return undefined;

    const controller = new AbortController();

    const fetchDashboard = async () => {
      try {
        const response = await fetch(`${API_URL}/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });
        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
          setError(
            response.status === 401 || response.status === 403
              ? "Your session is invalid or expired. Please log in again."
              : result.message || "Failed to load your dashboard."
          );
          setRequiresLogin(response.status === 401 || response.status === 403);
          return;
        }

        if (!result.success || !result.data) {
          setError("The server returned incomplete dashboard data.");
          return;
        }

        setDashboardData(result.data);
      } catch (fetchError) {
        if (fetchError.name !== "AbortError") {
          setError("Could not connect to the server. Please try again.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchDashboard();

    return () => controller.abort();
  }, [token]);

  const statistics = dashboardData?.statistics;
  const overviewCards = [
    {
      icon: "📚",
      title: "Learning Sessions",
      value: statistics?.sessions?.completed,
      description: "Sessions completed",
    },
    {
      icon: "🤝",
      title: "Accepted Requests",
      value: statistics?.requests?.accepted,
      description: "Requests accepted",
    },
    {
      icon: "💡",
      title: "Skills Shared",
      value: statistics?.totalSkills,
      description: "Skills you own",
    },
  ];

  const quickActions = [
    {
      icon: "🔍",
      title: "Explore Skills",
      description: "Discover new skills and learning opportunities.",
      path: "/discover",
    },
    {
      icon: "🤝",
      title: "Find Connections",
      description: "Search for learners and skill partners.",
      path: "/search",
    },
    {
      icon: "🔔",
      title: "View Notifications",
      description: "Check your latest updates and activities.",
      path: "/notifications",
    },
    {
      icon: "⚙️",
      title: "Update Profile",
      description: "Manage your profile and account settings.",
      path: "/settings",
    },
  ];

  const recentActivities = Array.isArray(dashboardData?.recentActivity)
    ? dashboardData.recentActivity
    : [];

  return (
    <main className="dashboard-page">
      <section className="dashboard-content">

          {/* Welcome section */}
          <div className="dashboard-intro">

            <div>
              <p className="dashboard-eyebrow">
                Dashboard
              </p>

              <h1>
                {dashboardData?.user?.name
                  ? `Welcome back, ${dashboardData.user.name}`
                  : "Welcome back"}
              </h1>

              <p>
                Manage your learning journey, connect with
                others and keep track of your activities.
              </p>
            </div>

          </div>

          {loading && <p role="status">Loading your dashboard...</p>}

          {!loading && error && (
            <div className="dashboard-intro" role="alert">
              <p>{error}</p>
              {requiresLogin && <NavLink to="/login">Log in</NavLink>}
            </div>
          )}

          {/* Overview */}
          {!loading && !error && (
            <>
              <div className="dashboard-section-header">

                <div>
                  <p className="dashboard-section-eyebrow">
                    Overview
                  </p>

                  <h2>
                    Your progress
                  </h2>
                </div>

              </div>

              <div className="dashboard-overview-grid">

                {overviewCards.map((card) => (
                  <div
                    className="dashboard-stat-card"
                    key={card.title}
                  >

                    <div className="stat-card-top">

                      <span className="stat-card-icon">
                        {card.icon}
                      </span>

                    </div>

                    <div className="stat-card-content">

                      <p className="stat-card-title">
                        {card.title}
                      </p>

                      <h3 className="stat-card-value">
                        {typeof card.value === "number" ? card.value : "—"}
                      </h3>

                      <p className="stat-card-description">
                        {card.description}
                      </p>

                    </div>

                  </div>
                ))}

              </div>
            </>
          )}

          {/* Quick Actions */}
          <section className="quick-actions">

            <div className="quick-actions-header">

              <div>
                <p className="dashboard-section-eyebrow">
                  Quick Actions
                </p>

                <h2>
                  What would you like to do?
                </h2>
              </div>

            </div>

            <div className="quick-actions-grid">

              {quickActions.map((action) => (
                <NavLink
                  key={action.title}
                  to={action.path}
                  className="quick-action-card"
                >

                  <div className="quick-action-icon">
                    {action.icon}
                  </div>

                  <div className="quick-action-content">

                    <h3>
                      {action.title}
                    </h3>

                    <p>
                      {action.description}
                    </p>

                  </div>

                  <span className="quick-action-arrow">
                    →
                  </span>

                </NavLink>
              ))}

            </div>

          </section>

          {/* Recent Activity */}
          <section className="recent-activity">

            <div className="recent-activity-header">

              <div>
                <p className="dashboard-section-eyebrow">
                  Activity
                </p>

                <h2>
                  Recent activity
                </h2>
              </div>

            </div>

            {loading ? (
              <p role="status">Loading recent activity...</p>
            ) : error ? (
              <p>Recent activity is unavailable.</p>
            ) : recentActivities.length === 0 ? (
              <p>No recent activity yet.</p>
            ) : (
              <div className="activity-list">
                {recentActivities.map((activity, index) => (
                  <div
                    className="activity-item"
                    key={activity._id || `${activity.createdAt}-${index}`}
                  >
                    <div className="activity-icon">
                      {getActivityIcon(activity.type)}
                    </div>

                    <div className="activity-content">
                      <h3>{activity.title || "Notification"}</h3>
                      <p>{activity.message}</p>
                    </div>

                    <span className="activity-time">
                      {formatActivityTime(activity.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}

          </section>

      </section>
    </main>
  );
}

export default Dashboard;