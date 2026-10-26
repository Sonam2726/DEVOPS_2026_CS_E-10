import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./SkillPreview.css";

const API_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  "http://localhost:5000/api";
const OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i;

const getResponseBody = async (response) =>
  response.json().catch(() => ({}));

const getApiError = (result, fallback) =>
  typeof result?.message === "string" && result.message.trim()
    ? result.message
    : fallback;

async function submitLearningRequest(skill, message) {
  const token = localStorage.getItem("skillbridgeToken");
  if (!token) {
    throw new Error("Please log in to request this skill.");
  }
  if (token === "demo-token") {
    throw new Error("Demo login is not valid for API requests. Log in with a server account.");
  }

  const ownerId = skill.owner?._id;
  if (!ownerId) {
    throw new Error("This skill has no available owner account to receive a request.");
  }

  const identityResponse = await fetch(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const identityResult = await getResponseBody(identityResponse);
  if (!identityResponse.ok || !identityResult.success) {
    throw new Error(getApiError(identityResult, "Unable to verify your account."));
  }

  const currentUserId =
    identityResult.data?.user?.id || identityResult.data?.user?._id;
  if (!currentUserId) {
    throw new Error("The server did not provide your account identity.");
  }
  if (String(currentUserId) === String(ownerId)) {
    throw new Error("You cannot send a learning request to your own skill.");
  }

  const requestsResponse = await fetch(`${API_URL}/requests?page=1&limit=50`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const requestsResult = await getResponseBody(requestsResponse);
  if (
    !requestsResponse.ok ||
    !requestsResult.success ||
    !Array.isArray(requestsResult.outgoing)
  ) {
    throw new Error(getApiError(requestsResult, "Unable to check existing requests."));
  }

  const hasPendingDuplicate = (requests) =>
    requests.some((request) => {
      const receiverId =
        typeof request.receiver === "object"
          ? request.receiver?._id
          : request.receiver;
      return (
        String(receiverId) === String(ownerId) &&
        request.skillToLearn === skill.name &&
        request.status === "pending"
      );
    });

  if (hasPendingDuplicate(requestsResult.outgoing)) {
    throw new Error("A pending request for this skill already exists.");
  }

  const totalPages = Math.max(
    1,
    Number(requestsResult.pagination?.totalOutgoingPages) || 1
  );
  for (let page = 2; page <= totalPages; page += 1) {
    const pageResponse = await fetch(
      `${API_URL}/requests?page=${page}&limit=50`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const pageResult = await getResponseBody(pageResponse);
    if (!pageResponse.ok || !pageResult.success || !Array.isArray(pageResult.outgoing)) {
      throw new Error(getApiError(pageResult, "Unable to check existing requests."));
    }
    if (hasPendingDuplicate(pageResult.outgoing)) {
      throw new Error("A pending request for this skill already exists.");
    }
  }

  const body = {
    receiverId: ownerId,
    skillToLearn: skill.name,
  };
  if (message.trim()) body.message = message.trim();

  const response = await fetch(`${API_URL}/requests`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  const result = await getResponseBody(response);

  if (!response.ok || !result.success || !result.request) {
    throw new Error(getApiError(result, "The learning request could not be submitted."));
  }
}

function SkillPreview() {
  const { id } = useParams();
  const [skillState, setSkillState] = useState(() => ({
    id,
    loading: Boolean(id && OBJECT_ID_PATTERN.test(id)),
    skill: null,
    error: "",
  }));
  const [message, setMessage] = useState("");
  const [requestState, setRequestState] = useState({
    id,
    submitting: false,
    success: false,
    error: "",
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Clear the draft when navigating to another skill.
    setMessage("");
  }, [id]);

  useEffect(() => {
    if (!id || !OBJECT_ID_PATTERN.test(id)) return undefined;

    const controller = new AbortController();
    const fetchSkill = async () => {
      try {
        const response = await fetch(`${API_URL}/skills/${id}`, {
          signal: controller.signal,
        });
        const result = await getResponseBody(response);

        if (!response.ok || !result.success || !result.data) {
          throw new Error(getApiError(result, "Unable to load this skill."));
        }

        setSkillState({ id, loading: false, skill: result.data, error: "" });
      } catch (fetchError) {
        if (fetchError.name !== "AbortError") {
          setSkillState({
            id,
            loading: false,
            skill: null,
            error: fetchError.message || "Unable to load this skill.",
          });
        }
      }
    };

    fetchSkill();
    return () => controller.abort();
  }, [id]);

  const currentSkillState =
    skillState.id === id
      ? skillState
      : { loading: true, skill: null, error: "" };
  const currentRequestState =
    requestState.id === id
      ? requestState
      : { submitting: false, success: false, error: "" };

  const handleRequest = async (event) => {
    event.preventDefault();
    if (!currentSkillState.skill || currentRequestState.submitting) return;

    setRequestState({ id, submitting: true, success: false, error: "" });
    try {
      await submitLearningRequest(currentSkillState.skill, message);
      setRequestState({ id, submitting: false, success: true, error: "" });
      setMessage("");
    } catch (requestError) {
      setRequestState({
        id,
        submitting: false,
        success: false,
        error: requestError.message || "The learning request could not be submitted.",
      });
    }
  };

  if (!id || !OBJECT_ID_PATTERN.test(id)) {
    return (
      <main className="skill-details">
        <div className="not-found">
          <h2>Invalid Skill ID</h2>
          <p>Select a skill from the discovery or search results.</p>
          <Link to="/search" className="back-button">Back to Search</Link>
        </div>
      </main>
    );
  }

  if (currentSkillState.loading) {
    return <main className="skill-details" role="status">Loading skill...</main>;
  }

  if (currentSkillState.error || !currentSkillState.skill) {
    return (
      <main className="skill-details">
        <div className="not-found" role="alert">
          <h2>Unable to Load Skill</h2>
          <p>{currentSkillState.error || "Skill not found."}</p>
          <Link to="/search" className="back-button">Back to Search</Link>
        </div>
      </main>
    );
  }

  const skill = currentSkillState.skill;
  const ownerName = skill.owner?.name || "Unavailable";

  return (
    <main className="skill-details">
      <div className="details-container">
        <Link to="/search" className="back-link">← Back to Search</Link>

        <section className="skill-main">
          <div className="skill-main-content">
            <span className="skill-category">{skill.category}</span>
            <h1>{skill.name}</h1>
            <p className="skill-description">{skill.description}</p>
            <div className="skill-info">
              <span><strong>Level:</strong> {skill.level}</span>
              <span><strong>Teacher:</strong> {ownerName}</span>
            </div>

            {currentRequestState.success ? (
              <div role="status">
                <h2>Request Sent</h2>
                <p>The server confirmed your learning request.</p>
              </div>
            ) : (
              <form onSubmit={handleRequest}>
                {!skill.owner?._id && (
                  <p role="alert">
                    Requests are unavailable because this skill has no owner ID.
                  </p>
                )}
                <label htmlFor="skill-request-message">Optional message</label>
                <textarea
                  id="skill-request-message"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  maxLength={500}
                />
                <button
                  className="request-button"
                  type="submit"
                  disabled={currentRequestState.submitting || !skill.owner?._id}
                >
                  {currentRequestState.submitting ? "Sending..." : "Request to Learn"}
                </button>
                {currentRequestState.error && (
                  <p role="alert">{currentRequestState.error}</p>
                )}
              </form>
            )}
          </div>
        </section>

        <section className="teacher-section">
          <div className="teacher-avatar">
            {ownerName === "Unavailable" ? "?" : ownerName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="teacher-label">SKILL TEACHER</p>
            <h2>{ownerName}</h2>
            <p>{skill.name} skill owner</p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default SkillPreview;
