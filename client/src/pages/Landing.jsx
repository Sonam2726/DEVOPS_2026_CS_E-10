import { Link } from "react-router-dom";
import "./Landing.css";
import heroImage from "../assets/skillbridge-hero.svg";

const steps = [
  {
    number: "01",
    title: "Discover your next skill",
    description:
      "Browse the community and find people who can help you move from curious to capable.",
  },
  {
    number: "02",
    title: "Connect with the right people",
    description:
      "Send a learning request, start a human chat, or use AI Tutor to shape your next step.",
  },
  {
    number: "03",
    title: "Learn through real exchange",
    description:
      "Meet in focused sessions, share what you know, and leave thoughtful reviews that build trust.",
  },
];

const features = [
  {
    icon: "01",
    title: "Skill discovery",
    description: "Search and explore practical skills shared by the SkillBridge community.",
  },
  {
    icon: "02",
    title: "Peer learning",
    description: "Find a learning partner and turn shared knowledge into meaningful progress.",
  },
  {
    icon: "03",
    title: "AI Tutor",
    description: "Get an always-available thinking partner to ask questions and keep learning moving.",
  },
  {
    icon: "04",
    title: "Human chat",
    description: "Have direct conversations with people who share your goals and interests.",
  },
  {
    icon: "05",
    title: "Learning requests",
    description: "Make your intent clear and coordinate learning with the right match.",
  },
  {
    icon: "06",
    title: "Sessions & reviews",
    description: "Organize learning sessions and build confidence through community feedback.",
  },
];

function Landing() {
  return (
    <main className="landing-page">
      <section className="landing-hero">
        <div className="landing-container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow"><span className="eyebrow-dot" /> A better way to learn together</p>
            <h1>Turn what you know into <span>what&apos;s next.</span></h1>
            <p className="hero-description">
              SkillBridge AI connects curious learners with generous peers, helpful AI,
              and the conversations that make progress feel possible.
            </p>
            <div className="hero-actions">
              <Link to="/register" className="landing-button landing-button-primary">
                Get Started <span aria-hidden="true">→</span>
              </Link>
              <Link to="/discover" className="landing-button landing-button-secondary">
                Explore Skills
              </Link>
            </div>
            <p className="hero-note">Learn from people. Share what you know. Grow together.</p>
          </div>
          <div className="hero-visual">
            <div className="hero-glow" />
            <div className="hero-image-card">
              <img src={heroImage} alt="People learning and sharing skills" />
            </div>
            <div className="floating-card floating-card-top">
              <span className="floating-icon">✦</span>
              <span><strong>Learn in community</strong><small>Knowledge goes further together</small></span>
            </div>
            <div className="floating-card floating-card-bottom">
              <span className="floating-check">✓</span>
              <span><strong>Progress, your way</strong><small>AI Tutor or a human guide</small></span>
            </div>
          </div>
        </div>
      </section>

      <section className="trust-strip">
        <div className="landing-container trust-content">
          <span>Built for people who are ready to</span>
          <strong>LEARN</strong><i /> <strong>SHARE</strong><i /> <strong>CONNECT</strong>
        </div>
      </section>

      <section className="landing-section how-section">
        <div className="landing-container">
          <div className="section-heading">
            <p className="eyebrow">HOW IT WORKS</p>
            <h2>Make learning feel <span>human again.</span></h2>
            <p>One place to find the right knowledge, the right people, and the next step.</p>
          </div>
          <div className="steps-grid">
            {steps.map((step) => (
              <article className="step-card" key={step.number}>
                <span className="step-number">{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-section features-section">
        <div className="landing-container">
          <div className="section-heading section-heading-split">
            <div>
              <p className="eyebrow">THE SKILLBRIDGE EXPERIENCE</p>
              <h2>Everything you need to <span>keep growing.</span></h2>
            </div>
            <p>From your first question to your next learning session, the tools stay focused on meaningful progress.</p>
          </div>
          <div className="features-grid">
            {features.map((feature) => (
              <article className="feature-card" key={feature.title}>
                <span className="feature-icon">{feature.icon}</span>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-container final-cta">
        <div>
          <p className="eyebrow">YOUR NEXT STEP STARTS HERE</p>
          <h2>There&apos;s always more to learn.</h2>
          <p>Bring your curiosity, your experience, or both. SkillBridge AI is ready when you are.</p>
        </div>
        <Link to="/register" className="landing-button landing-button-light">Join SkillBridge <span aria-hidden="true">→</span></Link>
      </section>
    </main>
  );
}

export default Landing;
