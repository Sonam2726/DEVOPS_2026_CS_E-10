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


      {/* Search Box */}
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


        {/* Category */}
        <div className="filter-group">
          <label>Category</label>

          <select
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


        {/* Level */}
        <div className="filter-group">
          <label>Level</label>

          <select
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


      {/* Category Buttons */}
      <section className="category-section">

        <h2>Browse Categories</h2>

        <div className="category-list">
          {categories.map((item) => (
            <button
              key={item}
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


      {/* Search Status */}
      <section className="search-result-info">

        {search ? (
          <p>
            Showing results for <strong>"{search}"</strong>
          </p>
        ) : (
          <p>Start searching to discover new skills.</p>
        )}

      </section>

    </main>
  );
}

export default Search;