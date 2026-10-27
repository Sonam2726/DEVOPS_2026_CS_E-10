import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import "./Requests.css";

const API_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  "http://localhost:5000/api";

const getLocalDateInputValue = () => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
};

function Requests() {
  const [searchParams] = useSearchParams();
  const requestIdFromUrl = searchParams.get("requestId");
  const requestTypeFromUrl = searchParams.get("type")?.toLowerCase();
  const initialRequestType =
    requestTypeFromUrl === "incoming" ||
    (!requestTypeFromUrl && requestIdFromUrl)
      ? "Incoming"
      : "Outgoing";

  const [filter, setFilter] = useState("All");
  const [requestType, setRequestType] = useState(initialRequestType);
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [loadMoreError, setLoadMoreError] = useState("");
  const [loadMoreRequiresLogin, setLoadMoreRequiresLogin] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [updatingRequests, setUpdatingRequests] = useState({});
  const [actionErrors, setActionErrors] = useState({});
  const [schedulingRequest, setSchedulingRequest] = useState(null);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [scheduleDuration, setScheduleDuration] = useState("60");
  const [meetingLink, setMeetingLink] = useState("");
  const [sessionNotes, setSessionNotes] = useState("");
  const [scheduleError, setScheduleError] = useState("");
  const [scheduleRequiresLogin, setScheduleRequiresLogin] = useState(false);
  const [scheduleSubmitting, setScheduleSubmitting] = useState(false);
  const [scheduleSucceeded, setScheduleSucceeded] = useState(false);
  const requestsInProgress = useRef(new Set());

  useEffect(() => {
    if (!requestIdFromUrl || incoming.length === 0) return;

    const requestElement = document.getElementById(
      `request-${requestIdFromUrl}`
    );

    if (requestElement && typeof requestElement.scrollIntoView === "function") {
      requestElement.scrollIntoView({ block: "center" });
    }
  }, [incoming, requestIdFromUrl]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchRequests = async () => {
      const token = localStorage.getItem("skillbridgeToken");

      if (!token) {
        if (page === 1) setError("Please log in to view your requests.");
        else setLoadMoreError("Please log in to load more requests.");
        setLoading(false);
        setLoadingMore(false);
        return;
      }

      if (page === 1) {
        setLoading(true);
        setError("");
      } else {
        setLoadingMore(true);
        setLoadMoreError("");
        setLoadMoreRequiresLogin(false);
      }

      try {
        const response = await fetch(
          `${API_URL}/requests?page=${page}&limit=10`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          }
        );

        const result = await response.json().catch(() => ({}));

        if (
          !response.ok ||
          result.success !== true ||
          !Array.isArray(result.incoming) ||
          !Array.isArray(result.outgoing) ||
          !result.pagination
        ) {
          const message =
            result.message || "The server returned incomplete request data.";
          if (page === 1) setError(message);
          else {
            setLoadMoreError(message);
            setLoadMoreRequiresLogin(
              response.status === 401 || response.status === 403
            );
          }
          return;
        }

        setIncoming((current) =>
          page === 1 ? result.incoming : [...current, ...result.incoming]
        );
        setOutgoing((current) =>
          page === 1 ? result.outgoing : [...current, ...result.outgoing]
        );
        setPagination(result.pagination);
        setLoadMoreError("");
      } catch (fetchError) {
        if (fetchError.name !== "AbortError") {
          const message = "Could not connect to the server. Please try again.";
          if (page === 1) setError(message);
          else {
            setLoadMoreError(message);
            setLoadMoreRequiresLogin(false);
          }
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    };

    fetchRequests();
    return () => controller.abort();
  }, [page, reloadKey]);

  const handleStatusUpdate = async (request, status) => {
    if (
      requestType !== "Incoming" ||
      request.status?.toLowerCase() !== "pending" ||
      !["accepted", "rejected"].includes(status) ||
      requestsInProgress.current.has(request._id)
    ) {
      return;
    }

    const token = localStorage.getItem("skillbridgeToken");
    if (!token || token === "demo-token") {
      setActionErrors((current) => ({
        ...current,
        [request._id]: token
          ? "Demo login is not valid for API requests. Log in with a server account."
          : "Please log in to manage incoming requests.",
      }));
      return;
    }

    requestsInProgress.current.add(request._id);
    setUpdatingRequests((current) => ({ ...current, [request._id]: status }));
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

      if (
        !response.ok ||
        !result.success ||
        result.request?.status !== status
      ) {
        throw new Error(
          result.message || `Unable to ${status} this request. Please try again.`
        );
      }

      setIncoming((current) =>
        current.map((item) =>
          item._id === request._id
            ? { ...item, status: result.request.status }
            : item
        )
      );
    } catch (actionError) {
      setActionErrors((current) => ({
        ...current,
        [request._id]:
          actionError instanceof TypeError
            ? "Could not connect to the server. Please try again."
            : actionError.message || "Unable to update this request.",
      }));
    } finally {
      requestsInProgress.current.delete(request._id);
      setUpdatingRequests((current) => {
        const next = { ...current };
        delete next[request._id];
        return next;
      });
    }
  };

  const openSchedulingForm = (request) => {
    setSchedulingRequest(request);
    setScheduleDate("");
    setScheduleTime("");
    setScheduleDuration("60");
    setMeetingLink("");
    setSessionNotes("");
    setScheduleError("");
    setScheduleRequiresLogin(false);
    setScheduleSucceeded(false);
  };

  const handleScheduleSession = async (event) => {
    event.preventDefault();

    if (
      !schedulingRequest ||
      requestType !== "Incoming" ||
      schedulingRequest.status?.toLowerCase() !== "accepted"
    ) {
      setScheduleError("Only accepted incoming requests can be scheduled.");
      return;
    }

    const token = localStorage.getItem("skillbridgeToken");
    if (!token || token === "demo-token") {
      setScheduleRequiresLogin(true);
      setScheduleError(
        token
          ? "Demo login is not valid for API requests. Log in with a server account."
          : "Please log in to schedule a session."
      );
      return;
    }

    const scheduledDateTime = new Date(`${scheduleDate}T${scheduleTime}`);
    const duration = Number(scheduleDuration);

    if (!scheduleDate || !scheduleTime || Number.isNaN(scheduledDateTime.getTime())) {
      setScheduleError("Choose a valid date and time.");
      return;
    }

    if (scheduledDateTime.getTime() <= Date.now()) {
      setScheduleError("Choose a date and time in the future.");
      return;
    }

    if (!Number.isFinite(duration) || duration <= 0) {
      setScheduleError("Duration must be a positive number of minutes.");
      return;
    }

    setScheduleSubmitting(true);
    setScheduleError("");
    setScheduleRequiresLogin(false);

    try {
      const response = await fetch(`${API_URL}/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          requestId: schedulingRequest._id,
          scheduledAt: scheduledDateTime.toISOString(),
          durationMinutes: duration,
          meetingLink: meetingLink.trim(),
          notes: sessionNotes.trim(),
        }),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.success || !result.session) {
        const unauthenticated = response.status === 401 || response.status === 403;
        setScheduleRequiresLogin(unauthenticated);
        setScheduleError(
          unauthenticated
            ? "Your session is invalid or expired. Please log in again."
            : result.message || "Could not schedule the session. Please try again."
        );
        return;
      }

      setScheduleSucceeded(true);
    } catch (scheduleRequestError) {
      setScheduleError(
        scheduleRequestError instanceof TypeError
          ? "Could not connect to the server. Please try again."
          : "Could not schedule the session. Please try again."
      );
    } finally {
      setScheduleSubmitting(false);
    }
  };

  const currentRequests =
    requestType === "Incoming" ? incoming : outgoing;

  const filteredRequests =
    filter === "All"
      ? currentRequests
      : currentRequests.filter(
          (request) =>
            request.status?.toLowerCase() === filter.toLowerCase()
        );

  const currentTotalPages =
    requestType === "Incoming"
      ? pagination?.totalIncomingPages || 0
      : pagination?.totalOutgoingPages || 0;
  const hasMoreRequests =
    pagination && pagination.page < currentTotalPages;

  const loadMoreRequests = () => {
    if (loadingMore || !hasMoreRequests) return;
    if (page > pagination.page) setReloadKey((key) => key + 1);
    else setPage(pagination.page + 1);
  };

  const getPersonName = (request) => {
    const person =
      requestType === "Incoming" ? request.sender : request.receiver;

    if (person && typeof person === "object") {
      return person.name || "Unknown user";
    }

    return "User details unavailable";
  };

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <main className="requests-page">
      <section className="requests-header">
        <p>MY ACTIVITY</p>
        <h1>My Learning Requests</h1>
        <span>Track the skills you have requested to learn.</span>
      </section>

      <section className="requests-container">
        <div className="request-filters">
          {["Outgoing", "Incoming"].map((item) => (
            <button
              key={item}
              className={
                requestType === item
                  ? "request-filter active"
                  : "request-filter"
              }
              onClick={() => {
                setRequestType(item);
                if (page !== 1) setPage(1);
              }}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="request-filters">
          {["All", "Pending", "Accepted", "Rejected"].map((item) => (
            <button
              key={item}
              className={
                filter === item
                  ? "request-filter active"
                  : "request-filter"
              }
              onClick={() => setFilter(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="requests-list">
          {loading ? (
            <p>Loading your requests...</p>
          ) : error ? (
            <div className="empty-requests">
              <h2>Unable to Load Requests</h2>
              <p>{error}</p>
              <Link to="/login" className="explore-button">
                Go to Login
              </Link>
            </div>
          ) : filteredRequests.length > 0 ? (
            filteredRequests.map((request) => (
              <div
                className={`request-card ${
                  request._id === requestIdFromUrl
                    ? "request-card-highlighted"
                    : ""
                }`}
                id={`request-${request._id}`}
                key={request._id}
              >
                <div className="request-icon">
                  {(request.skillToLearn || "?").charAt(0)}
                </div>

                <div className="request-info">
                  <h3>{request.skillToLearn || "Skill not specified"}</h3>

                  <p>
                    {requestType === "Incoming" ? "From: " : "To: "}
                    <strong>{getPersonName(request)}</strong>
                  </p>

                  <div className="request-meta">
                    <span>{request.message || "No message"}</span>
                    <span>{formatDate(request.createdAt)}</span>
                  </div>
                </div>

                <div className="request-status">
                  <span
                    className={`status ${(request.status || "pending").toLowerCase()}`}
                  >
                    {request.status || "Pending"}
                  </span>
                  {requestType === "Incoming" &&
                    request.status?.toLowerCase() === "pending" && (
                      <>
                        <button
                          type="button"
                          className="request-filter"
                          disabled={Boolean(updatingRequests[request._id])}
                          onClick={() =>
                            handleStatusUpdate(request, "accepted")
                          }
                        >
                          {updatingRequests[request._id] === "accepted"
                            ? "Accepting..."
                            : "Accept"}
                        </button>
                        <button
                          type="button"
                          className="request-filter"
                          disabled={Boolean(updatingRequests[request._id])}
                          onClick={() =>
                            handleStatusUpdate(request, "rejected")
                          }
                        >
                          {updatingRequests[request._id] === "rejected"
                            ? "Rejecting..."
                            : "Reject"}
                        </button>
                      </>
                    )}
                  {requestType === "Incoming" &&
                    request.status?.toLowerCase() === "accepted" && (
                      <>
                        <Link
                          className="schedule-session-button"
                          to={`/chat?participantId=${request.sender?._id || request.sender?.id || ""}`}
                        >
                          Message
                        </Link>
                        <button
                          type="button"
                          className="schedule-session-button"
                          onClick={() => openSchedulingForm(request)}
                        >
                          Schedule Session
                        </button>
                      </>
                    )}
                  {requestType === "Outgoing" &&
                    request.status?.toLowerCase() === "accepted" && (
                      <Link
                        className="schedule-session-button"
                        to={`/chat?participantId=${request.receiver?._id || request.receiver?.id || ""}`}
                      >
                        Message
                      </Link>
                    )}
                  {actionErrors[request._id] && (
                    <p role="alert">{actionErrors[request._id]}</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="empty-requests">
              <h2>No Requests Found</h2>
              <p>
                You don't have any {filter.toLowerCase()}{" "}
                {requestType.toLowerCase()} requests.
              </p>
              <Link to="/search" className="explore-button">
                Explore Skills
              </Link>
            </div>
          )}
        </div>
        {!loading && !error && hasMoreRequests && (
          <div className="requests-pagination">
            {loadMoreError && (
              <p role="alert" className="requests-pagination-error">
                {loadMoreError}
                {loadMoreRequiresLogin && (
                  <>
                    {" "}
                    <Link to="/login">Log in</Link>
                  </>
                )}
              </p>
            )}
            <button
              type="button"
              className="requests-load-more"
              onClick={loadMoreRequests}
              disabled={loadingMore}
            >
              {loadingMore
                ? "Loading more requests..."
                : loadMoreError || page > pagination.page
                  ? "Retry loading more"
                  : "Load more requests"}
            </button>
          </div>
        )}
      </section>

      {schedulingRequest && (
        <div
          className="schedule-modal-backdrop"
          onClick={(event) => {
            if (event.target === event.currentTarget && !scheduleSubmitting) {
              setSchedulingRequest(null);
            }
          }}
        >
          <section
            className="schedule-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="schedule-session-title"
          >
            <button
              type="button"
              className="schedule-modal-close"
              aria-label="Close scheduling form"
              onClick={() => setSchedulingRequest(null)}
              disabled={scheduleSubmitting}
            >
              ×
            </button>
            {scheduleSucceeded ? (
              <div className="schedule-success" role="status">
                <h2 id="schedule-session-title">Session scheduled</h2>
                <p>Your learning session has been created successfully.</p>
                <Link to="/sessions" className="schedule-session-submit">
                  Go to Sessions
                </Link>
              </div>
            ) : (
              <>
                <h2 id="schedule-session-title">Schedule Session</h2>
                <p className="schedule-modal-description">
                  Set a time for the accepted request to learn{" "}
                  <strong>{schedulingRequest.skillToLearn}</strong>.
                </p>
                <form onSubmit={handleScheduleSession}>
                  <label className="schedule-form-field">
                    Date
                    <input
                      type="date"
                      value={scheduleDate}
                      min={getLocalDateInputValue()}
                      onChange={(event) => setScheduleDate(event.target.value)}
                      required
                    />
                  </label>
                  <label className="schedule-form-field">
                    Time
                    <input
                      type="time"
                      value={scheduleTime}
                      onChange={(event) => setScheduleTime(event.target.value)}
                      required
                    />
                  </label>
                  <label className="schedule-form-field">
                    Duration (minutes)
                    <input
                      type="number"
                      min="1"
                      step="any"
                      value={scheduleDuration}
                      onChange={(event) => setScheduleDuration(event.target.value)}
                      required
                    />
                  </label>
                  <label className="schedule-form-field">
                    Meeting link <span>(optional)</span>
                    <input
                      type="url"
                      value={meetingLink}
                      onChange={(event) => setMeetingLink(event.target.value)}
                      placeholder="https://"
                    />
                  </label>
                  <label className="schedule-form-field">
                    Notes <span>(optional)</span>
                    <textarea
                      value={sessionNotes}
                      onChange={(event) => setSessionNotes(event.target.value)}
                      rows="3"
                    />
                  </label>
                  {scheduleError && (
                    <p className="schedule-form-error" role="alert">
                      {scheduleError}
                      {scheduleRequiresLogin && (
                        <>
                          {" "}
                          <Link to="/login">Log in</Link>
                        </>
                      )}
                    </p>
                  )}
                  <div className="schedule-form-actions">
                    <button
                      type="submit"
                      className="schedule-session-submit"
                      disabled={scheduleSubmitting}
                    >
                      {scheduleSubmitting ? "Scheduling..." : "Create Session"}
                    </button>
                    <button
                      type="button"
                      className="schedule-session-cancel"
                      onClick={() => setSchedulingRequest(null)}
                      disabled={scheduleSubmitting}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </>
            )}
          </section>
        </div>
      )}
    </main>
  );
}

export default Requests;