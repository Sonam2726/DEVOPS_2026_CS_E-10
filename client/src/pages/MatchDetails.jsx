
import React from "react";
import { useNavigate } from "react-router-dom";
import "./MatchDetails.css";

const matchData = {
  name: "Aarav Sharma",
  role: "Java Developer & Mentor",
  avatar: "AS",
  match: "95%",
  rating: "4.8",
  availability: "Available",
  experience: "3+ Years",
  level: "Advanced",
  skills: ["Java", "OOP", "Spring Boot", "DSA"],
  commonSkills: ["Java", "OOP", "DSA"],
  about:
    "Java developer and mentor passionate about helping students understand programming concepts, object-oriented programming and backend development.",
};

function MatchDetails() {
  const navigate = useNavigate();

  const handleRequest = () => {
    alert(`Connection request sent to ${matchData.name}!`);
  };

  return (
    <div className="match-details-page">

      {/* Back Button */}
      <button
        className="back-btn"
        onClick={() => navigate("/matching")}
      >
        ← Back to Matching
      </button>

      {/* Profile Header */}
      <div className="match-profile-header">

        <div className="large-avatar">
          {matchData.avatar}
        </div>

        <div className="profile-main-info">

          <span className="profile-label">
            RECOMMENDED MATCH
          </span>

          <h1>{matchData.name}</h1>

          <p>{matchData.role}</p>

          <div className="profile-meta">
            <span>⭐ {matchData.rating}</span>
            <span>🎓 {matchData.level}</span>
            <span className="available-text">
              <span className="green-dot"></span>
              {matchData.availability}
            </span>
          </div>

        </div>

        <div className="big-match-badge">
          <strong>{matchData.match}</strong>
          <small>Compatibility</small>
        </div>

      </div>

      {/* Main Content */}
      <div className="match-details-content">

        {/* Left Section */}
        <div className="details-left">

          {/* Compatibility */}
          <div className="details-card">

            <h2>Compatibility</h2>

            <p className="card-description">
              Based on your skills, interests and learning goals,
              this is a strong match for you.
            </p>

            <div className="compatibility-box">

              <div className="compatibility-score">
                <strong>{matchData.match}</strong>
                <span>Overall Match</span>
              </div>

              <div className="compatibility-progress">
                <div className="progress-bar">
                  <div className="progress-fill"></div>
                </div>

                <div className="progress-labels">
                  <span>Low</span>
                  <span>Excellent</span>
                </div>
              </div>

            </div>

          </div>

          {/* Common Skills */}
          <div className="details-card">

            <h2>Common Skills</h2>

            <p className="card-description">
              Skills that you and {matchData.name.split(" ")[0]} have
              in common.
            </p>

            <div className="common-skills">

              {matchData.commonSkills.map((skill) => (
                <div className="common-skill" key={skill}>
                  <span>✓</span>
                  {skill}
                </div>
              ))}

            </div>

          </div>

          {/* Skills */}
          <div className="details-card">

            <h2>Skills</h2>

            <div className="skill-tags">

              {matchData.skills.map((skill) => (
                <span key={skill}>{skill}</span>
              ))}

            </div>

          </div>

          {/* About */}
          <div className="details-card">

            <h2>About</h2>

            <p className="about-text">
              {matchData.about}
            </p>

          </div>

        </div>

        {/* Right Section */}
        <div className="details-right">

          {/* Request Card */}
          <div className="request-match-card">

            <div className="request-icon">
              🤝
            </div>

            <h2>Connect with {matchData.name.split(" ")[0]}</h2>

            <p>
              Send a connection request and start learning
              together on SkillBridge.
            </p>

            <button onClick={handleRequest}>
              Send Connection Request
            </button>

            <small>
              You can cancel the request anytime.
            </small>

          </div>

          {/* Quick Information */}
          <div className="details-card quick-details">

            <h2>Quick Information</h2>

            <div className="quick-row">
              <span>Role</span>
              <strong>Mentor</strong>
            </div>

            <div className="quick-row">
              <span>Experience</span>
              <strong>{matchData.experience}</strong>
            </div>

            <div className="quick-row">
              <span>Level</span>
              <strong>{matchData.level}</strong>
            </div>

            <div className="quick-row">
              <span>Availability</span>
              <strong className="available-value">
                {matchData.availability}
              </strong>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default MatchDetails;

