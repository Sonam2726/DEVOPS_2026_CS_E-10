import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./MySkills.css";

const API_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  "http://localhost:5000/api";

function MySkills() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const fetchMySkills = async () => {
      const token = localStorage.getItem("skillbridgeToken");
      if (!token) {
        setError("Please log in to manage your skills.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/skills/mine`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok || !result.success || !Array.isArray(result.data)) {
          throw new Error(result.message || "Unable to load your skills.");
        }
        setSkills(result.data);
      } catch (fetchError) {
        if (fetchError.name !== "AbortError") {
          setError(fetchError.message || "Could not connect to the server.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchMySkills();
    return () => controller.abort();
  }, []);

  return (
    <main className="my-skills-page">
      <header className="my-skills-header">
        <div>
          <span>TEACH ON SKILLBRIDGE</span>
          <h1>My Skills</h1>
          <p>Publish what you know so learners can find and request it.</p>
        </div>
        <Link className="my-skills-primary-action" to="/offer-skill">
          Add Skill
        </Link>
      </header>

      {loading && <p role="status">Loading your skills...</p>}
      {!loading && error && <p role="alert">{error}</p>}
      {!loading && !error && skills.length === 0 && (
        <section className="my-skills-empty">
          <h2>You have not published a skill yet</h2>
          <p>Share your knowledge to become a mentor on SkillBridge.</p>
          <Link className="my-skills-primary-action" to="/offer-skill">
            Publish Your First Skill
          </Link>
        </section>
      )}
      {!loading && !error && skills.length > 0 && (
        <section className="my-skills-grid" aria-label="Published skills">
          {skills.map((skill) => (
            <article className="my-skill-card" key={skill._id}>
              <div>
                <span className="my-skill-category">{skill.category}</span>
                <h2>{skill.name}</h2>
                <p>{skill.description}</p>
              </div>
              <div className="my-skill-footer">
                <span>{skill.level}</span>
                <Link to={`/skill/${skill._id}`}>View details</Link>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}

export default MySkills;
