import { NavLink } from "react-router-dom";

import "./Sidebar.css";

function Sidebar({ isOpen, onClose }) {
  const savedUser = localStorage.getItem("skillbridgeUser");
  const currentUser = savedUser ? JSON.parse(savedUser) : null;
  const userName = currentUser?.name || "User";

  const menuItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: "⌂",
    },
    {
      label: "Notifications",
      path: "/notifications",
      icon: "🔔",
    },
    {
      label: "Settings",
      path: "/settings",
      icon: "⚙",
    },
  ];

  return (
    <aside
      className={`dashboard-sidebar ${
        isOpen ? "sidebar-open" : ""
      }`}
    >

      {/* Sidebar header */}
      <div className="sidebar-header">

        <NavLink
          to="/dashboard"
          className="sidebar-logo"
          onClick={onClose}
        >
          SkillBridge AI
        </NavLink>

        <button
          className="sidebar-close"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          ×
        </button>

      </div>

      {/* Menu */}
      <div className="sidebar-menu">

        <p className="sidebar-menu-title">
          Main Menu
        </p>

        <nav className="sidebar-nav">

          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `sidebar-link ${
                  isActive ? "active" : ""
                }`
              }
            >
              <span className="sidebar-icon">
                {item.icon}
              </span>

              <span>
                {item.label}
              </span>
            </NavLink>
          ))}

        </nav>

      </div>

      {/* User section */}
      <div className="sidebar-user">

        <div className="sidebar-avatar">
          {userName.charAt(0).toUpperCase()}
        </div>

        <div className="sidebar-user-info">
          <strong>
            {userName}
          </strong>

          <span>
            Student
          </span>
        </div>

      </div>

    </aside>
  );
}

export default Sidebar;