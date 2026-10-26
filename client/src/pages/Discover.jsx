import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Discover.css";

const API_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  "http://localhost:5000/api";

const categories = [
  "Programming",
  "Data Science",
  "Web Development",
  "Design",
  "Business",
  "Languages",
  "Other",
];

function Discover() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();

    const fetchSkills = async () => {
      try {
        const response = await fetch(`${API_URL}/skills?limit=50`, {
          signal: controller.signal,
        });
        const result = await response.json().catch(() => ({}));

        if (!response.ok || !result.success || !Array.isArray(result.data)) {
          throw new Error(result.message || "Failed to load skills.");
        }

        setSkills(result.data);
        setError("");
      } catch (fetchError) {
        if (fetchError.name !== "AbortError") {
          setError(fetchError.message || "Unable to connect to the server.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchSkills();
    return () => controller.abort();
  }, [reloadKey]);

  const filteredSkills = skills.filter((skill) => {
    const skillName = (skill.name || "").toLowerCase();
    const description = (skill.description || "").toLowerCase();
    const searchText = search.trim().toLowerCase();

    return (
      (!searchText ||
        skillName.includes(searchText) ||
        description.includes(searchText)) &&
      (category === "All" || skill.category === category)
    );
  });

  return (
    <div className="discover">
      <h1>Discover Skills</h1>

      <input
        type="text"
        placeholder="Search Skills..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      <select
        value={category}
        onChange={(event) => setCategory(event.target.value)}
      >
        <option value="All">All</option>
        {categories.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>

      {loading && <p role="status">Loading skills...</p>}

      {!loading && error && (
        <div role="alert">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              setError("");
              setReloadKey((key) => key + 1);
            }}
          >
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && filteredSkills.length === 0 && (
        <p>No skills found. Try another search or category.</p>
      )}

      {!loading && !error && filteredSkills.length > 0 && (
        <div className="skill-grid">
          {filteredSkills.map((skill, index) => (
            <div className="card" key={skill._id || `${skill.name}-${index}`}>
              <h3>{skill.name}</h3>
              <p>
                <strong>Mentor:</strong> {skill.owner?.name || "Unavailable"}
              </p>
              <p>
                <strong>Level:</strong> {skill.level}
              </p>
              <p className="category">{skill.category}</p>
              <button
                type="button"
                onClick={() => navigate(`/skill/${skill._id}`)}
                disabled={!skill._id}
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Discover;
