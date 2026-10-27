import "./Footer.css";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">

        <div className="footer-brand-block">
          <Link to="/" className="footer-brand">SkillBridge <em>AI</em></Link>
          <p>Learn together. Grow together.</p>
        </div>
        <div className="footer-links">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/discover">Explore Skills</Link>
          <Link to="/login">Sign in</Link>
        </div>
        <p className="footer-text">© 2026 SkillBridge AI. All rights reserved.</p>

      </div>
    </footer>
  );
};

export default Footer;