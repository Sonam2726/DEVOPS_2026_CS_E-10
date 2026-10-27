import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [loadMoreError, setLoadMoreError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = Boolean(localStorage.getItem("skillbridgeToken"));

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
          const message = "Unable to connect to the server.";
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
  }, [reloadKey, page, search, category]);

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
    <div className="discover">
      <div className="discover-heading">
        <div>
          <h1>Discover Skills</h1>
          <p>Find skills shared by SkillBridge mentors.</p>
        </div>
        {isAuthenticated && (
          <button type="button" onClick={() => navigate("/my-skills")}>
            My Skills
          </button>
        )}
      </div>

      <input
        type="text"
        placeholder="Search Skills..."
        value={search}
        onChange={(event) => {
          if (event.target.value !== search) resetSkillsForFilter();
          setSearch(event.target.value);
        }}
      />

      <select
        value={category}
        onChange={(event) => {
          if (event.target.value !== category) resetSkillsForFilter();
          setCategory(event.target.value);
        }}
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

      {!loading && !error && skills.length === 0 && (
        <p>No skills found. Try another search or category.</p>
      )}

      {!loading && !error && skills.length > 0 && (
        <div className="skill-grid">
          {skills.map((skill, index) => (
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
                onClick={() =>
                  navigate(`/skill/${skill._id}`, {
                    state: {
                      from: {
                        pathname: location.pathname,
                        search: location.search,
                        label: "Discover Skills",
                      },
                    },
                  })
                }
                disabled={!skill._id}
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      )}
      {!loading && !error && hasMoreSkills && (
        <div className="discover-pagination">
          {loadMoreError && (
            <p role="alert" className="discover-pagination-error">
              {loadMoreError}
            </p>
          )}
          <button
            type="button"
            className="discover-load-more"
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
    </div>
  );
}

export default Discover;
