import { useState } from "react";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

import "./Dashboard.css";

function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const overviewCards = [
    {
      icon: "📚",
      title: "Learning Sessions",
      value: "12",
      description: "Sessions completed",
    },
    {
      icon: "🤝",
      title: "Skill Connections",
      value: "8",
      description: "People connected",
    },
    {
      icon: "💡",
      title: "Skills Shared",
      value: "5",
      description: "Skills added",
    },
  ];

  const recentActivities = [
    {
      icon: "📚",
      title: "Completed Python Basics",
      description: "You completed a learning session.",
      time: "2 hours ago",
    },
    {
      icon: "🤝",
      title: "New skill connection",
      description: "You connected with a new learner.",
      time: "Yesterday",
    },
    {
      icon: "💡",
      title: "Added React skill",
      description: "React was added to your shared skills.",
      time: "2 days ago",
    },
    {
      icon: "🎯",
      title: "Joined a learning session",
      description: "You joined a JavaScript practice session.",
      time: "3 days ago",
    },
  ];

  return (
    <main className="dashboard-page">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={closeSidebar}
      />

      {/* Main area */}
      <div className="dashboard-main">

        <Topbar
          onMenuClick={() => setSidebarOpen(true)}
        />

        <section className="dashboard-content">

          {/* Welcome section */}
          <div className="dashboard-intro">

            <div>
              <p className="dashboard-eyebrow">
                Dashboard
              </p>

              <h1>
                Welcome back, Tashu
              </h1>

              <p>
                Manage your learning journey, connect with
                others and keep track of your activities.
              </p>
            </div>

          </div>

          {/* Overview cards */}
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
                    {card.value}
                  </h3>

                  <p className="stat-card-description">
                    {card.description}
                  </p>

                </div>

              </div>
            ))}

          </div>

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

            <div className="activity-list">

              {recentActivities.map((activity) => (
                <div
                  className="activity-item"
                  key={activity.title}
                >

                  <div className="activity-icon">
                    {activity.icon}
                  </div>

                  <div className="activity-content">

                    <h3>
                      {activity.title}
                    </h3>

                    <p>
                      {activity.description}
                    </p>

                  </div>

                  <span className="activity-time">
                    {activity.time}
                  </span>

                </div>
              ))}

            </div>

          </section>

        </section>

      </div>

    </main>
  );
}

export default Dashboard;