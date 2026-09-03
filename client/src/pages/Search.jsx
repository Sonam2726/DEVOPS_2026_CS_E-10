import { useState } from "react";
import "./Search.css";

function Search() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [level, setLevel] = useState("All");

  const categories = [
    "All",
    "Programming",
    "Design",
    "Data Science",
    "Marketing",
    "Languages",
  ];

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


      {/* Search & Filters */}
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
          <label htmlFor="category">
            Category
          </label>

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
          <label htmlFor="level">
            Level
          </label>

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
            {category === "All"
              ? "All skills"
              : `${category} selected`}
          </span>
        </div>

        <div className="category-list">

          {categories.map((item) => (
            <button
              key={item}
              type="button"
              className={
                category === item
                  ? "category-btn active"
                  : "category-btn"
              }
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}

        </div>

      </section>


      {/* Result Information */}
      <section className="search-result-info">

        <div className="result-icon">
          🔎
        </div>

        <div>

          {search ? (
            <>
              <h3>
                Search results
              </h3>

              <p>
                Showing results for{" "}
                <strong>"{search}"</strong>
              </p>
            </>
          ) : (
            <>
              <h3>
                Ready to explore?
              </h3>

              <p>
                Start searching to discover new skills.
              </p>
            </>
          )}

        </div>

      </section>

    </main>
  );
}

export default Search;