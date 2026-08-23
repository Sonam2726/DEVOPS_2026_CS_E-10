import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">

        <Link to="/" className="navbar-logo">
          SkillBridge AI
        </Link>

        <div className="navbar-links">

          <Link to="/" className="navbar-link">
            Home
          </Link>

          <Link to="/about" className="navbar-link">
            About
          </Link>

          <Link to="/login" className="navbar-link">
            Login
          </Link>

          <Link to="/register" className="navbar-button">
            Get Started
          </Link>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;