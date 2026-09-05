import { NavLink } from "react-router-dom";

import "./Topbar.css";

function Topbar({ onMenuClick }) {
  const savedUser = localStorage.getItem("skillbridgeUser");
  const currentUser = savedUser ? JSON.parse(savedUser) : null;
  const userName = currentUser?.name || "User";

  return (
    <header className="dashboard-topbar">

      {/* Mobile menu */}
      <button
        className="topbar-menu-button"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        ☰
      </button>

      {/* Page title */}
      <div className="topbar-brand">
        Dashboard
      </div>

      {/* Right section */}
      <div className="topbar-actions">

        <nav className="topbar-links">

          <NavLink to="/home">
            Home
          </NavLink>

          <NavLink to="/about">
            About
          </NavLink>

          <NavLink to="/login">
            Login
          </NavLink>

          <NavLink
            to="/register"
            className="topbar-get-started"
          >
            Get Started
          </NavLink>

        </nav>

        <NavLink
          to="/notifications"
          className="topbar-notification"
          aria-label="Notifications"
        >
          🔔
        </NavLink>

        <div className="topbar-user">

          <div className="topbar-avatar">
            {userName.charAt(0).toUpperCase()}
          </div>

          <span>
            {userName}
          </span>

        </div>

      </div>

    </header>
  );
}

export default Topbar;