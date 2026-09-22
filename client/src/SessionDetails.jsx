import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./SessionDetails.css";

const sessionData = {
  1: {
    partner: "Aarav Sharma",
    role: "Java Developer & Mentor",
    skill: "Java & OOP",
    date: "Today",
    time: "6:00 PM",
    duration: "60 Minutes",
    type: "Online",
    status: "Upcoming",
    avatar: "AS",
  },
  2: {
    partner: "Priya Mehta",
    role: "UI/UX Designer & Mentor",
    skill: "UI/UX Design",
    date: "Tomorrow",
    time: "5:30 PM",
    duration: "60 Minutes",
    type: "Online",
    status: "Upcoming",
    avatar: "PM",
  },
  3: {
    partner: "Rohan Verma",
    role: "Python Developer & Mentor",
    skill: "Python & SQL",
    date: "18 Sep 2026",
    time: "7:00 PM",
    duration: "60 Minutes",
    type: "Online",
    status: "Completed",
    avatar: "RV",
  },
};

function SessionDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const session = sessionData[id] || sessionData[1];

  const handleJoin = () => {
    alert(`Joining session with ${session.partner}`);
  };

  return (
    <div className="session-details-page">

      <button
        className="back-session-btn"
        onClick={() => navigate("/sessions")}
      >
        ← Back to Sessions
      </button>

      <div className="session-details-header">

        <div className="session-large-avatar">
          {session.avatar}
        </div>

        <div>
          <span className="session-label">
            SKILLBRIDGE SESSION
          </span>

          <h1>{session.skill}</h1>

          <p>{session.partner} · {session.role}</p>
        </div>

        <span
          className={
            session.status === "Completed"
              ? "status completed"
              : "status upcoming"
          }
        >
          {session.status}
        </span>

      </div>

      <div className="session-details-grid">

        <div className="session-main-card">

          <h2>Session Information</h2>

          <div className="session-detail-row">
            <span>👤 Partner</span>
            <strong>{session.partner}</strong>
          </div>

          <div className="session-detail-row">
            <span>📚 Skill</span>
            <strong>{session.skill}</strong>
          </div>

          <div className="session-detail-row">
            <span>📅 Date</span>
            <strong>{session.date}</strong>
          </div>

          <div className="session-detail-row">
            <span>🕒 Time</span>
            <strong>{session.time}</strong>
          </div>

          <div className="session-detail-row">
            <span>⏱ Duration</span>
            <strong>{session.duration}</strong>
          </div>

          <div className="session-detail-row">
            <span>💻 Type</span>
            <strong>{session.type}</strong>
          </div>

        </div>

        <div className="session-action-card">

          <div className="session-icon">
            💻
          </div>

          <h2>
            {session.status === "Completed"
              ? "Session Completed"
              : "Ready for your session?"}
          </h2>

          <p>
            {session.status === "Completed"
              ? "This learning session has already been completed."
              : "Join your scheduled SkillBridge session and start learning together."}
          </p>

          {session.status !== "Completed" && (
            <button
              className="join-session-btn"
              onClick={handleJoin}
            >
              Join Session
            </button>
          )}

          <button
            className="back-list-btn"
            onClick={() => navigate("/sessions")}
          >
            Back to Sessions
          </button>

        </div>

      </div>

    </div>
  );
}

export default SessionDetails;