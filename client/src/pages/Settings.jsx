import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import "./Settings.css";

const API_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  "http://localhost:5000/api";

function Settings() {
  const savedUser = JSON.parse(
    localStorage.getItem("skillbridgeUser") || "{}"
  );

  const userName = savedUser.name || "User";
  const userEmail = savedUser.email || "";

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [profileVisibility, setProfileVisibility] = useState("public");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [saveError, setSaveError] = useState("");

  const [passwordStatus, setPasswordStatus] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const fetchSettings = async () => {
      const token = localStorage.getItem("skillbridgeToken");
      if (!token) {
        setLoadError("Please log in to view your settings.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/settings`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok || !result.success || !result.data?.settings) {
          throw new Error(result.message || "Unable to load your settings.");
        }
        setEmailNotifications(result.data.settings.emailNotifications);
        setPushNotifications(result.data.settings.pushNotifications);
        setProfileVisibility(result.data.settings.profileVisibility);
      } catch (fetchError) {
        if (fetchError.name !== "AbortError") {
          setLoadError(fetchError.message || "Could not connect to the server.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchSettings();
    return () => controller.abort();
  }, []);

  const handleSavePreferences = async () => {
    const token = localStorage.getItem("skillbridgeToken");
    if (!token) {
      setSaveError("Please log in again to update your settings.");
      return;
    }

    setIsSaving(true);
    setSaveStatus("");
    setSaveError("");

    try {
      const response = await fetch(`${API_URL}/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          emailNotifications,
          pushNotifications,
          profileVisibility,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.success || !result.data?.settings) {
        throw new Error(result.message || "Unable to save your preferences.");
      }

      setEmailNotifications(result.data.settings.emailNotifications);
      setPushNotifications(result.data.settings.pushNotifications);
      setProfileVisibility(result.data.settings.profileVisibility);
      setSaveStatus("success");
    } catch (saveRequestError) {
      setSaveError(
        saveRequestError.message || "Could not connect to the server."
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Password action
  const handleChangePassword = () => {
    setPasswordStatus("error");

    setTimeout(() => {
      setPasswordStatus("");
    }, 3500);
  };

  return (
    <main className="settings-page">
      <section className="settings-content">

          {/* =========================
              PAGE INTRO
          ========================= */}

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


          {loadError && <p role="alert">{loadError}</p>}
          {loading && <p role="status">Loading your settings...</p>}

          {/* Account information is displayed here; public profile editing lives on Profile. */}

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
                  Account details are read-only here. Use Profile to edit your
                  public information.
                </p>
              </div>

            </div>


            <div className="settings-card">

              {/* Profile header */}
              <div className="profile-header">

                <div className="profile-avatar">
                  {userName.charAt(0).toUpperCase()}
                </div>

                <div className="profile-user-info">

                  <h3>
                    {userName}
                  </h3>

                  <p>{savedUser.role === "admin" ? "Administrator" : "Student"}</p>

                </div>

              </div>


              {/* Profile form */}
              <div className="settings-form">

                <div className="form-group">

                  <label htmlFor="name">
                    Full name
                  </label>

                  <input
                    id="name"
                    type="text"
                    value={userName}
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
                    value={userEmail}
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
                    value={savedUser.role === "admin" ? "Administrator" : "Student"}
                    readOnly
                  />

                </div>

              </div>


              {/* Save footer */}
              <div className="settings-card-footer">

                <Link to="/profile" className="settings-secondary-button">
                  Edit public profile
                </Link>

              </div>

            </div>

          </section>


          {/* =========================
              PREFERENCES SECTION
          ========================= */}

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
                  Choose how you want to receive updates and manage your
                  profile visibility.
                </p>

              </div>

            </div>


            <div className="settings-card settings-options">

              {/* Email notifications */}
              <div className="settings-option">

                <div className="settings-option-icon">
                  🔔
                </div>

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



              {/* Profile visibility */}
              <div className="settings-option">

                <div className="settings-option-icon">
                  👤
                </div>

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
                    profileVisibility === "public" ? "active" : ""
                  }`}
                  onClick={() =>
                    setProfileVisibility((current) =>
                      current === "public" ? "private" : "public"
                    )
                  }
                  aria-label="Toggle profile visibility"
                  aria-pressed={profileVisibility === "public"}
                >
                  <span />
                </button>

              </div>

            </div>

            {saveError && <p role="alert">{saveError}</p>}
            {saveStatus === "success" && (
              <p className="settings-success-message" role="status">
                ✓ Preferences saved successfully
              </p>
            )}
            <button
              type="button"
              className="settings-primary-button"
              onClick={handleSavePreferences}
              disabled={loading || isSaving || Boolean(loadError)}
            >
              {isSaving ? "Saving..." : "Save preferences"}
            </button>

          </section>


          {/* =========================
              SECURITY SECTION
          ========================= */}

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

              {/* Password */}
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
                  onClick={handleChangePassword}
                >
                  Change password
                </button>

              </div>


              {/* Password error state */}
              {passwordStatus === "error" && (
                <div className="settings-error-state">

                  <span className="state-icon">
                    !
                  </span>

                  <div>
                    <strong>
                      Password update unavailable
                    </strong>

                    <p>
                      Password management will be available once account
                      authentication is connected.
                    </p>
                  </div>

                </div>
              )}


              <div className="security-divider" />


              {/* Account protection */}
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


          {/* =========================
              SETTINGS INFO / EMPTY STATE
          ========================= */}

          <section className="settings-info-card">

            <div className="settings-info-icon">
              ⚙️
            </div>

            <div>

              <h3>
                More settings coming soon
              </h3>

              <p>
                Additional account and learning preferences will appear here
                as new SkillBridge AI features are added.
              </p>

            </div>

          </section>

      </section>
    </main>
  );
}

export default Settings;