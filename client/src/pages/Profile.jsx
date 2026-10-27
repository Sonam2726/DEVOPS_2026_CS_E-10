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
  const [profileDraft, setProfileDraft] = useState({
    name: "",
    email: "",
    bio: "",
    location: "",
  });
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
        setProfileDraft({
          name: result.data.profile.name || "",
          email: result.data.profile.email || "",
          bio: result.data.profile.bio || "",
          location: result.data.profile.location || "",
        });
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
    setProfileDraft({
      name: profile?.name || "",
      email: profile?.email || "",
      bio: profile?.bio || "",
      location: profile?.location || "",
    });
    setSaveMessage("");
    setSaveError("");
    setEditing(true);
  };

  const cancelEditing = () => {
    setProfileDraft({
      name: profile?.name || "",
      email: profile?.email || "",
      bio: profile?.bio || "",
      location: profile?.location || "",
    });
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

    if (
      profileDraft.name.trim().length < 2 ||
      profileDraft.name.trim().length > 50
    ) {
      setSaveError("Name must be between 2 and 50 characters long.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileDraft.email.trim())) {
      setSaveError("Please provide a valid email address.");
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
        body: JSON.stringify({
          name: profileDraft.name.trim(),
          email: profileDraft.email.trim(),
          bio: profileDraft.bio.trim(),
          location: profileDraft.location.trim(),
        }),
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
      setProfileDraft({
        name: result.data.profile.name || "",
        email: result.data.profile.email || "",
        bio: result.data.profile.bio || "",
        location: result.data.profile.location || "",
      });
      const savedUser = JSON.parse(
        localStorage.getItem("skillbridgeUser") || "{}"
      );
      localStorage.setItem(
        "skillbridgeUser",
        JSON.stringify({
          ...savedUser,
          name: result.data.profile.name,
          email: result.data.profile.email,
          role: result.data.profile.role,
        })
      );
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
          <div className="card-heading">
            <h2>Edit Profile</h2>
            <span>Public information</span>
          </div>

          {editing ? (
            <form onSubmit={saveProfile}>
              <label htmlFor="profile-name">Full name</label>
              <input
                id="profile-name"
                type="text"
                value={profileDraft.name}
                onChange={(event) =>
                  setProfileDraft((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                minLength={2}
                maxLength={50}
                required
              />
              <label htmlFor="profile-email">Email address</label>
              <input
                id="profile-email"
                type="email"
                value={profileDraft.email}
                onChange={(event) =>
                  setProfileDraft((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
                required
              />
              <label htmlFor="profile-location">Location</label>
              <input
                id="profile-location"
                type="text"
                value={profileDraft.location}
                onChange={(event) =>
                  setProfileDraft((current) => ({
                    ...current,
                    location: event.target.value,
                  }))
                }
                maxLength={100}
              />
              <label htmlFor="profile-bio">About Me</label>
              <textarea
                value={profileDraft.bio}
                onChange={(event) =>
                  setProfileDraft((current) => ({
                    ...current,
                    bio: event.target.value,
                  }))
                }
                placeholder="Write something about yourself..."
                maxLength={300}
                id="profile-bio"
                aria-label="Profile bio"
              />
              <p>{profileDraft.bio.length}/300 characters</p>
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
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button
                className="profile-action-button outline"
                type="button"
                onClick={cancelEditing}
                disabled={saving}
              >
                Cancel
              </button>
            </form>
          ) : (
            <>
              <h2>About Me</h2>
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
