import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import "./MatchDetails.css";
import ContextualNavigation from "../components/ContextualNavigation";

const API_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  "http://localhost:5000/api";
const OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i;

const getObjectId = (value) =>
  typeof value === "string" ? value : value?._id || value?.id;

function MatchDetails() {
  const { id } = useParams();
  const location = useLocation();
  const shouldFocusRequestForm = location.state?.focusRequestForm === true;
  const [user, setUser] = useState(null);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [unauthorized, setUnauthorized] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [requestSent, setRequestSent] = useState(false);
  const requestCardRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchMatch = async () => {
      const token = localStorage.getItem("skillbridgeToken");

      if (!token) {
        setUnauthorized(true);
        setError("Please log in to view match details.");
        setLoading(false);
        return;
      }

      if (!OBJECT_ID_PATTERN.test(id || "")) {
        setError("This match has an invalid user ID.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/matches/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
          const requiresLogin = response.status === 401 || response.status === 403;
          setUnauthorized(requiresLogin);
          setError(
            requiresLogin
              ? "Your session is invalid or expired. Please log in again."
              : result.message || "Unable to load this match."
          );
          return;
        }

        if (!result.success || !result.user) {
          setError("The server returned incomplete match details.");
          return;
        }

        const match = result.user;
        const matchId = getObjectId(match);
        const skillReferences = Array.isArray(match.skillsToTeach)
          ? match.skillsToTeach
          : [];

        setUser(match);

        const resolvedSkills = await Promise.all(
          skillReferences.map(async (skillReference) => {
            if (
              skillReference &&
              typeof skillReference === "object" &&
              skillReference.name &&
              getObjectId(skillReference.owner) === matchId
            ) {
              return skillReference;
            }

            const skillId = getObjectId(skillReference);
            if (!skillId) return null;

            const skillResponse = await fetch(`${API_URL}/skills/${skillId}`, {
              signal: controller.signal,
            });
            const skillResult = await skillResponse.json().catch(() => ({}));

            if (!skillResponse.ok) {
              setUnauthorized(
                skillResponse.status === 401 || skillResponse.status === 403
              );
              throw new Error(
                skillResult.message || "Unable to load this user's teaching skills."
              );
            }

            if (!skillResult.success || !skillResult.data) {
              throw new Error("The server returned incomplete skill data.");
            }

            return skillResult.data;
          })
        );

        const ownedSkills = resolvedSkills.filter(
          (skill) =>
            skill &&
            skill.name &&
            getObjectId(skill.owner) === matchId
        );
        setSkills(ownedSkills);
        setSelectedSkill(ownedSkills[0]?.name || "");
      } catch (fetchError) {
        if (fetchError.name !== "AbortError") {
          setError(fetchError.message || "Could not connect to the server.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchMatch();
    return () => controller.abort();
  }, [id]);

  useEffect(() => {
    if (
      !shouldFocusRequestForm ||
      loading ||
      skills.length === 0 ||
      !requestCardRef.current
    ) {
      return;
    }

    requestCardRef.current.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    requestCardRef.current.focus({ preventScroll: true });
  }, [shouldFocusRequestForm, loading, skills.length]);

  const sendRequest = async (event) => {
    event.preventDefault();
    if (!user || !selectedSkill || submitting) return;

    const token = localStorage.getItem("skillbridgeToken");
    if (!token) {
      setUnauthorized(true);
      setRequestError("Please log in again to send a request.");
      return;
    }

    const receiverId = getObjectId(user);
    if (!receiverId) {
      setRequestError("The match does not have a valid user ID.");
      return;
    }

    setSubmitting(true);
    setRequestError("");

    try {
      const response = await fetch(`${API_URL}/requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiverId,
          skillToLearn: selectedSkill,
          ...(message.trim() ? { message: message.trim() } : {}),
        }),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok || result.success !== true || !result.request) {
        const requiresLogin = response.status === 401 || response.status === 403;
        setUnauthorized(requiresLogin);
        setRequestError(
          requiresLogin
            ? "Your session is invalid or expired. Please log in again."
            : result.message || "Unable to send this learning request."
        );
        return;
      }

      setRequestSent(true);
    } catch {
      setRequestError("Could not connect to the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="match-details-page">
        <p className="match-details-state" role="status">
          Loading match details...
        </p>
      </main>
    );
  }

  if (error || !user) {
    return (
      <main className="match-details-page">
        <ContextualNavigation
          label="Match Details"
          fallbackPath="/matching"
          fallbackLabel="Matching"
        />
        <div className="details-card match-details-state" role="alert">
          <h1>{unauthorized ? "Login Required" : "Unable to Load Match"}</h1>
          <p>{error || "Match details are not available."}</p>
          {unauthorized && (
            <Link to="/login" className="match-login-link">
              Log in
            </Link>
          )}
        </div>
      </main>
    );
  }

  const name = user.name || "SkillBridge member";
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return (
    <main className="match-details-page">
      <section className="match-profile-header">
        <div className="large-avatar">
          {user.profileImage ? (
            <img src={user.profileImage} alt="" />
          ) : (
            initials || "?"
          )}
        </div>

        <div className="profile-main-info">
          <span className="profile-label">RECOMMENDED MATCH</span>
          <h1>{name}</h1>
          <p>{user.location || "SkillBridge member"}</p>
          {user.email && (
            <div className="profile-meta">
              <span>{user.email}</span>
            </div>
          )}
        </div>
      </section>

      <div className="match-details-content">
        <div className="details-left">
          <section className="details-card">
            <h2>About</h2>
            <p className="about-text">
              {user.bio || "This member has not added a bio yet."}
            </p>
          </section>

          <section className="details-card">
            <h2>Teaching Skills</h2>
            {skills.length > 0 ? (
              <div className="skill-tags">
                {skills.map((skill) => (
                  <span key={getObjectId(skill) || skill.name}>{skill.name}</span>
                ))}
              </div>
            ) : (
              <p className="card-description">
                No teaching skills are currently linked to this match.
              </p>
            )}
          </section>
        </div>

        <aside className="details-right">
          <section
            ref={requestCardRef}
            className="request-match-card"
            tabIndex={-1}
            aria-labelledby="request-match-heading"
          >
            <div className="request-icon">🤝</div>
            {requestSent ? (
              <>
                <h2 id="request-match-heading">Request Sent</h2>
                <p>Your learning request was submitted successfully.</p>
                <Link className="match-request-link" to="/requests">
                  View Requests
                </Link>
              </>
            ) : (
              <>
                <h2 id="request-match-heading">
                  Learn from {name.split(/\s+/)[0]}
                </h2>
                <p>Choose one of this member's teaching skills to request.</p>
                {skills.length === 0 ? (
                  <p role="status">A request cannot be sent because no teaching skills are available.</p>
                ) : (
                  <form onSubmit={sendRequest}>
                    <label htmlFor="match-skill-request">Skill to learn</label>
                    <select
                      id="match-skill-request"
                      value={selectedSkill}
                      onChange={(event) => setSelectedSkill(event.target.value)}
                    >
                      {skills.map((skill) => (
                        <option key={getObjectId(skill) || skill.name} value={skill.name}>
                          {skill.name}
                        </option>
                      ))}
                    </select>

                    <label htmlFor="match-request-message">
                      Optional message
                    </label>
                    <textarea
                      id="match-request-message"
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      maxLength={500}
                    />

                    {requestError && (
                      <p className="match-request-error" role="alert">
                        {requestError}
                      </p>
                    )}
                    {unauthorized && (
                      <Link to="/login" className="match-request-link">
                        Log in
                      </Link>
                    )}

                    <button type="submit" disabled={submitting || !selectedSkill}>
                      {submitting ? "Sending..." : "Send Learning Request"}
                    </button>
                  </form>
                )}
              </>
            )}
          </section>

          <section className="details-card quick-details">
            <h2>Quick Information</h2>
            <div className="quick-row">
              <span>Role</span>
              <strong>Recommended teacher</strong>
            </div>
            <div className="quick-row">
              <span>Teaching skills</span>
              <strong>{skills.length}</strong>
            </div>
            {user.location && (
              <div className="quick-row">
                <span>Location</span>
                <strong>{user.location}</strong>
              </div>
            )}
          </section>
        </aside>
      </div>
    </main>
  );
}

export default MatchDetails;
