import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Reviews.css";

const API_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  "http://localhost:5000/api";

const getId = (value) =>
  typeof value === "string" ? value : value?._id || value?.id || "";

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("skillbridgeUser") || "null");
  } catch {
    return null;
  }
};

const formatDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString();
};

function Stars({ rating }) {
  const safeRating = Math.min(5, Math.max(0, Math.round(Number(rating) || 0)));
  return (
    <div className="stars" aria-label={`${safeRating} out of 5 stars`}>
      {"★".repeat(safeRating)}
      <span className="empty-stars">{"★".repeat(5 - safeRating)}</span>
    </div>
  );
}

function Reviews() {
  const [user] = useState(getStoredUser);
  const [token] = useState(() => localStorage.getItem("skillbridgeToken"));
  const userId = getId(user);
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({ totalReviews: 0, averageRating: 0 });
  const [completedSessions, setCompletedSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(Boolean(token && userId));
  const [error, setError] = useState(
    token && userId
      ? ""
      : "Please log in to view reviews and review completed sessions."
  );
  const [unauthorized, setUnauthorized] = useState(!token || !userId);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  useEffect(() => {
    if (!token || !userId) {
      return undefined;
    }

    const controller = new AbortController();

    const loadReviews = async () => {
      try {
        const [reviewsResponse, summaryResponse, sessionsResponse] =
          await Promise.all([
            fetch(`${API_URL}/reviews/user/${userId}`, {
              signal: controller.signal,
            }),
            fetch(`${API_URL}/reviews/user/${userId}/summary`, {
              signal: controller.signal,
            }),
            fetch(`${API_URL}/sessions`, {
              headers: { Authorization: `Bearer ${token}` },
              signal: controller.signal,
            }),
          ]);
        const [reviewsResult, summaryResult, sessionsResult] =
          await Promise.all([
            reviewsResponse.json().catch(() => ({})),
            summaryResponse.json().catch(() => ({})),
            sessionsResponse.json().catch(() => ({})),
          ]);

        const failedResponse = [
          [reviewsResponse, reviewsResult],
          [summaryResponse, summaryResult],
          [sessionsResponse, sessionsResult],
        ].find(([response]) => !response.ok);

        if (failedResponse) {
          const [response, result] = failedResponse;
          const requiresLogin = response.status === 401 || response.status === 403;
          setUnauthorized(requiresLogin);
          setError(
            requiresLogin
              ? "Your session is invalid or expired. Please log in again."
              : result.message || "Unable to load reviews."
          );
          return;
        }

        if (
          !Array.isArray(reviewsResult.data) ||
          !summaryResult.data ||
          !Array.isArray(sessionsResult.sessions)
        ) {
          setError("The server returned incomplete review data.");
          return;
        }

        setReviews(reviewsResult.data);
        setSummary({
          totalReviews: Number(summaryResult.data.totalReviews) || 0,
          averageRating: Number(summaryResult.data.averageRating) || 0,
        });
        const eligibleSessions = sessionsResult.sessions.filter(
          (session) =>
            session.status === "completed" &&
            (getId(session.mentor) === userId ||
              getId(session.learner) === userId) &&
            getId(session.mentor) !== getId(session.learner)
        );
        setCompletedSessions(eligibleSessions);
        setSelectedSessionId(eligibleSessions[0]?._id || "");
      } catch (loadError) {
        if (loadError.name !== "AbortError") {
          setError("Could not connect to the server. Please try again.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadReviews();
    return () => controller.abort();
  }, [token, userId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError("");
    setSubmitSuccess("");

    const session = completedSessions.find(
      (item) => item._id === selectedSessionId
    );
    if (!session) {
      setSubmitError("Select one of your completed sessions.");
      return;
    }

    const mentorId = getId(session.mentor);
    const learnerId = getId(session.learner);
    const reviewedUser = mentorId === userId ? learnerId : mentorId;

    if (!reviewedUser || reviewedUser === userId || !session.skill) {
      setSubmitError("This session does not contain valid review details.");
      return;
    }

    setSubmitting(true);

    try {
      const skillResponse = await fetch(
        `${API_URL}/skills/search?name=${encodeURIComponent(session.skill)}`
      );
      const skillResult = await skillResponse.json().catch(() => ({}));

      if (!skillResponse.ok || !Array.isArray(skillResult.data)) {
        setSubmitError(
          skillResult.message || "Unable to find the skill associated with this session."
        );
        return;
      }

      const sessionSkill = skillResult.data.find(
        (skill) =>
          skill.name?.trim().toLowerCase() === session.skill.trim().toLowerCase() &&
          getId(skill.owner) === mentorId
      );

      if (!sessionSkill?._id) {
        setSubmitError(
          "The skill associated with this session is no longer available."
        );
        return;
      }

      const response = await fetch(`${API_URL}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reviewedUser,
          skill: sessionSkill._id,
          rating: Number(rating),
          comment: comment.trim(),
        }),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok || result.success !== true || !result.data) {
        const requiresLogin = response.status === 401 || response.status === 403;
        setUnauthorized(requiresLogin);
        setSubmitError(
          requiresLogin
            ? "Your session is invalid or expired. Please log in again."
            : response.status === 409
              ? result.message || "A conflicting review already exists."
              : result.message || "Unable to submit this review."
        );
        return;
      }

      setSubmitSuccess(
        "Review submitted successfully. The current API does not link reviews to sessions."
      );
      setComment("");
      setRating(5);
    } catch (submitFailure) {
      setSubmitError(
        submitFailure instanceof TypeError
          ? "Could not connect to the server. Please try again."
          : "Unable to submit this review."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const averageRating = summary.averageRating.toFixed(1);
  const starCounts = [5, 4, 3, 2, 1].map((star) =>
    reviews.filter((review) => Number(review.rating) === star).length
  );

  return (
    <main className="reviews-page">
      <section className="reviews-header">
        <p className="reviews-label">COMMUNITY FEEDBACK</p>
        <h1>Reviews &amp; Ratings</h1>
        <p>
          See feedback received by you and share your experience after a
          completed SkillBridge session.
        </p>
      </section>

      {loading && (
        <p className="reviews-state" role="status">
          Loading reviews...
        </p>
      )}

      {!loading && error && (
        <div className="reviews-state reviews-error" role="alert">
          <p>{error}</p>
          {unauthorized && <Link to="/login">Log in</Link>}
        </div>
      )}

      {!loading && !error && (
        <>
          <section className="overall-rating">
            <div className="rating-number">
              <h2>{averageRating}</h2>
              <Stars rating={Math.round(summary.averageRating)} />
              <p>Based on {summary.totalReviews} reviews</p>
            </div>

            <div className="rating-summary">
              {[5, 4, 3, 2, 1].map((star, index) => {
                const count = starCounts[index];
                const percentage =
                  reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                return (
                  <div key={star}>
                    <span>{star} ⭐</span>
                    <div className="rating-bar">
                      <div
                        className="rating-fill"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="review-form-section">
            <h2>Write a Review</h2>
            <p className="review-form-note">
              Select a completed session to identify the other participant and
              the skill. Reviews are not linked to sessions by the current API.
            </p>
            <form className="review-form" onSubmit={handleSubmit}>
              <label htmlFor="review-session">Completed session</label>
              <select
                id="review-session"
                value={selectedSessionId}
                onChange={(event) => setSelectedSessionId(event.target.value)}
                disabled={completedSessions.length === 0 || submitting}
                required
              >
                {completedSessions.length === 0 ? (
                  <option value="">No completed sessions available</option>
                ) : (
                  completedSessions.map((session) => {
                    const partner =
                      getId(session.mentor) === userId
                        ? session.learner
                        : session.mentor;
                    return (
                      <option key={session._id} value={session._id}>
                        {session.skill || "Skill session"} with{" "}
                        {partner?.name || "SkillBridge member"}
                        {formatDate(session.scheduledAt)
                          ? ` — ${formatDate(session.scheduledAt)}`
                          : ""}
                      </option>
                    );
                  })
                )}
              </select>

              <label htmlFor="review-rating">Rating</label>
              <select
                id="review-rating"
                value={rating}
                onChange={(event) => setRating(Number(event.target.value))}
                disabled={submitting}
                required
              >
                {[5, 4, 3, 2, 1].map((value) => (
                  <option key={value} value={value}>
                    {value} {value === 1 ? "Star" : "Stars"}
                  </option>
                ))}
              </select>

              <label htmlFor="review-comment">Review (optional)</label>
              <textarea
                id="review-comment"
                name="comment"
                rows="4"
                maxLength={500}
                placeholder="Write your review..."
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                disabled={submitting}
              />

              {submitError && (
                <p className="reviews-error" role="alert">
                  {submitError}
                  {unauthorized && (
                    <>
                      {" "}
                      <Link to="/login">Log in</Link>
                    </>
                  )}
                </p>
              )}
              {submitSuccess && (
                <p className="reviews-success" role="status">
                  {submitSuccess}
                </p>
              )}
              <button
                type="submit"
                disabled={submitting || completedSessions.length === 0}
              >
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          </section>

          <section className="reviews-section">
            <h2>Reviews you received</h2>
            {reviews.length === 0 ? (
              <p className="reviews-state">
                You have not received any reviews yet.
              </p>
            ) : (
              <div className="reviews-grid">
                {reviews.map((item) => {
                  const reviewerName =
                    item.reviewer?.name || "SkillBridge member";
                  const skillName =
                    item.skill?.name || "Skill exchange";
                  return (
                    <article className="review-card" key={item._id}>
                      <div className="review-top">
                        <div className="review-avatar">
                          {reviewerName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3>{reviewerName}</h3>
                          <p>{skillName}</p>
                        </div>
                      </div>
                      <Stars rating={item.rating} />
                      {item.comment && (
                        <p className="review-text">“{item.comment}”</p>
                      )}
                      {formatDate(item.createdAt) && (
                        <p className="review-date">
                          {formatDate(item.createdAt)}
                        </p>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}

export default Reviews;
