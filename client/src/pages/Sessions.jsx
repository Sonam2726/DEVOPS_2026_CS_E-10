
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Sessions.css";

const API_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  "http://localhost:5000/api";

const formatScheduledAt = (scheduledAt) => {
  const date = new Date(scheduledAt);

  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : date.toLocaleString();
};

function Sessions() {
  const navigate = useNavigate();

  const [token] = useState(() =>
    localStorage.getItem("skillbridgeToken")
  );

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(Boolean(token));
  const [error, setError] = useState(
    token ? "" : "Please log in to view your sessions."
  );
  const [requiresLogin, setRequiresLogin] = useState(!token);

  useEffect(() => {
    if (!token) return undefined;

    const controller = new AbortController();

    const fetchSessions = async () => {
      try {
        const response = await fetch(`${API_URL}/sessions`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
          const unauthenticated =
            response.status === 401 || response.status === 403;

          setRequiresLogin(unauthenticated);
          setError(
            unauthenticated
              ? "Your session is invalid or expired. Please log in again."
              : result.message || "Failed to load your sessions."
          );
          return;
        }

        if (!result.success || !Array.isArray(result.sessions)) {
          setError("The server returned incomplete session data.");
          return;
        }

        setSessions(result.sessions);
        setError("");
        setRequiresLogin(false);
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

    fetchSessions();

    return () => controller.abort();
  }, [token]);

  const upcoming = sessions.filter(
    (session) => session.status === "upcoming"
  );

  const completed = sessions.filter(
    (session) => session.status === "completed"
  );

  const cancelled = sessions.filter(
    (session) => session.status === "cancelled"
  );

  const renderSessionCards = (items) => (
    <div className="session-grid">
      {items.map((session) => (
        <div
          className={`session-card ${session.status}`}
          key={session._id}
        >
          <div className="session-top">
            <div className="session-avatar">
              {(session.mentor?.name || "M").slice(0, 1)}
              {(session.learner?.name || "L").slice(0, 1)}
            </div>

            <span className={`${session.status}-badge`}>
              {session.status}
            </span>
          </div>

          <h3>{session.skill || "Skill session"}</h3>

          <p>
            Mentor: {session.mentor?.name || "Unavailable"} · Learner:{" "}
            {session.learner?.name || "Unavailable"}
          </p>

          <div className="session-info">
            📅 {formatScheduledAt(session.scheduledAt)}
          </div>

          <div className="session-info">
            ⏱️ {session.durationMinutes} minutes
          </div>

          <button
            type="button"
            onClick={() =>
              navigate(`/session-details/${session._id}`)
            }
          >
            View Details
          </button>
        </div>
      ))}
    </div>
  );

  return (
    <div className="sessions-page">
      <div className="sessions-header">
        <span>SKILLBRIDGE SESSIONS</span>

        <h1>Your Learning Sessions</h1>

        <p>
          Manage your upcoming and completed skill exchange sessions.
        </p>
      </div>

      {loading ? (
        <p role="status">Loading your sessions...</p>
      ) : error ? (
        <div role="alert">
          <p>{error}</p>

          {requiresLogin && (
            <button
              type="button"
              onClick={() => navigate("/login")}
            >
              Log in
            </button>
          )}
        </div>
      ) : (
        <>
          <section className="session-section">
            <h2>Upcoming Sessions</h2>

            {upcoming.length > 0 ? (
              renderSessionCards(upcoming)
            ) : (
              <p>No upcoming sessions.</p>
            )}
          </section>

          <section className="session-section">
            <h2>Completed Sessions</h2>

            {completed.length > 0 ? (
              renderSessionCards(completed)
            ) : (
              <p>No completed sessions.</p>
            )}
          </section>

          {cancelled.length > 0 && (
            <section className="session-section">
              <h2>Cancelled Sessions</h2>
              {renderSessionCards(cancelled)}
            </section>
          )}
        </>
      )}
    </div>
  );
}

export default Sessions;
