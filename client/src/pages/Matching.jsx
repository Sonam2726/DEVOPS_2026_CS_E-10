import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Matching.css";

const API_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  "http://localhost:5000/api";

function Matching() {
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const fetchMatches = async () => {
      const token = localStorage.getItem("skillbridgeToken");

      if (!token) {
        setUnauthorized(true);
        setError("Please log in to see recommended matches.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/matches/recommendations`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });
        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
          const requiresLogin = response.status === 401 || response.status === 403;
          setUnauthorized(requiresLogin);
          setError(
            requiresLogin
              ? "Your session is invalid or expired. Please log in again."
              : result.message || "Unable to load recommended matches."
          );
          return;
        }

        if (result.success !== true || !Array.isArray(result.matches)) {
          setError("The server returned incomplete match data.");
          return;
        }

        setMatches(result.matches);
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

    fetchMatches();
    return () => controller.abort();
  }, []);

  const openDetails = (match) => {
    const id = match._id || match.id;
    if (id) navigate(`/match-details/${id}`);
  };

  const openRequestForm = (match) => {
    const id = match._id || match.id;
    if (id) {
      navigate(`/match-details/${id}`, {
        state: { focusRequestForm: true },
      });
    }
  };

  return (
    <main className="matching-page">
      <header className="matching-header">
        <div>
          <span className="page-label">SKILLBRIDGE MATCHING</span>
          <h1>
            Find Your Perfect <span>Skill Match</span>
          </h1>
          <p>
            Connect with people who can teach skills you want to learn.
          </p>
        </div>
      </header>

      <section className="matching-section">
        <div className="section-heading">
          <div>
            <span className="section-label">RECOMMENDED FOR YOU</span>
            <h2>Recommended Teachers</h2>
          </div>
        </div>

        {loading && (
          <p className="matching-state" role="status">
            Loading recommended matches...
          </p>
        )}

        {!loading && error && (
          <div className="matching-state" role="alert">
            <p>{error}</p>
            {unauthorized && (
              <Link to="/login" className="matching-login-link">
                Log in
              </Link>
            )}
          </div>
        )}

        {!loading && !error && matches.length === 0 && (
          <p className="matching-state">
            No recommended teachers found yet. Add skills you want to learn to
            your profile to get recommendations.
          </p>
        )}

        {!loading && !error && matches.length > 0 && (
          <div className="cards-container">
            {matches.map((match) => {
              const id = match._id || match.id;
              const name = match.name || "SkillBridge member";
              const initials = name
                .split(/\s+/)
                .filter(Boolean)
                .slice(0, 2)
                .map((part) => part.charAt(0).toUpperCase())
                .join("");

              return (
                <article className="match-card" key={id || name}>
                  <div className="card-header">
                    <div className="avatar">{initials || "?"}</div>
                    <div className="match-badge">
                      <strong>Skill</strong>
                      <small>Match</small>
                    </div>
                  </div>

                  <div className="person-info">
                    <h3>{name}</h3>
                    <p className="role">
                      {match.bio || "Recommended because they teach a skill you want to learn."}
                    </p>
                  </div>

                  <div className="availability">
                    <span className="status-dot"></span>
                    <span>Recommended teacher</span>
                  </div>

                  {match.location && (
                    <div className="learner-level">{match.location}</div>
                  )}

                  <div className="card-buttons">
                    <button
                      className="profile-btn"
                      type="button"
                      onClick={() => openDetails(match)}
                      disabled={!id}
                    >
                      View Profile
                    </button>
                    <button
                      className="connect-btn"
                      type="button"
                      onClick={() => openRequestForm(match)}
                      disabled={!id}
                    >
                      Connect
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="matching-section learners-section">
        <div className="section-heading">
          <div>
            <span className="section-label">MORE WAYS TO CONNECT</span>
            <h2>Recommended Learners</h2>
          </div>
        </div>
        <p className="matching-state">
          Learner recommendations are not provided by the current matching API.
        </p>
      </section>
    </main>
  );
}

export default Matching;
