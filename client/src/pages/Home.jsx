import "./Home.css";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  const featuredSkills = [
    {
      title: "Web Development",
      description: "Learn and share modern web development skills.",
    },
    {
      title: "Python",
      description: "Connect with people who love Python and programming.",
    },
    {
      title: "Data Science",
      description: "Explore data analysis, AI and machine learning skills.",
    },
  ];

  return (
    <main className="home">

      {/* Welcome Section */}
      <section className="welcome-section">
        <div className="welcome-content">

          <p className="welcome-label">
            WELCOME TO SKILLBRIDGE AI
          </p>

          <h1>
            Learn. Teach. <span>Connect.</span>
          </h1>

          <p className="welcome-text">
            Discover new skills, share your knowledge and connect
            with people who can help you grow.
          </p>

          <div className="welcome-buttons">

            {/* Register Page */}
            <button
              className="primary-button"
              onClick={() => navigate("/register")}
            >
              Get Started
            </button>

            {/* Discover Page */}
            <button
              className="outline-button"
              onClick={() => navigate("/discover")}
            >
              Explore Skills
            </button>

          </div>

        </div>
      </section>

      {/* Featured Skills */}
      <section className="featured-section">

        <div className="section-title">
          <p>EXPLORE SKILLS</p>

          <h2>Featured Skills</h2>

          <span>
            Find something new to learn from the SkillBridge community.
          </span>
        </div>

        <div className="skills-container">

          {featuredSkills.map((skill) => (
            <div className="skill-card" key={skill.title}>

              <div className="skill-icon">★</div>

              <h3>{skill.title}</h3>

              <p>{skill.description}</p>

              <button
                className="learn-button"
                onClick={() => navigate("/discover")}
              >
                Explore →
              </button>

            </div>
          ))}

        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">

        <div>
          <p className="cta-label">
            START LEARNING TODAY
          </p>

          <h2>Have a skill to share?</h2>

          <p>
            Teach what you know and help someone else grow.
          </p>
        </div>

        {/* Offer Skill Page */}
        <button
          className="cta-button"
          onClick={() => navigate("/offer-skill")}
        >
          Join SkillBridge
        </button>

      </section>

    </main>
  );
}

export default Home;