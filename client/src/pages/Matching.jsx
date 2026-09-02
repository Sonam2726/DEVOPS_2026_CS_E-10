import React from "react";
import "./Matching.css";

const teachers = [
  {
    id: 1,
    name: "Aarav Sharma",
    role: "Java Developer & Mentor",
    skills: ["Java", "OOP", "Spring Boot"],
    rating: "4.8",
    match: "95%",
    availability: "Available",
    avatar: "AS",
  },
  {
    id: 2,
    name: "Priya Mehta",
    role: "UI/UX Designer & Mentor",
    skills: ["Figma", "UI Design", "UX"],
    rating: "4.7",
    match: "91%",
    availability: "Available",
    avatar: "PM",
  },
  {
    id: 3,
    name: "Rohan Verma",
    role: "Python Developer & Mentor",
    skills: ["Python", "FastAPI", "SQL"],
    rating: "4.9",
    match: "89%",
    availability: "Available",
    avatar: "RV",
  },
];

const learners = [
  {
    id: 1,
    name: "Sneha Patel",
    role: "Java Learner",
    skills: ["Java", "OOP", "DSA"],
    level: "Beginner",
    match: "93%",
    avatar: "SP",
  },
  {
    id: 2,
    name: "Rahul Singh",
    role: "Frontend Learner",
    skills: ["React", "JavaScript", "CSS"],
    level: "Intermediate",
    match: "88%",
    avatar: "RS",
  },
  {
    id: 3,
    name: "Ananya Sharma",
    role: "Python Learner",
    skills: ["Python", "Machine Learning", "Pandas"],
    level: "Beginner",
    match: "86%",
    avatar: "AS",
  },
];

function Matching() {
  const handleConnect = (name) => {
    alert(`Connection request sent to ${name}!`);
  };

  return (
    <div className="matching-page">

      {/* PAGE HEADER */}
      <div className="matching-header">
        <div>
          <span className="page-label">
            SKILLBRIDGE MATCHING
          </span>

          <h1>
            Find Your Perfect <span>Skill Match</span>
          </h1>

          <p>
            Connect with teachers and learners who share
            your skills, interests and learning goals.
          </p>
        </div>
      </div>

      {/* TEACHERS */}
      <section className="matching-section">

        <div className="section-heading">
          <div>
            <span className="section-label">
              RECOMMENDED FOR YOU
            </span>

            <h2>Recommended Teachers</h2>
          </div>

          <button className="view-all-btn">
            View All
          </button>
        </div>

        <div className="cards-container">

          {teachers.map((teacher) => (
            <div className="match-card" key={teacher.id}>

              <div className="card-header">
                <div className="avatar">
                  {teacher.avatar}
                </div>

                <div className="match-badge">
                  <strong>{teacher.match}</strong>
                  <small>Match</small>
                </div>
              </div>

              <div className="person-info">
                <h3>{teacher.name}</h3>

                <p className="role">
                  {teacher.role}
                </p>

                <div className="rating">
                  ⭐ {teacher.rating}
                </div>
              </div>

              <div className="availability">
                <span className="status-dot"></span>
                <span>{teacher.availability}</span>
              </div>

              <div className="skills">
                {teacher.skills.map((skill) => (
                  <span key={skill}>
                    {skill}
                  </span>
                ))}
              </div>

              <div className="card-buttons">
                <button className="profile-btn">
                  View Profile
                </button>

                <button
                  className="connect-btn"
                  onClick={() => handleConnect(teacher.name)}
                >
                  Connect
                </button>
              </div>

            </div>
          ))}

        </div>
      </section>

      {/* LEARNERS */}
      <section className="matching-section learners-section">

        <div className="section-heading">
          <div>
            <span className="section-label">
              PEOPLE WHO MATCH YOUR SKILLS
            </span>

            <h2>Recommended Learners</h2>
          </div>

          <button className="view-all-btn">
            View All
          </button>
        </div>

        <div className="cards-container">

          {learners.map((learner) => (
            <div className="match-card" key={learner.id}>

              <div className="card-header">
                <div className="avatar">
                  {learner.avatar}
                </div>

                <div className="match-badge">
                  <strong>{learner.match}</strong>
                  <small>Match</small>
                </div>
              </div>

              <div className="person-info">
                <h3>{learner.name}</h3>

                <p className="role">
                  {learner.role}
                </p>
              </div>

              <div className="learner-level">
                🎓 {learner.level}
              </div>

              <div className="skills">
                {learner.skills.map((skill) => (
                  <span key={skill}>
                    {skill}
                  </span>
                ))}
              </div>

              <div className="card-buttons">
                <button className="profile-btn">
                  View Profile
                </button>

                <button
                  className="connect-btn"
                  onClick={() => handleConnect(learner.name)}
                >
                  Connect
                </button>
              </div>

            </div>
          ))}

        </div>
      </section>

    </div>
  );
}

export default Matching;

