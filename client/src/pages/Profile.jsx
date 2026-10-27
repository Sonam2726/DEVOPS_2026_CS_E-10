import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Profile.css";

const API_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  "http://localhost:5000/api";

const getSkillName = (skill) =>
  typeof skill === "string" ? skill : skill?.name;

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [unauthorized, setUnauthorized] = useState(false);
  const [editing, setEditing] = useState(false);
  const [bioDraft, setBioDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const fetchProfile = async () => {
      const token = localStorage.getItem("skillbridgeToken");

      if (!token) {
        setUnauthorized(true);
        setError("Please log in to view your profile.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/users/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });
        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
          const requiresLogin = response.status === 401 || response.status === 403;
          setUnauthorized(requiresLogin);
          setError(
            requiresLogin
              ? "Your session is invalid or expired. Please log in again."
              : result.message || "Unable to load your profile."
          );
          return;
        }

        if (!result.success || !result.data?.profile) {
          setError("The server did not return profile data.");
          return;
        }

        setProfile(result.data.profile);
        setBioDraft(result.data.profile.bio || "");
      } catch (fetchError) {
        if (fetchError.name !== "AbortError") {
          setError("Could not connect to the server. Please try again.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchProfile();
    return () => controller.abort();
  }, []);

  const startEditing = () => {
    setBioDraft(profile?.bio || "");
    setSaveMessage("");
    setSaveError("");
    setEditing(true);
  };

  const cancelEditing = () => {
    setBioDraft(profile?.bio || "");
    setSaveMessage("");
    setSaveError("");
    setEditing(false);
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem("skillbridgeToken");

    if (!token) {
      setUnauthorized(true);
      setSaveError("Please log in again to update your profile.");
      return;
    }

    setSaving(true);
    setSaveError("");
    setSaveMessage("");

    try {
      const response = await fetch(`${API_URL}/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bio: bioDraft }),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        const requiresLogin = response.status === 401 || response.status === 403;
        setUnauthorized(requiresLogin);
        setSaveError(
          requiresLogin
            ? "Your session is invalid or expired. Please log in again."
            : result.message || "Unable to update your profile."
        );
        return;
      }

      if (!result.success || !result.data?.profile) {
        setSaveError("The server did not confirm the profile update.");
        return;
      }

      setProfile((currentProfile) => ({
        ...currentProfile,
        ...result.data.profile,
        skillsToTeach: currentProfile.skillsToTeach,
        skillsToLearn: currentProfile.skillsToLearn,
      }));
      setBioDraft(result.data.profile.bio || "");
      setEditing(false);
      setSaveMessage("Profile updated successfully.");
    } catch {
      setSaveError("Could not connect to the server. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="profile-page">
        <section className="profile-content" role="status">
          Loading your profile...
        </section>
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main className="profile-page">
        <section className="profile-content">
          <div className="profile-card" role="alert">
            <h1>{unauthorized ? "Login Required" : "Unable to Load Profile"}</h1>
            <p>{error || "No profile data is available."}</p>
            {unauthorized && (
              <Link to="/login" className="profile-action-button">
                Log in
              </Link>
            )}
          </div>
        </section>
      </main>
    );
  }

  const teachingSkills = Array.isArray(profile.skillsToTeach)
    ? profile.skillsToTeach.map(getSkillName).filter(Boolean)
    : [];
  const learningSkills = Array.isArray(profile.skillsToLearn)
    ? profile.skillsToLearn.map(getSkillName).filter(Boolean)
    : [];
  const skills = [...new Set([...teachingSkills, ...learningSkills])];

  return (
    <main className="profile-page">
      <section className="profile-header">
        <div className="profile-container">
          <div className="profile-avatar">
            {profile.profileImage ? (
              <img
                src={profile.profileImage}
                alt=""
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
            ) : (
              profile.name?.trim()?.charAt(0)?.toUpperCase() || "?"
            )}
          </div>

          <div className="profile-heading">
            <h1>{profile.name || "Name not provided"}</h1>
            <p>{profile.email || "Email not provided"}</p>
            <span>{profile.location || "Location not provided"}</span>
          </div>

          <button
            className="edit-profile-button"
            type="button"
            onClick={editing ? cancelEditing : startEditing}
          >
            {editing ? "Cancel" : "Edit Profile"}
          </button>
        </div>
      </section>

      <section className="profile-content">
        <div className="profile-card">
          <h2>About Me</h2>

          {editing ? (
            <form onSubmit={saveProfile}>
              <textarea
                value={bioDraft}
                onChange={(event) => setBioDraft(event.target.value)}
                placeholder="Write something about yourself..."
                maxLength={300}
                aria-label="Profile bio"
              />
              <p>{bioDraft.length}/300 characters</p>
              {saveError && <p role="alert">{saveError}</p>}
              {unauthorized && (
                <Link to="/login" className="profile-action-button">
                  Log in
                </Link>
              )}
              <button
                className="edit-profile-button"
                type="submit"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Profile"}
              </button>
            </form>
          ) : (
            <>
              <p>{profile.bio || "No bio has been added yet."}</p>
              {saveMessage && <p role="status">{saveMessage}</p>}
              {saveError && <p role="alert">{saveError}</p>}
            </>
          )}
        </div>

        <div className="profile-card">
          <div className="card-heading">
            <h2>My Skills</h2>
            <span>{skills.length} Skills</span>
          </div>

          {skills.length > 0 ? (
            <div className="profile-skills">
              {skills.map((skill) => (
                <span className="profile-skill" key={skill}>
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p>No skills have been added to your profile yet.</p>
          )}
        </div>

        <div className="profile-card">
          <h2>Skill Summary</h2>
          <div className="activity-grid">
            <div className="activity-item">
              <strong>{learningSkills.length}</strong>
              <span>Skills to Learn</span>
            </div>
            <div className="activity-item">
              <strong>{teachingSkills.length}</strong>
              <span>Skills to Teach</span>
            </div>
            <div className="activity-item">
              <strong>{skills.length}</strong>
              <span>Total Skills</span>
            </div>
          </div>
        </div>

        <div className="profile-actions">
          <Link to="/search" className="profile-action-button">
            Explore Skills
          </Link>
          <Link to="/requests" className="profile-action-button outline">
            My Requests
          </Link>
        </div>
      </section>
    </main>
  );
}

export default Profile;
