import { useState } from "react";
import { Link } from "react-router-dom";
import "./Profile.css";

function Profile() {
  const [editing, setEditing] = useState(false);

  const [name, setName] = useState("Sonam");
  const [bio, setBio] = useState(
    "Computer Science student passionate about technology and learning new skills."
  );

  const skills = [
    "C++",
    "Python",
    "React",
    "Data Science",
    "SQL",
  ];

  return (
    <main className="profile-page">

      {/* Profile Header */}
      <section className="profile-header">

        <div className="profile-container">

          <div className="profile-avatar">
            {name.charAt(0).toUpperCase()}
          </div>

          <div className="profile-heading">
            <h1>{name}</h1>

            <p>Computer Science Student</p>

            <span>India</span>
          </div>

          <button
            className="edit-profile-button"
            onClick={() => setEditing(!editing)}
          >
            {editing ? "Cancel" : "Edit Profile"}
          </button>

        </div>

      </section>


      {/* Profile Content */}
      <section className="profile-content">

        {/* About */}
        <div className="profile-card">

          <h2>About Me</h2>

          {editing ? (
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          ) : (
            <p>{bio}</p>
          )}

        </div>


        {/* Skills */}
        <div className="profile-card">

          <div className="card-heading">
            <h2>My Skills</h2>

            <span>{skills.length} Skills</span>
          </div>

          <div className="profile-skills">

            {skills.map((skill) => (
              <span
                className="profile-skill"
                key={skill}
              >
                {skill}
              </span>
            ))}

          </div>

        </div>


        {/* Activity */}
        <div className="profile-card">

          <h2>Learning Activity</h2>

          <div className="activity-grid">

            <div className="activity-item">
              <strong>5</strong>
              <span>Skills Learned</span>
            </div>

            <div className="activity-item">
              <strong>4</strong>
              <span>Requests Sent</span>
            </div>

            <div className="activity-item">
              <strong>2</strong>
              <span>Skills Shared</span>
            </div>

          </div>

        </div>


        {/* Quick Actions */}
        <div className="profile-actions">

          <Link
            to="/search"
            className="profile-action-button"
          >
            Explore Skills
          </Link>

          <Link
            to="/requests"
            className="profile-action-button outline"
          >
            My Requests
          </Link>

        </div>

      </section>

    </main>
  );
}

export default Profile;