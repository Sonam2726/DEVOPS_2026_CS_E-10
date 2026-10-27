import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./OfferSkill.css";
import ContextualNavigation from "../components/ContextualNavigation";

const API_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  "http://localhost:5000/api";

function OfferSkill() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const submissionInProgress = useRef(false);

  const [form, setForm] = useState({
    skill: "",
    category: "",
    level: "",
    description: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submissionInProgress.current) return;

    const name = form.skill.trim();
    const description = form.description.trim();
    if (!name || !description || !form.category || !form.level) {
      setError("Please complete all fields before publishing your skill.");
      return;
    }

    const token = localStorage.getItem("skillbridgeToken");
    if (!token) {
      setError("Please log in to publish a skill.");
      return;
    }
    if (token === "demo-token") {
      setError("Demo login is not valid for API requests. Log in with a server account.");
      return;
    }

    submissionInProgress.current = true;
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/skills`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          description,
          category: form.category,
          level: form.level,
        }),
      });
      const result = await response.json().catch(() => ({}));

      if (response.status !== 201 || !result.success || !result.data) {
        throw new Error(
          result.message || "The skill could not be published. Please try again."
        );
      }

      setSubmitted(true);
    } catch (submitError) {
      setError(
        submitError instanceof TypeError
          ? "Could not connect to the server. Please try again."
          : submitError.message ||
              "The skill could not be published. Please try again."
      );
    } finally {
      submissionInProgress.current = false;
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setError("");

    setForm({
      skill: "",
      category: "",
      level: "",
      description: "",
    });
  };

  if (submitted) {
    return (
      <main className="offer-page">

        <div className="offer-success">

          <div className="success-circle">
            ✓
          </div>

          <h1>Skill Added Successfully!</h1>

          <p>
            Your skill is now available for other
            learners on SkillBridge AI.
          </p>

          <button onClick={resetForm}>
            Add Another Skill
          </button>
          <Link className="offer-view-skills" to="/my-skills">
            View My Skills
          </Link>

        </div>

      </main>
    );
  }

  return (
    <main className="offer-page">
      <ContextualNavigation
        label="Add Skill"
        fallbackPath="/my-skills"
        fallbackLabel="My Skills"
      />

      {/* Header */}
      <section className="offer-header">

        <p>SHARE YOUR KNOWLEDGE</p>

        <h1>Offer a Skill</h1>

        <span>
          Share what you know and help someone learn.
        </span>

      </section>


      {/* Main Content */}
      <section className="offer-container">

        {/* Form */}
        <form
          className="offer-form"
          onSubmit={handleSubmit}
        >

          <div className="form-group">

            <label htmlFor="skill">
              Skill Name
            </label>

            <input
              id="skill"
              type="text"
              name="skill"
              placeholder="e.g. React Development"
              value={form.skill}
              onChange={handleChange}
            />

          </div>


          <div className="form-group">

            <label htmlFor="category">
              Category
            </label>

            <select
              id="category"
              name="category"
              value={form.category}
              onChange={handleChange}
            >

              <option value="">
                Select a category
              </option>

              <option value="Programming">
                Programming
              </option>

              <option value="Design">
                Design
              </option>

              <option value="Web Development">
                Web Development
              </option>

              <option value="Data Science">
                Data Science
              </option>

              <option value="Languages">
                Languages
              </option>

              <option value="Business">
                Business
              </option>

              <option value="Other">
                Other
              </option>

            </select>

          </div>


          <div className="form-group">

            <label htmlFor="level">
              Skill Level
            </label>

            <select
              id="level"
              name="level"
              value={form.level}
              onChange={handleChange}
            >

              <option value="">
                Select skill level
              </option>

              <option value="Beginner">
                Beginner
              </option>

              <option value="Intermediate">
                Intermediate
              </option>

              <option value="Advanced">
                Advanced
              </option>

            </select>

          </div>


          <div className="form-group">

            <label htmlFor="description">
              Description
            </label>

            <textarea
              id="description"
              name="description"
              placeholder="Tell learners what you can teach..."
              value={form.description}
              onChange={handleChange}
            />

          </div>

          {error && <p role="alert">{error}</p>}

          <button
            type="submit"
            className="offer-button"
            disabled={submitting}
          >
            {submitting ? "Publishing..." : "Publish Skill"}
          </button>

        </form>


        {/* Tips */}
        <aside className="offer-tips">

          <h2>Tips for a great skill</h2>

          <div className="tip">
            <span>✓</span>

            <p>
              Choose a clear and specific skill name.
            </p>
          </div>

          <div className="tip">
            <span>✓</span>

            <p>
              Select the correct difficulty level.
            </p>
          </div>

          <div className="tip">
            <span>✓</span>

            <p>
              Explain what learners can expect.
            </p>
          </div>

          <div className="tip">
            <span>✓</span>

            <p>
              Share skills you are confident teaching.
            </p>
          </div>

        </aside>

      </section>

    </main>
  );
}

export default OfferSkill;