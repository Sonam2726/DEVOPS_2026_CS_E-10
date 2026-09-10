import { useState } from "react";
import "./Reviews.css";

const initialReviews = [
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
  const [reviews, setReviews] = useState(initialReviews);

  const [formData, setFormData] = useState({
    name: "",
    skill: "",
    rating: 5,
    review: "",
  });

  const averageRating = (
    reviews.reduce((sum, item) => sum + item.rating, 0) /
    reviews.length
  ).toFixed(1);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.name === "rating"
          ? Number(e.target.value)
          : e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.skill ||
      !formData.review
    ) {
      alert("Please fill all fields.");
      return;
    }

    setReviews([formData, ...reviews]);

    setFormData({
      name: "",
      skill: "",
      rating: 5,
      review: "",
    });
  };

  return (
    <main className="reviews-page">

      {/* Header */}
      <section className="reviews-header">

        <p className="reviews-label">
          COMMUNITY FEEDBACK
        </p>

        <h1>Reviews & Ratings</h1>

        <p>
          See what learners and skill providers
          say about their SkillBridge AI
          experience.
        </p>

      </section>

      {/* Overall Rating */}
      <section className="overall-rating">

        <div className="rating-number">

          <h2>{averageRating}</h2>

          <Stars
            rating={Math.round(averageRating)}
          />

          <p>
            Based on {reviews.length} reviews
          </p>

        </div>

        <div className="rating-summary">

          {[5, 4, 3, 2, 1].map((star) => {

            const count = reviews.filter(
              (item) => item.rating === star
            ).length;

            const percentage =
              (count / reviews.length) * 100;

            return (
              <div key={star}>

                <span>{star} ⭐</span>

                <div className="rating-bar">

                  <div
                    className="rating-fill"
                    style={{
                      width: `${percentage}%`,
                    }}
                  ></div>

                </div>

              </div>
            );
          })}

        </div>

      </section>

      {/* Review Form */}

      <section className="review-form-section">

        <h2>Write a Review</h2>

        <form
          className="review-form"
          onSubmit={handleSubmit}
        >

          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={formData.name}
            onChange={handleChange}
          />

          <input
            type="text"
            name="skill"
            placeholder="Skill"
            value={formData.skill}
            onChange={handleChange}
          />

          <select
            name="rating"
            value={formData.rating}
            onChange={handleChange}
          >
            <option value={5}>5 Stars</option>
            <option value={4}>4 Stars</option>
            <option value={3}>3 Stars</option>
            <option value={2}>2 Stars</option>
            <option value={1}>1 Star</option>
          </select>

          <textarea
            name="review"
            rows="4"
            placeholder="Write your review..."
            value={formData.review}
            onChange={handleChange}
          />

          <button type="submit">
            Submit Review
          </button>

        </form>

      </section>

      {/* Review Cards */}

      <section className="reviews-section">

        <h2>What our users say</h2>

        <div className="reviews-grid">

          {reviews.map((item, index) => (

            <article
              className="review-card"
              key={index}
            >

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