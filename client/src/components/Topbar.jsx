import "./Topbar.css";

function Topbar({ onMenuClick }) {
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
        <span>
          SkillBridge AI
        </span>
      </div>

      {/* Right section */}
      <div className="topbar-actions">

        <nav className="topbar-links">

          <a href="/home">
            Home
          </a>

          <a href="/about">
            About
          </a>

          <a href="/login">
            Login
          </a>

          <a
            href="/register"
            className="topbar-get-started"
          >
            Get Started
          </a>

        </nav>

        <button
          className="topbar-notification"
          aria-label="Notifications"
        >
          🔔
        </button>

        <div className="topbar-user">

          <div className="topbar-avatar">
            T
          </div>

          <span>
            Tashu
          </span>

        </div>

      </div>

    </header>
  );
}

export default Topbar;