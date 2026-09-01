import { useState } from "react";
import "./OfferSkill.css";

function OfferSkill() {
  const [submitted, setSubmitted] = useState(false);

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
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      form.skill &&
      form.category &&
      form.level &&
      form.description
    ) {
      setSubmitted(true);
    }
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

          <button
            onClick={() => {
              setSubmitted(false);
              setForm({
                skill: "",
                category: "",
                level: "",
                description: "",
              });
            }}
          >
            Add Another Skill
          </button>

        </div>

      </main>
    );
  }

  return (
    <main className="offer-page">

      <section className="offer-header">

        <p>SHARE YOUR KNOWLEDGE</p>

        <h1>Offer a Skill</h1>

        <span>
          Share what you know and help someone learn.
        </span>

      </section>


      <section className="offer-container">

        <form
          className="offer-form"
          onSubmit={handleSubmit}
        >

          <div className="form-group">

            <label>
              Skill Name
            </label>

            <input
              type="text"
              name="skill"
              placeholder="e.g. React Development"
              value={form.skill}
              onChange={handleChange}
            />

          </div>


          <div className="form-group">

            <label>
              Category
            </label>

            <select
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

              <option value="Data Science">
                Data Science
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

            <label>
              Skill Level
            </label>

            <select
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

            <label>
              Description
            </label>

            <textarea
              name="description"
              placeholder="Tell learners what you can teach..."
              value={form.description}
              onChange={handleChange}
            />

          </div>


          <button
            type="submit"
            className="offer-button"
          >
            Publish Skill
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