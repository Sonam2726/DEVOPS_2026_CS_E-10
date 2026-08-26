import { useParams, Link } from "react-router-dom";
import "./SkillPreview.css";

function SkillPreview() {
  const { id } = useParams();

  const skills = [
    {
      id: "1",
      title: "React Development",
      category: "Programming",
      level: "Intermediate",
      teacher: "Aarav",
      description:
        "Learn React fundamentals, components, props, state and modern React development.",
      topics: [
        "React Components",
        "Props and State",
        "React Hooks",
        "React Router",
      ],
    },
    {
      id: "2",
      title: "Python Programming",
      category: "Programming",
      level: "Beginner",
      teacher: "Riya",
      description:
        "Learn Python from the basics and build a strong programming foundation.",
      topics: [
        "Python Basics",
        "Functions",
        "OOP",
        "File Handling",
      ],
    },
    {
      id: "3",
      title: "UI/UX Design",
      category: "Design",
      level: "Intermediate",
      teacher: "Karan",
      description:
        "Learn how to design simple, user-friendly and attractive digital experiences.",
      topics: [
        "Design Principles",
        "Wireframing",
        "Prototyping",
        "User Research",
      ],
    },
    {
      id: "4",
      title: "Machine Learning",
      category: "Data Science",
      level: "Advanced",
      teacher: "Ananya",
      description:
        "Explore machine learning concepts, algorithms and practical applications.",
      topics: [
        "ML Fundamentals",
        "Regression",
        "Classification",
        "Model Evaluation",
      ],
    },
  ];

  const skill = skills.find((item) => item.id === id);

  if (!skill) {
    return (
      <main className="skill-details">
        <div className="not-found">
          <h2>Skill Not Found</h2>
          <p>The skill you are looking for does not exist.</p>

          <Link to="/search" className="back-button">
            Back to Search
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="skill-details">

      {/* Back */}
      <div className="details-container">
        <Link to="/search" className="back-link">
          ← Back to Search
        </Link>

        {/* Main Details */}
        <section className="skill-main">

          <div className="skill-main-content">

            <span className="skill-category">
              {skill.category}
            </span>

            <h1>{skill.title}</h1>

            <p className="skill-description">
              {skill.description}
            </p>

            <div className="skill-info">
              <span>
                <strong>Level:</strong> {skill.level}
              </span>

              <span>
                <strong>Teacher:</strong> {skill.teacher}
              </span>
            </div>

            <button className="request-button">
              Request to Learn
            </button>

          </div>

        </section>


        {/* Topics */}
        <section className="topics-section">

          <h2>What You Will Learn</h2>

          <div className="topics-grid">
            {skill.topics.map((topic, index) => (
              <div className="topic-card" key={index}>
                <div className="topic-number">
                  {index + 1}
                </div>

                <span>{topic}</span>
              </div>
            ))}
          </div>

        </section>


        {/* Teacher */}
        <section className="teacher-section">

          <div className="teacher-avatar">
            {skill.teacher.charAt(0)}
          </div>

          <div>
            <p className="teacher-label">SKILL TEACHER</p>

            <h2>{skill.teacher}</h2>

            <p>
              Available to help you learn {skill.title}.
            </p>
          </div>

        </section>

      </div>

    </main>
  );
}

export default SkillPreview;