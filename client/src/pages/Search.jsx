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
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [loadMoreError, setLoadMoreError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const fetchSkills = async () => {
      try {
        if (page === 1) {
          setLoading(true);
          setError("");
        } else {
          setLoadingMore(true);
          setLoadMoreError("");
        }

        const params = new URLSearchParams({
          page: String(page),
          limit: "10",
        });
        if (search.trim()) params.set("name", search.trim());
        if (category !== "All") params.set("category", category);
        if (level !== "All") params.set("level", level);

        const response = await fetch(`${API_URL}/skills?${params}`, {
          signal: controller.signal,
        });
        const result = await response.json().catch(() => ({}));

        if (
          !response.ok ||
          !result.success ||
          !Array.isArray(result.data) ||
          !result.pagination
        ) {
          const message =
            result.message || "The server returned incomplete skill data.";
          if (page === 1) setError(message);
          else setLoadMoreError(message);
          return;
        }

        setSkills((current) =>
          page === 1 ? result.data : [...current, ...result.data]
        );
        setPagination(result.pagination);
        setLoadMoreError("");
      } catch (fetchError) {
        if (fetchError.name !== "AbortError") {
          const message = "Unable to connect to the server. Please try again.";
          if (page === 1) setError(message);
          else setLoadMoreError(message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    };

    fetchSkills();
    return () => controller.abort();
  }, [search, category, level, page, reloadKey]);

  const resetSkillsForFilter = () => {
    setSkills([]);
    setPagination(null);
    setLoadMoreError("");
    setPage(1);
  };

  const currentPage = pagination?.page || 0;
  const hasMoreSkills =
    pagination && currentPage < pagination.totalPages;
  const loadMoreSkills = () => {
    if (loadingMore || !hasMoreSkills) return;
    if (page > currentPage) setReloadKey((key) => key + 1);
    else setPage(currentPage + 1);
  };

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
            onChange={(e) => {
              if (e.target.value !== search) resetSkillsForFilter();
              setSearch(e.target.value);
            }}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            value={category}
            onChange={(e) => {
              if (e.target.value !== category) resetSkillsForFilter();
              setCategory(e.target.value);
            }}
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
            onChange={(e) => {
              if (e.target.value !== level) resetSkillsForFilter();
              setLevel(e.target.value);
            }}
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
              onClick={() => {
                if (item !== category) resetSkillsForFilter();
                setCategory(item);
              }}
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
                : !error &&
                  `${pagination?.total ?? skills.length} skill(s) found`}
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
                setReloadKey((key) => key + 1);
              }}
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && skills.length === 0 && (
          <div className="no-skills">
            <h3>No skills found</h3>
            <p>
              Try another search term or change your category and level filters.
            </p>
          </div>
        )}

        {!loading && !error && skills.length > 0 && (
          <div className="skill-grid">
            {skills.map((skill) => (
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
        {!loading && !error && hasMoreSkills && (
          <div className="skills-pagination">
            {loadMoreError && (
              <p role="alert" className="search-error">
                {loadMoreError}
              </p>
            )}
            <button
              type="button"
              className="skills-load-more"
              onClick={loadMoreSkills}
              disabled={loadingMore}
            >
              {loadingMore
                ? "Loading more skills..."
                : loadMoreError || page > currentPage
                  ? "Retry loading more"
                  : "Load more skills"}
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

export default Search;