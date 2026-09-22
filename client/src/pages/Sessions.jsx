import React from "react";
import { useNavigate } from "react-router-dom";
import "./Sessions.css";

const upcoming = [
  {
    id: 1,
    partner: "Aarav Sharma",
    skill: "Java & OOP",
    date: "Today",
    time: "6:00 PM",
    type: "Online",
    avatar: "AS",
  },
  {
    id: 2,
    partner: "Priya Mehta",
    skill: "UI/UX Design",
    date: "Tomorrow",
    time: "5:30 PM",
    type: "Online",
    avatar: "PM",
  },
];

const completed = [
  {
    id: 3,
    partner: "Rohan Verma",
    skill: "Python & SQL",
    date: "18 Sep 2026",
    time: "7:00 PM",
    type: "Online",
    avatar: "RV",
  },
];

function Sessions() {
  const navigate = useNavigate();

  return (
    <div className="sessions-page">

      <div className="sessions-header">
        <span>SKILLBRIDGE SESSIONS</span>

        <h1>Your Learning Sessions</h1>

        <p>
          Manage your upcoming and completed skill exchange sessions.
        </p>
      </div>

      <section className="session-section">

        <h2>Upcoming Sessions</h2>

        <div className="session-grid">

          {upcoming.map((session) => (

            <div className="session-card" key={session.id}>

              <div className="session-top">

                <div className="session-avatar">
                  {session.avatar}
                </div>

                <span className="upcoming-badge">
                  Upcoming
                </span>

              </div>

              <h3>{session.partner}</h3>

              <p>{session.skill}</p>

              <div className="session-info">
                📅 {session.date}
              </div>

              <div className="session-info">
                🕒 {session.time}
              </div>

              <div className="session-info">
                💻 {session.type}
              </div>

              <button
                onClick={() =>
                  navigate(`/session-details/${session.id}`)
                }
              >
                View Session
              </button>

            </div>

          ))}

        </div>

      </section>

      <section className="session-section">

        <h2>Completed Sessions</h2>

        <div className="session-grid">

          {completed.map((session) => (

            <div className="session-card completed" key={session.id}>

              <div className="session-top">

                <div className="session-avatar">
                  {session.avatar}
                </div>

                <span className="completed-badge">
                  Completed
                </span>

              </div>

              <h3>{session.partner}</h3>

              <p>{session.skill}</p>

              <div className="session-info">
                📅 {session.date}
              </div>

              <div className="session-info">
                🕒 {session.time}
              </div>

              <button
                onClick={() =>
                  navigate(`/session-details/${session.id}`)
                }
              >
                View Details
              </button>

            </div>

          ))}

        </div>

      </section>

    </div>
  );
}

export default Sessions;