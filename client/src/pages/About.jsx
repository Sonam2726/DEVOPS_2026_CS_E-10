import React from "react";
import "./About.css";

function About() {
  return (
    <div className="about-page">

      {/* HERO */}
      <section className="about-hero">
        <span className="about-badge">ABOUT SKILLBRIDGE</span>

        <h1>
          Learn. Teach. <span>Connect.</span>
        </h1>

        <p>
          SkillBridge is a skill exchange platform that helps people
          connect, share knowledge, and learn from each other.
        </p>
      </section>

      {/* ABOUT */}
      <section className="about-section">
        <div className="about-text">
          <span className="section-label">WHO WE ARE</span>

          <h2>Building a community of learners and mentors</h2>

          <p>
            SkillBridge makes learning more collaborative and accessible.
            Users can showcase their skills, discover people with similar
            interests, and exchange knowledge through meaningful
            interactions.
          </p>

          <p>
            Whether you want to learn Java, Python, UI/UX, web development,
            or share your own expertise, SkillBridge helps you find the
            right learning partner.
          </p>
        </div>

        <div className="about-card">
          <div className="about-card-icon">🤝</div>
          <h3>Skill Exchange</h3>
          <p>
            Learn something new while sharing what you already know.
          </p>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features-section">
        <div className="section-heading">
          <span className="section-label">WHAT WE OFFER</span>
          <h2>Everything you need to learn together</h2>
        </div>

        <div className="features-grid">

          <div className="feature-card">
            <div className="feature-icon">🔍</div>
            <h3>Discover Skills</h3>
            <p>
              Explore different skills and find learning opportunities
              that match your interests.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Smart Matching</h3>
            <p>
              Find suitable learning partners based on skills,
              interests, and compatibility.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">💬</div>
            <h3>Connect & Chat</h3>
            <p>
              Communicate with your skill exchange partners and
              continue learning together.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📅</div>
            <h3>Learning Sessions</h3>
            <p>
              Organize learning sessions and keep track of your
              upcoming and completed sessions.
            </p>
          </div>

        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-section">
        <div className="section-heading">
          <span className="section-label">HOW IT WORKS</span>
          <h2>Simple steps to start learning</h2>
        </div>

        <div className="steps">

          <div className="step">
            <span>01</span>
            <h3>Create Your Profile</h3>
            <p>
              Add your skills, interests, and learning goals.
            </p>
          </div>

          <div className="step">
            <span>02</span>
            <h3>Find Your Match</h3>
            <p>
              Discover learners and mentors who match your needs.
            </p>
          </div>

          <div className="step">
            <span>03</span>
            <h3>Connect & Learn</h3>
            <p>
              Start conversations, exchange skills, and learn together.
            </p>
          </div>

        </div>
      </section>

      {/* CTA */}
      <section className="about-cta">
        <h2>Ready to bridge your skills?</h2>

        <p>
          Join SkillBridge and turn your knowledge into meaningful
          connections.
        </p>

        <a href="/discover" className="about-cta-button">
          Explore Skills
        </a>
      </section>

    </div>
  );
}

export default About;