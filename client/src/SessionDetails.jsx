import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./SessionDetails.css";

const sessions = {
  1: {
    partner: "Aarav Sharma",
    skill: "Java & OOP",
    date: "Today",
    time: "6:00 PM",
    type: "Online",
    avatar: "AS",
    role: "Java Developer & Mentor",
    status: "Upcoming",
    description:
      "Learn Java fundamentals, OOP concepts and practical programming techniques.",
  },

  2: {
    partner: "Priya Mehta",
    skill: "UI/UX Design",
    date: "Tomorrow",
    time: "5:30 PM",
    type: "Online",
    avatar: "PM",
    role: "UI/UX Designer & Mentor",
    status: "Upcoming",
    description:
      "Improve your UI/UX design skills through practical design discussions.",
  },

  3: {
    partner: "Rohan Verma",
    skill: "Python & SQL",
    date: "18 Sep 2026",
    time: "7:00 PM",
    type: "Online",
    avatar: "RV",
    role: "Python Developer & Mentor",
    status: "Completed",
    description:
      "Practice Python, SQL and backend development concepts.",
  },
};

function SessionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const session = sessions[id];

  const [sessionStatus, setSessionStatus] = useState(
    session?.status || "Upcoming"
  );

  const [showReschedule, setShowReschedule] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState("");

  if (!session) {
    return (
      <div className="session-details-page">
        <div className="session-details-card">
          <h1>Session Not Found</h1>

          <button onClick={() => navigate("/sessions")}>
            Back to Sessions
          </button>
        </div>
      </div>
    );
  }

  const handleJoin = () => {
    alert(`Joining ${session.partner}'s ${session.skill} session`);
  };

  const handleCancel = () => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this session?"
    );

    if (confirmCancel) {
      setSessionStatus("Cancelled");
      alert("Session cancelled successfully.");
    }
  };

  const handleReschedule = () => {
    setShowReschedule(false);
    alert("Session reschedule request sent successfully.");
  };

  const handleFeedback = () => {
    if (!feedback.trim()) {
      alert("Please enter your feedback.");
      return;
    }

    alert("Thank you for your feedback!");
    setFeedback("");
    setShowFeedback(false);
  };

  return (
    <div className="session-details-page">

      <button
        className="back-button"
        onClick={() => navigate("/sessions")}
      >
        ← Back to Sessions
      </button>

      <div className="session-details-card">

        {/* Avatar */}
        <div className="details-avatar">
          {session.avatar}
        </div>

        {/* Status */}
        <span
          className={`details-badge ${sessionStatus.toLowerCase()}`}
        >
          {sessionStatus}
        </span>

        {/* Main Details */}
        <h1>{session.skill}</h1>

        <h2>{session.partner}</h2>

        <p className="partner-role">
          {session.role}
        </p>

        <p className="session-description">
          {session.description}
        </p>

        {/* Information */}
        <div className="details-info">

          <div>
            <strong>📅 Date</strong>
            <span>{session.date}</span>
          </div>

          <div>
            <strong>🕒 Time</strong>
            <span>{session.time}</span>
          </div>

          <div>
            <strong>💻 Session Type</strong>
            <span>{session.type}</span>
          </div>

          <div>
            <strong>🎯 Skill</strong>
            <span>{session.skill}</span>
          </div>

        </div>

        {/* Upcoming Actions */}
        {sessionStatus === "Upcoming" && (
          <div className="session-actions">

            <button
              className="join-button"
              onClick={handleJoin}
            >
              Join Session
            </button>

            <button
              className="reschedule-button"
              onClick={() => setShowReschedule(true)}
            >
              Reschedule
            </button>

            <button
              className="cancel-button"
              onClick={handleCancel}
            >
              Cancel Session
            </button>

          </div>
        )}

        {/* Completed Actions */}
        {sessionStatus === "Completed" && (
          <div className="session-actions">

            <button
              className="feedback-button"
              onClick={() => setShowFeedback(true)}
            >
              Give Feedback
            </button>

          </div>
        )}

        {/* Cancelled */}
        {sessionStatus === "Cancelled" && (
          <div className="cancelled-message">
            This session has been cancelled.
          </div>
        )}

      </div>

      {/* Reschedule Box */}
      {showReschedule && (
        <div className="popup-box">

          <h2>Reschedule Session</h2>

          <label>Select New Date</label>

          <input type="date" />

          <label>Select New Time</label>

          <input type="time" />

          <div className="popup-actions">

            <button
              className="join-button"
              onClick={handleReschedule}
            >
              Confirm
            </button>

            <button
              className="cancel-button"
              onClick={() => setShowReschedule(false)}
            >
              Close
            </button>

          </div>

        </div>
      )}

      {/* Feedback Box */}
      {showFeedback && (
        <div className="popup-box">

          <h2>Session Feedback</h2>

          <textarea
            placeholder="Write your feedback..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />

          <div className="popup-actions">

            <button
              className="feedback-button"
              onClick={handleFeedback}
            >
              Submit Feedback
            </button>

            <button
              className="cancel-button"
              onClick={() => setShowFeedback(false)}
            >
              Close
            </button>

          </div>

        </div>
      )}

    </div>
  );
}

export default SessionDetails;