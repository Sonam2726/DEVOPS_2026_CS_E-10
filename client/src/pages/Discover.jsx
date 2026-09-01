import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Discover.css";
import skills from "../data/skills";

function Discover() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const navigate = useNavigate();

  const filteredSkills = skills.filter((skill) => {
    const matchesSearch = skill.title
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      category === "All" || skill.category === category;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="discover">

      <h1>Discover Skills</h1>

      <input
        type="text"
        placeholder="Search Skills..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        <option>All</option>
        <option>Frontend</option>
        <option>Backend</option>
        <option>AI</option>
        <option>Design</option>
        <option>Mobile</option>
      </select>

      <div className="skill-grid">

        {filteredSkills.map((skill) => (
          <div className="card" key={skill.id}>

            <h3>{skill.title}</h3>

            <p>
              <strong>Mentor:</strong> {skill.mentor}
            </p>

            <p>
              <strong>Level:</strong> {skill.level}
            </p>

            <p className="category">
              {skill.category}
            </p>

            <button
              onClick={() => navigate("/skill-details")}
            >
              View Details
            </button>

          </div>
        ))}

      </div>

    </div>
  );
}

export default Discover;