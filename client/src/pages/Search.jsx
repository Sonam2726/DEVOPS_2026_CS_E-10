import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Search.css";

const API_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  "http://localhost:5000/api";

const categories = [
  "All",
  "Programming",
  "Data Science",
  "Web Development",
  "Design",
  "Business",
  "Languages",
  "Other",
];

function Search() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [level, setLevel] = useState("All");

  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  // Fetch skills from the backend
  useEffect(() => {
    const controller = new AbortController();

    const fetchSkills = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/skills?limit=50`, {
          signal: controller.signal,
        });
        const result = await response.json().catch(() => ({}));

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to load skills.");
        }

        if (!Array.isArray(result.data)) {
          throw new Error("Unexpected response from the skills API.");
        }

        setSkills(result.data);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(
            err.message || "Unable to connect to the server. Please try again."
          );
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

  // Apply search, category and level filters
  const filteredSkills = skills.filter((skill) => {
    const skillName = (skill.name || skill.title || "").toLowerCase();
    const description = (skill.description || "").toLowerCase();
    const searchText = search.trim().toLowerCase();

    const matchesSearch =
      skillName.includes(searchText) ||
      description.includes(searchText);

    const matchesCategory =
      category === "All" ||
      (skill.category || "").toLowerCase() === category.toLowerCase();

    const matchesLevel =
      level === "All" ||
      (skill.level || "").toLowerCase() === level.toLowerCase();

    return matchesSearch && matchesCategory && matchesLevel;
  });

  return (
    <main className="search-page">
      {/* Header */}
      <section className="search-header">
        <p>DISCOVER</p>
        <h1>Find Your Next Skill</h1>
        <span>
          Search for skills and connect with people who can teach you.
        </span>
      </section>

      {/* Search and Filters */}
      <section className="search-controls">
        <div className="search-box">
          <span>🔍</span>
          <input
            type="text"
            placeholder="Search for a skill..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="level">Level</label>
          <select
            id="level"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
          >
            <option value="All">All Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
      </section>

      {/* Categories */}
      <section className="category-section">
        <div className="category-heading">
          <h2>Browse Categories</h2>
          <span>
            {category === "All" ? "All skills" : `${category} selected`}
          </span>
        </div>

        <div className="category-list">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              className={
                category === item ? "category-btn active" : "category-btn"
              }
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      {/* Results */}
      <section className="search-results">
        <div className="search-result-info">
          <div className="result-icon">🔎</div>
          <div>
            <h3>
              {search ? `Results for "${search}"` : "Explore Available Skills"}
            </h3>
            <p>
              {loading
                ? "Loading skills..."
                : !error && `${filteredSkills.length} skill(s) found`}
            </p>
          </div>
        </div>

        {loading && <p>Fetching skills from the server...</p>}

        {!loading && error && (
          <div className="search-error">
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
          <div className="no-skills">
            <h3>No skills found</h3>
            <p>
              Try another search term or change your category and level filters.
            </p>
          </div>
        )}

        {!loading && !error && filteredSkills.length > 0 && (
          <div className="skill-grid">
            {filteredSkills.map((skill) => (
              <Link
                className="skill-card"
                key={skill._id || skill.id || skill.name}
                to={skill._id ? `/skill/${skill._id}` : "#"}
                aria-disabled={!skill._id}
                onClick={(event) => {
                  if (!skill._id) event.preventDefault();
                }}
              >
                <div className="skill-card-top">
                  <span className="skill-category">
                    {skill.category || "Other"}
                  </span>
                  <span className="skill-level">
                    {skill.level || "Not specified"}
                  </span>
                </div>

                <h3>{skill.name || skill.title || "Untitled Skill"}</h3>

                <p>
                  {skill.description || "No description available yet."}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default Search;