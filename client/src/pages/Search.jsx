import { useState } from "react";
import "./Search.css";

function Search() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [level, setLevel] = useState("All");

  const skills = [
    {
      id: 1,
      title: "React Development",
      category: "Programming",
      level: "Intermediate",
      teacher: "Aarav",
    },
    {
      id: 2,
      title: "Python Programming",
      category: "Programming",
      level: "Beginner",
      teacher: "Riya",
    },
    {
      id: 3,
      title: "UI/UX Design",
      category: "Design",
      level: "Intermediate",
      teacher: "Karan",
    },
    {
      id: 4,
      title: "Machine Learning",
      category: "Data Science",
      level: "Advanced",
      teacher: "Ananya",
    },
    {
      id: 5,
      title: "Digital Marketing",
      category: "Marketing",
      level: "Beginner",
      teacher: "Rahul",
    },
    {
      id: 6,
      title: "English Speaking",
      category: "Languages",
      level: "Beginner",
      teacher: "Sneha",
    },
  ];

  const categories = [
    "All",
    "Programming",
    "Design",
    "Data Science",
    "Marketing",
    "Languages",
  ];

  const filteredSkills = skills.filter((skill) => {
    const matchesSearch = skill.title
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      category === "All" || skill.category === category;

    const matchesLevel =
      level === "All" || skill.level === level;

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

      {/* Search Controls */}
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

      {/* Categories */}
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

      {/* Results */}
      <section className="results-section">

        <div className="results-header">
          <h2>Available Skills</h2>

          <span>
            {filteredSkills.length} skill
            {filteredSkills.length !== 1 ? "s" : ""} found
          </span>
        </div>

        {filteredSkills.length > 0 ? (
          <div className="results-grid">

            {filteredSkills.map((skill) => (
              <div className="result-card" key={skill.id}>

                <div className="result-icon">
                  ★
                </div>

                <div className="result-content">
                  <h3>{skill.title}</h3>

                  <p>
                    Learn from <strong>{skill.teacher}</strong>
                  </p>

                  <div className="skill-tags">
                    <span>{skill.category}</span>
                    <span>{skill.level}</span>
                  </div>

                  <button className="view-skill-btn">
                    View Skill
                  </button>
                </div>

              </div>
            ))}

          </div>
        ) : (
          <div className="no-results">
            <h3>No skills found</h3>

            <p>
              Try another skill name or change your filters.
            </p>

            <button
              className="reset-btn"
              onClick={() => {
                setSearch("");
                setCategory("All");
                setLevel("All");
              }}
            >
              Reset Filters
            </button>
          </div>
        )}

      </section>

    </main>
  );
}

export default Search;