import { useState } from "react";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

import "./Settings.css";

function Settings() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [learningReminders, setLearningReminders] = useState(true);
  const [profileVisibility, setProfileVisibility] = useState(true);

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <main className="settings-page">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={closeSidebar}
      />

      {/* Main area */}
      <div className="settings-main">

        <Topbar
          onMenuClick={() => setSidebarOpen(true)}
        />

        <section className="settings-content">

          {/* Page intro */}
          <div className="settings-intro">

            <div>
              <p className="settings-eyebrow">
                Account
              </p>

              <h1>
                Settings
              </h1>

              <p>
                Manage your profile, preferences and security settings.
              </p>
            </div>

          </div>

          {/* Profile Section */}
          <section className="settings-section">

            <div className="settings-section-header">

              <div>
                <p className="settings-section-eyebrow">
                  Profile
                </p>

                <h2>
                  Personal information
                </h2>

                <p>
                  Manage the information associated with your SkillBridge AI profile.
                </p>
              </div>

            </div>

            <div className="settings-card">

              <div className="profile-header">

                <div className="profile-avatar">
                  T
                </div>

                <div className="profile-user-info">
                  <h3>
                    Tashu
                  </h3>

                  <p>
                    Student
                  </p>
                </div>

              </div>

              <div className="settings-form">

                <div className="form-group">

                  <label htmlFor="name">
                    Full name
                  </label>

                  <input
                    id="name"
                    type="text"
                    value="Tashu"
                    readOnly
                  />

                </div>

                <div className="form-group">

                  <label htmlFor="email">
                    Email address
                  </label>

                  <input
                    id="email"
                    type="email"
                    value="tashu@example.com"
                    readOnly
                  />

                </div>

                <div className="form-group">

                  <label htmlFor="role">
                    Account type
                  </label>

                  <input
                    id="role"
                    type="text"
                    value="Student"
                    readOnly
                  />

                </div>

              </div>

              <div className="settings-card-footer">

                <button className="settings-primary-button">
                  Save profile
                </button>

              </div>

            </div>

          </section>

          {/* Preferences Section */}
          <section className="settings-section">

            <div className="settings-section-header">

              <div>
                <p className="settings-section-eyebrow">
                  Preferences
                </p>

                <h2>
                  Your preferences
                </h2>

                <p>
                  Choose how you want to receive updates and manage your profile visibility.
                </p>
              </div>

            </div>

            <div className="settings-card settings-options">

              {/* Email notifications */}
              <div className="settings-option">

                <div className="settings-option-content">

                  <h3>
                    Email notifications
                  </h3>

                  <p>
                    Receive updates about learning activities and connections.
                  </p>

                </div>

                <button
                  type="button"
                  className={`settings-toggle ${
                    emailNotifications ? "active" : ""
                  }`}
                  onClick={() =>
                    setEmailNotifications(!emailNotifications)
                  }
                  aria-label="Toggle email notifications"
                  aria-pressed={emailNotifications}
                >
                  <span />
                </button>

              </div>

              {/* Learning reminders */}
              <div className="settings-option">

                <div className="settings-option-content">

                  <h3>
                    Learning reminders
                  </h3>

                  <p>
                    Get reminders for upcoming learning sessions.
                  </p>

                </div>

                <button
                  type="button"
                  className={`settings-toggle ${
                    learningReminders ? "active" : ""
                  }`}
                  onClick={() =>
                    setLearningReminders(!learningReminders)
                  }
                  aria-label="Toggle learning reminders"
                  aria-pressed={learningReminders}
                >
                  <span />
                </button>

              </div>

              {/* Profile visibility */}
              <div className="settings-option">

                <div className="settings-option-content">

                  <h3>
                    Profile visibility
                  </h3>

                  <p>
                    Allow other learners to discover your profile.
                  </p>

                </div>

                <button
                  type="button"
                  className={`settings-toggle ${
                    profileVisibility ? "active" : ""
                  }`}
                  onClick={() =>
                    setProfileVisibility(!profileVisibility)
                  }
                  aria-label="Toggle profile visibility"
                  aria-pressed={profileVisibility}
                >
                  <span />
                </button>

              </div>

            </div>

          </section>

          {/* Security Section */}
          <section className="settings-section">

            <div className="settings-section-header">

              <div>
                <p className="settings-section-eyebrow">
                  Security
                </p>

                <h2>
                  Account security
                </h2>

                <p>
                  Manage your password and keep your account secure.
                </p>
              </div>

            </div>

            <div className="settings-card">

              <div className="security-option">

                <div className="security-icon">
                  🔒
                </div>

                <div className="security-content">

                  <h3>
                    Password
                  </h3>

                  <p>
                    Update your password regularly to keep your account secure.
                  </p>

                </div>

                <button
                  type="button"
                  className="settings-secondary-button"
                >
                  Change password
                </button>

              </div>

              <div className="security-divider" />

              <div className="security-option">

                <div className="security-icon">
                  🛡️
                </div>

                <div className="security-content">

                  <h3>
                    Account protection
                  </h3>

                  <p>
                    Your account security settings are currently active.
                  </p>

                </div>

                <span className="security-status">
                  Protected
                </span>

              </div>

            </div>

          </section>

        </section>

      </div>

    </main>
  );
}

export default Settings;