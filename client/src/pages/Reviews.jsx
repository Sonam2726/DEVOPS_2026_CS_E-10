import "./Reviews.css";

const reviews = [
  {
    name: "Aarav Sharma",
    skill: "React Development",
    rating: 5,
    review:
      "Very helpful and knowledgeable. I learned React concepts easily through the skill exchange.",
  },
  {
    name: "Riya Verma",
    skill: "UI/UX Design",
    rating: 4,
    review:
      "Great experience! The explanations were simple and easy to understand.",
  },
  {
    name: "Karan Mehta",
    skill: "Python Programming",
    rating: 5,
    review:
      "Excellent mentor. I really enjoyed learning and would definitely recommend this connection.",
  },
  {
    name: "Neha Singh",
    skill: "Web Development",
    rating: 4,
    review:
      "The learning experience was smooth and interactive. Really useful platform.",
  },
];

function Stars({ rating }) {
  return (
    <div className="stars">
      {"★".repeat(rating)}
      <span className="empty-stars">
        {"★".repeat(5 - rating)}
      </span>
    </div>
  );
}

function Reviews() {
  return (
    <main className="reviews-page">

      {/* Header */}
      <section className="reviews-header">
        <p className="reviews-label">COMMUNITY FEEDBACK</p>

        <h1>Reviews & Ratings</h1>

        <p>
          See what learners and skill providers say
          about their SkillBridge AI experience.
        </p>
      </section>

      {/* Overall Rating */}
      <section className="overall-rating">

        <div className="rating-number">
          <h2>4.8</h2>
          <Stars rating={5} />
          <p>Based on 24 reviews</p>
        </div>

        <div className="rating-summary">
          <div>
            <span>5 ⭐</span>
            <div className="rating-bar">
              <div className="rating-fill five"></div>
            </div>
          </div>

          <div>
            <span>4 ⭐</span>
            <div className="rating-bar">
              <div className="rating-fill four"></div>
            </div>
          </div>

          <div>
            <span>3 ⭐</span>
            <div className="rating-bar">
              <div className="rating-fill three"></div>
            </div>
          </div>

          <div>
            <span>2 ⭐</span>
            <div className="rating-bar">
              <div className="rating-fill two"></div>
            </div>
          </div>

          <div>
            <span>1 ⭐</span>
            <div className="rating-bar">
              <div className="rating-fill one"></div>
            </div>
          </div>
        </div>

      </section>

      {/* Review Cards */}
      <section className="reviews-section">

        <h2>What our users say</h2>

        <div className="reviews-grid">

          {reviews.map((item, index) => (
            <article className="review-card" key={index}>

              <div className="review-top">

                <div className="review-avatar">
                  {item.name.charAt(0)}
                </div>

                <div>
                  <h3>{item.name}</h3>
                  <p>{item.skill}</p>
                </div>

              </div>

              <Stars rating={item.rating} />

              <p className="review-text">
                "{item.review}"
              </p>

            </article>
          ))}

        </div>

      </section>

    </main>
  );
}

export default Reviews;