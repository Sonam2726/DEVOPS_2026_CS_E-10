import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Exchange.css";

const API_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  "http://localhost:5000/api";

const formatDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date unavailable" : date.toLocaleString();
};

const getId = (value) =>
  typeof value === "string" ? value : value?._id || value?.id || "";

function Exchange() {
  const navigate = useNavigate();
  const [token] = useState(() => localStorage.getItem("skillbridgeToken"));
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [requestPage, setRequestPage] = useState(1);
  const [requestPagination, setRequestPagination] = useState(null);
  const [loadingRequestsMore, setLoadingRequestsMore] = useState(false);
  const [requestPageError, setRequestPageError] = useState("");
  const [requestPageRequiresLogin, setRequestPageRequiresLogin] =
    useState(false);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(Boolean(token));
  const [error, setError] = useState(
    token ? "" : "Please log in to view your exchanges."
  );
  const [unauthorized, setUnauthorized] = useState(!token);
  const [updatingId, setUpdatingId] = useState("");
  const [actionErrors, setActionErrors] = useState({});
  const [schedulingRequest, setSchedulingRequest] = useState(null);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [duration, setDuration] = useState("60");
  const [meetingLink, setMeetingLink] = useState("");
  const [notes, setNotes] = useState("");
  const [scheduleError, setScheduleError] = useState("");
  const [scheduleSuccess, setScheduleSuccess] = useState("");
  const [scheduling, setScheduling] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    if (!token) {
      return () => controller.abort();
    }

    const loadExchange = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [requestsResponse, sessionsResponse] = await Promise.all([
          fetch(`${API_URL}/requests?page=1&limit=50`, {
            headers,
            signal: controller.signal,
          }),
          fetch(`${API_URL}/sessions`, {
            headers,
            signal: controller.signal,
          }),
        ]);
        const [requestsResult, sessionsResult] = await Promise.all([
          requestsResponse.json().catch(() => ({})),
          sessionsResponse.json().catch(() => ({})),
        ]);

        if (!requestsResponse.ok || !sessionsResponse.ok) {
          const status = !requestsResponse.ok
            ? requestsResponse.status
            : sessionsResponse.status;
          const responseBody = !requestsResponse.ok
            ? requestsResult
            : sessionsResult;
          const requiresLogin = status === 401 || status === 403;
          setUnauthorized(requiresLogin);
          setError(
            requiresLogin
              ? "Your session is invalid or expired. Please log in again."
              : responseBody.message || "Unable to load your exchange data."
          );
          return;
        }

        if (
          !requestsResult.success ||
          !Array.isArray(requestsResult.incoming) ||
          !Array.isArray(requestsResult.outgoing) ||
          !requestsResult.pagination ||
          !sessionsResult.success ||
          !Array.isArray(sessionsResult.sessions)
        ) {
          setError("The server returned incomplete exchange data.");
          return;
        }

        setIncoming(requestsResult.incoming);
        setOutgoing(requestsResult.outgoing);
        setRequestPagination(requestsResult.pagination);
        setSessions(sessionsResult.sessions);
      } catch (loadError) {
        if (loadError.name !== "AbortError") {
          setError("Could not connect to the server. Please try again.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadExchange();
    return () => controller.abort();
  }, [token]);

  const loadMoreRequests = async () => {
    if (
      !token ||
      loadingRequestsMore ||
      !requestPagination ||
      requestPage >=
        Math.max(
          requestPagination.totalIncomingPages || 0,
          requestPagination.totalOutgoingPages || 0
        )
    ) {
      return;
    }

    const nextPage = requestPage + 1;
    setLoadingRequestsMore(true);
    setRequestPageError("");
    setRequestPageRequiresLogin(false);

    try {
      const response = await fetch(
        `${API_URL}/requests?page=${nextPage}&limit=50`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const result = await response.json().catch(() => ({}));

      if (
        !response.ok ||
        result.success !== true ||
        !Array.isArray(result.incoming) ||
        !Array.isArray(result.outgoing) ||
        !result.pagination
      ) {
        const requiresLogin = response.status === 401 || response.status === 403;
        setUnauthorized(requiresLogin);
        setRequestPageRequiresLogin(requiresLogin);
        setRequestPageError(
          requiresLogin
            ? "Your session is invalid or expired. Please log in again."
            : result.message || "Unable to load more requests."
        );
        return;
      }

      setIncoming((current) => [...current, ...result.incoming]);
      setOutgoing((current) => [...current, ...result.outgoing]);
      setRequestPage(nextPage);
      setRequestPagination(result.pagination);
    } catch {
      setRequestPageError("Could not connect to the server. Please try again.");
    } finally {
      setLoadingRequestsMore(false);
    }
  };

  const updateRequestStatus = async (request, status) => {
    if (
      !request?._id ||
      request.status !== "pending" ||
      !["accepted", "rejected"].includes(status) ||
      updatingId
    ) {
      return;
    }

    const token = localStorage.getItem("skillbridgeToken");
    setUpdatingId(request._id);
    setActionErrors((current) => ({ ...current, [request._id]: "" }));

    try {
      const response = await fetch(
        `${API_URL}/requests/${request._id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );
      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.success || result.request?.status !== status) {
        const requiresLogin = response.status === 401 || response.status === 403;
        setUnauthorized(requiresLogin);
        setActionErrors((current) => ({
          ...current,
          [request._id]: requiresLogin
            ? "Your session is invalid or expired. Please log in again."
            : result.message || `Unable to ${status} this request.`,
        }));
        return;
      }

      setIncoming((current) =>
        current.map((item) =>
          item._id === request._id
            ? {
                ...result.request,
                sender: item.sender,
                receiver: item.receiver,
              }
            : item
        )
      );
    } catch {
      setActionErrors((current) => ({
        ...current,
        [request._id]: "Could not connect to the server. Please try again.",
      }));
    } finally {
      setUpdatingId("");
    }
  };

  const openScheduleForm = (request) => {
    setSchedulingRequest(request);
    setScheduleDate("");
    setScheduleTime("");
    setDuration("60");
    setMeetingLink("");
    setNotes("");
    setScheduleError("");
    setScheduleSuccess("");
  };

  const createSession = async (event) => {
    event.preventDefault();

    if (!schedulingRequest || schedulingRequest.status !== "accepted") {
      setScheduleError("Only accepted requests can be scheduled.");
      return;
    }

    const scheduledAt = new Date(`${scheduleDate}T${scheduleTime}`);
    const durationMinutes = Number(duration);
    if (
      !scheduleDate ||
      !scheduleTime ||
      Number.isNaN(scheduledAt.getTime()) ||
      scheduledAt.getTime() <= Date.now()
    ) {
      setScheduleError("Choose a valid date and time in the future.");
      return;
    }

    if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
      setScheduleError("Duration must be a positive number of minutes.");
      return;
    }

    const token = localStorage.getItem("skillbridgeToken");
    if (!token) {
      setUnauthorized(true);
      setScheduleError("Please log in to schedule a session.");
      return;
    }

    setScheduling(true);
    setScheduleError("");
    setScheduleSuccess("");

    try {
      const response = await fetch(`${API_URL}/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          requestId: schedulingRequest._id,
          scheduledAt: scheduledAt.toISOString(),
          durationMinutes,
          meetingLink: meetingLink.trim(),
          notes: notes.trim(),
        }),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.success || !result.session) {
        const requiresLogin = response.status === 401 || response.status === 403;
        setUnauthorized(requiresLogin);
        setScheduleError(
          requiresLogin
            ? "Your session is invalid or expired. Please log in again."
            : result.message || "Unable to schedule this session."
        );
        return;
      }

      setSessions((current) => [...current, result.session]);
      setScheduleSuccess("Session scheduled successfully.");
      setSchedulingRequest(null);
    } catch {
      setScheduleError("Could not connect to the server. Please try again.");
    } finally {
      setScheduling(false);
    }
  };

  const existingSessionFor = (request) =>
    sessions.find((session) => getId(session.request) === request._id);
  const scheduledPartner =
    schedulingRequest &&
    (incoming.some((request) => request._id === schedulingRequest._id)
      ? schedulingRequest.sender
      : schedulingRequest.receiver);

  const renderRequests = (items, direction) => {
    if (items.length === 0) {
      return (
        <p className="exchange-empty">
          No {direction.toLowerCase()} requests.
          {direction === "Outgoing" && (
            <>
              {" "}
              <Link to="/matching">Find a skill to learn</Link>
            </>
          )}
        </p>
      );
    }

    return (
      <div className="exchange-list">
        {items.map((request) => {
          const otherParty =
            direction === "Incoming" ? request.sender : request.receiver;
          const name = otherParty?.name || "SkillBridge member";
          const session = existingSessionFor(request);

          return (
            <article className="exchange-card" key={request._id}>
              <div className="exchange-partner">
                <div className="exchange-avatar">
                  {name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2>{name}</h2>
                  <p>{request.skillToLearn || "Skill exchange"}</p>
                </div>
                <span className={`exchange-request-status ${request.status}`}>
                  {request.status}
                </span>
              </div>

              {request.message && (
                <p className="exchange-message">{request.message}</p>
              )}
              <p className="exchange-date">
                Requested {formatDate(request.createdAt)}
              </p>

              {actionErrors[request._id] && (
                <p className="exchange-error" role="alert">
                  {actionErrors[request._id]}
                  {unauthorized && (
                    <>
                      {" "}
                      <Link to="/login">Log in</Link>
                    </>
                  )}
                </p>
              )}

              {direction === "Incoming" && request.status === "pending" && (
                <div className="exchange-actions">
                  <button
                    type="button"
                    className="exchange-request-btn"
                    disabled={Boolean(updatingId)}
                    onClick={() => updateRequestStatus(request, "accepted")}
                  >
                    {updatingId === request._id ? "Updating..." : "Accept Request"}
                  </button>
                  <button
                    type="button"
                    className="exchange-view-btn"
                    disabled={Boolean(updatingId)}
                    onClick={() => updateRequestStatus(request, "rejected")}
                  >
                    Reject
                  </button>
                </div>
              )}

              {request.status === "accepted" &&
                (session ? (
                  <div className="exchange-session-link">
                    <p>
                      Session {session.status}: {formatDate(session.scheduledAt)}
                    </p>
                    <button
                      type="button"
                      className="exchange-view-btn"
                      onClick={() => navigate(`/session-details/${session._id}`)}
                    >
                      View Session
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="exchange-request-btn"
                    onClick={() => openScheduleForm(request)}
                  >
                    Schedule Session
                  </button>
                ))}
            </article>
          );
        })}
      </div>
    );
  };

  return (
    <main className="exchange-page">
      <div className="exchange-container">
        <button
          className="exchange-back-btn"
          type="button"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>

        <header className="exchange-header">
          <h1>Skill Exchange</h1>
          <p>Manage your real requests and scheduled skill sessions.</p>
        </header>

        {loading && (
          <p className="exchange-state" role="status">
            Loading your exchanges...
          </p>
        )}

        {!loading && error && (
          <div className="exchange-state exchange-error" role="alert">
            <p>{error}</p>
            {unauthorized && (
              <Link to="/login" className="exchange-login-link">
                Log in
              </Link>
            )}
          </div>
        )}

        {scheduleSuccess && (
          <p className="exchange-success exchange-state" role="status">
            {scheduleSuccess}
          </p>
        )}

        {!loading && !error && (
          <>
            <section className="exchange-section">
              <h2>Incoming Requests</h2>
              {renderRequests(incoming, "Incoming")}
            </section>

            <section className="exchange-section">
              <h2>Outgoing Requests</h2>
              {renderRequests(outgoing, "Outgoing")}
            </section>

            {requestPagination &&
              requestPage <
                Math.max(
                  requestPagination.totalIncomingPages || 0,
                  requestPagination.totalOutgoingPages || 0
                ) && (
                <div className="exchange-pagination">
                  {requestPageError && (
                    <p className="exchange-error" role="alert">
                      {requestPageError}
                      {requestPageRequiresLogin && (
                        <>
                          {" "}
                          <Link to="/login">Log in</Link>
                        </>
                      )}
                    </p>
                  )}
                  <button
                    type="button"
                    className="exchange-request-btn"
                    onClick={loadMoreRequests}
                    disabled={loadingRequestsMore}
                  >
                    {loadingRequestsMore
                      ? "Loading more requests..."
                      : requestPageError
                        ? "Retry loading more"
                        : "Load more requests"}
                  </button>
                </div>
              )}

            <section className="exchange-section">
              <h2>Your Sessions</h2>
              {sessions.length === 0 ? (
                <p className="exchange-empty">
                  No sessions yet. Accept a request or wait for your request to
                  be accepted before scheduling.
                </p>
              ) : (
                <div className="exchange-list">
                  {sessions.map((session) => (
                    <article className="exchange-card" key={session._id}>
                      <div className="exchange-partner">
                        <div className="exchange-avatar">
                          {(session.mentor?.name || "M").charAt(0)}
                        </div>
                        <div>
                          <h2>{session.skill || "Skill session"}</h2>
                          <p>
                            Mentor: {session.mentor?.name || "Unavailable"} ·
                            Learner: {session.learner?.name || "Unavailable"}
                          </p>
                        </div>
                        <span
                          className={`exchange-request-status ${session.status}`}
                        >
                          {session.status}
                        </span>
                      </div>
                      <p className="exchange-date">
                        {formatDate(session.scheduledAt)} ·{" "}
                        {session.durationMinutes} minutes
                      </p>
                      <button
                        type="button"
                        className="exchange-view-btn"
                        onClick={() =>
                          navigate(`/session-details/${session._id}`)
                        }
                      >
                        View Session
                      </button>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {schedulingRequest && (
          <section className="exchange-schedule-section">
            <h2>Schedule an Accepted Request</h2>
            <p>
              {schedulingRequest.skillToLearn} with{" "}
              {scheduledPartner?.name || "SkillBridge member"}
            </p>
            <form className="exchange-schedule-form" onSubmit={createSession}>
              <label>
                Date
                <input
                  type="date"
                  required
                  value={scheduleDate}
                  onChange={(event) => setScheduleDate(event.target.value)}
                />
              </label>
              <label>
                Time
                <input
                  type="time"
                  required
                  value={scheduleTime}
                  onChange={(event) => setScheduleTime(event.target.value)}
                />
              </label>
              <label>
                Duration (minutes)
                <input
                  type="number"
                  min="1"
                  required
                  value={duration}
                  onChange={(event) => setDuration(event.target.value)}
                />
              </label>
              <label>
                Meeting link (optional)
                <input
                  type="url"
                  value={meetingLink}
                  onChange={(event) => setMeetingLink(event.target.value)}
                />
              </label>
              <label className="exchange-notes-label">
                Notes (optional)
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                />
              </label>
              {scheduleError && (
                <p className="exchange-error" role="alert">
                  {scheduleError}
                  {unauthorized && (
                    <>
                      {" "}
                      <Link to="/login">Log in</Link>
                    </>
                  )}
                </p>
              )}
              {scheduleSuccess && (
                <p className="exchange-success" role="status">
                  {scheduleSuccess}
                </p>
              )}
              <div className="exchange-actions">
                <button
                  type="submit"
                  className="exchange-request-btn"
                  disabled={scheduling}
                >
                  {scheduling ? "Scheduling..." : "Confirm Session"}
                </button>
                <button
                  type="button"
                  className="exchange-view-btn"
                  disabled={scheduling}
                  onClick={() => setSchedulingRequest(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}
      </div>
    </main>
  );
}

export default Exchange;
