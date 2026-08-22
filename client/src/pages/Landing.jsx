import "./Landing.css";
import heroImage from "../assets/skillbridge-hero.svg";

const Landing = () => {
  return (
    <main className="landing-page">
      <section className="landing-hero">
        <div className="landing-container">
          <div className="hero-content">

            <div className="hero-text">
              <p className="hero-tagline">
                Learn. Teach. Connect.
              </p>

              <h1 className="hero-title">
                Learn Skills.
                <span> Share Skills.</span>
              </h1>

              <p className="hero-description">
                SkillBridge AI helps you connect with people who can teach
                what you want to learn and learn from what you already know.
              </p>

              <div className="hero-actions">
                <button className="hero-btn hero-btn-primary">
                  Get Started
                </button>

                <button className="hero-btn hero-btn-secondary">
                  Explore Skills
                </button>
              </div>
            </div>

            <div className="hero-image-wrapper">
              <img
                src={heroImage}
                alt="SkillBridge AI"
                className="hero-image"
              />
            </div>

          </div>
        </div>
      </section>
    </main>
  );
};

export default Landing;