
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "./SessionDetails.css";

const API_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  "http://localhost:5000/api";

const formatScheduledAt = (scheduledAt) => {
  const date = new Date(scheduledAt);

  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : date.toLocaleString();
};

const SessionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [token] = useState(() =>
    localStorage.getItem("skillbridgeToken")
  );

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(
    token ? "" : "Please log in to view this session."
  );
  const [requiresLogin, setRequiresLogin] = useState(!token);

  useEffect(() => {
    if (!token) return undefined;

    const controller = new AbortController();

    const fetchSession = async () => {
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
              : result.message || "Failed to load the session."
          );
          return;
        }

        if (!result.success || !Array.isArray(result.sessions)) {
          setError("The server returned incomplete session data.");
          return;
        }

        const selectedSession = result.sessions.find(
          (item) => item._id === id
        );

        if (!selectedSession) {
          setError("Session not found or you are not a participant.");
          return;
        }

        setSession(selectedSession);
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

    fetchSession();

    return () => controller.abort();
  }, [id, token]);

  const handleCancelSession = async () => {
    if (!token) {
      setError("Please log in to cancel this session.");
      setRequiresLogin(true);
      return;
    }

    if (session?.status !== "upcoming" || updating) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to cancel this session? This action cannot be undone."
    );

    if (!confirmed) return;

    setUpdating(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/sessions/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "cancelled" }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.success || !result.session) {
        const unauthenticated =
          response.status === 401 || response.status === 403;

        setRequiresLogin(unauthenticated);
        setError(
          unauthenticated
            ? "Your session is invalid or expired. Please log in again."
            : result.message || "Could not cancel the session."
        );
        return;
      }

      setSession((current) => ({
        ...current,
        ...result.session,
        mentor: current?.mentor,
        learner: current?.learner,
      }));
    } catch {
      setError("Could not connect to the server. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "20px" }} role="status">
        Loading session...
      </div>
    );
  }

  if (error && !session) {
    return (
      <div className="session-details-page">
        <div className="session-details-card" role="alert">
          <h1>Unable to load session</h1>
          <p>{error}</p>

          {requiresLogin && <Link to="/login">Log in</Link>}

          <button
            type="button"
            onClick={() => navigate("/sessions")}
          >
            Back to Sessions
          </button>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const status = session.status;

  const formattedDate = formatScheduledAt(session.scheduledAt);

  return (
    <div className="session-details-page">
      <button
        type="button"
        className="back-button"
        onClick={() => navigate("/sessions")}
      >
        ← Back to Sessions
      </button>

      <div className="session-details-card">
        <span className={`details-badge ${status}`}>
          {status}
        </span>

        <h1>{session.skill || "Skill session"}</h1>

        <p>
          <strong>Mentor:</strong>{" "}
          {session.mentor?.name || "Unavailable"}
        </p>

        <p>
          <strong>Learner:</strong>{" "}
          {session.learner?.name || "Unavailable"}
        </p>

        <div className="details-info">
          <div>
            <strong>📅 Scheduled</strong>
            <span>{formattedDate}</span>
          </div>

          <div>
            <strong>⏱️ Duration</strong>
            <span>{session.durationMinutes} minutes</span>
          </div>

          <div>
            <strong>🎯 Skill</strong>
            <span>{session.skill || "Unavailable"}</span>
          </div>
        </div>

        {session.meetingLink && status === "upcoming" && (
          <p>
            <a
              href={session.meetingLink}
              target="_blank"
              rel="noreferrer"
            >
              Join Meeting
            </a>
          </p>
        )}

        {error && (
          <p role="alert">
            {error}
            {requiresLogin && (
              <>
                {" "}
                <Link to="/login">Log in again</Link>
              </>
            )}
          </p>
        )}

        {status === "upcoming" && (
          <div className="session-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={handleCancelSession}
              disabled={updating}
            >
              {updating ? "Cancelling..." : "Cancel Session"}
            </button>
          </div>
        )}

        {status === "cancelled" && (
          <p className="session-status-message" role="status">
            This session has been cancelled. It cannot be reopened.
          </p>
        )}

        {status === "completed" && (
          <p className="session-status-message" role="status">
            This session has been completed.
          </p>
        )}
      </div>
    </div>
  );
};

export default SessionDetails;
