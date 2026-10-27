import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";

import Reviews from "./Reviews";

const userId = "507f1f77bcf86cd799439011";
const mentorId = "507f1f77bcf86cd799439012";
const learnerId = userId;
const sessionId = "507f1f77bcf86cd799439013";
const skillId = "507f1f77bcf86cd799439014";

const completedSession = {
  _id: sessionId,
  mentor: { _id: mentorId, name: "Mentor" },
  learner: { _id: learnerId, name: "Current Learner" },
  skill: "JavaScript",
  status: "completed",
  scheduledAt: "2026-10-20T12:00:00.000Z",
};

const renderReviews = () =>
  render(
    <MemoryRouter>
      <Reviews />
    </MemoryRouter>
  );

const response = (body, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
});

const mockReviewPage = (received = []) => {
  fetch
    .mockResolvedValueOnce(response({ success: true, data: received }))
    .mockResolvedValueOnce(
      response({
        success: true,
        data: {
          totalReviews: received.length,
          averageRating: received.length ? received[0].rating : 0,
        },
      })
    )
    .mockResolvedValueOnce(
      response({ success: true, sessions: [completedSession] })
    );
};

describe("Reviews page", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("skillbridgeToken", "test-jwt");
    localStorage.setItem(
      "skillbridgeUser",
      JSON.stringify({ _id: userId, name: "Current Learner" })
    );
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads received reviews and rating summary from the review API", async () => {
    mockReviewPage([
      {
        _id: "review-id",
        reviewer: { name: "Review Author" },
        skill: { name: "Python" },
        rating: 4,
        comment: "Helpful session",
      },
    ]);

    renderReviews();

    expect(await screen.findByRole("heading", { name: "Review Author" }))
      .toBeInTheDocument();
    expect(screen.getByText(/Helpful session/)).toBeInTheDocument();
    expect(screen.getByText("Based on 1 reviews")).toBeInTheDocument();
    expect(fetch).toHaveBeenNthCalledWith(
      1,
      `http://localhost:5000/api/reviews/user/${userId}`,
      expect.any(Object)
    );
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      `http://localhost:5000/api/reviews/user/${userId}/summary`,
      expect.any(Object)
    );
  });

  it("submits the backend review payload using a completed session's participants and skill", async () => {
    mockReviewPage();
    fetch
      .mockResolvedValueOnce(
        response({
          success: true,
          data: [
            {
              _id: skillId,
              name: "JavaScript",
              owner: { _id: mentorId, name: "Mentor" },
            },
          ],
        })
      )
      .mockResolvedValueOnce(
        response(
          {
            success: true,
            data: { _id: "new-review", rating: 5 },
          },
          201
        )
      );

    renderReviews();
    fireEvent.change(
      await screen.findByRole("textbox", { name: "Review (optional)" }),
      { target: { value: "Great teaching experience." } }
    );
    fireEvent.click(screen.getByRole("button", { name: "Submit Review" }));

    expect(await screen.findByRole("status")).toHaveTextContent(
      "Review submitted successfully."
    );
    expect(fetch).toHaveBeenNthCalledWith(
      4,
      "http://localhost:5000/api/skills/search?name=JavaScript"
    );
    expect(fetch).toHaveBeenNthCalledWith(
      5,
      "http://localhost:5000/api/reviews",
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-jwt",
        },
        body: JSON.stringify({
          reviewedUser: mentorId,
          skill: skillId,
          rating: 5,
          comment: "Great teaching experience.",
        }),
      })
    );
  });

  it("handles a duplicate/conflict response without success feedback", async () => {
    mockReviewPage();
    fetch
      .mockResolvedValueOnce(
        response({
          success: true,
          data: [
            {
              _id: skillId,
              name: "JavaScript",
              owner: { _id: mentorId },
            },
          ],
        })
      )
      .mockResolvedValueOnce(
        response({ success: false, message: "Duplicate review" }, 409)
      );

    renderReviews();
    fireEvent.click(
      await screen.findByRole("button", { name: "Submit Review" })
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Duplicate review"
    );
    expect(screen.queryByText(/Review submitted successfully/)).toBeNull();
  });

  it("shows a login link when loading completed sessions is unauthorized", async () => {
    fetch
      .mockResolvedValueOnce(response({ success: true, data: [] }))
      .mockResolvedValueOnce(
        response({
          success: true,
          data: { totalReviews: 0, averageRating: 0 },
        })
      )
      .mockResolvedValueOnce(
        response({ success: false, message: "Unauthorized" }, 401)
      );

    renderReviews();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Your session is invalid or expired."
    );
    expect(screen.getByRole("link", { name: "Log in" })).toHaveAttribute(
      "href",
      "/login"
    );
  });

  it("shows empty states when no reviews or completed sessions exist", async () => {
    fetch
      .mockResolvedValueOnce(response({ success: true, data: [] }))
      .mockResolvedValueOnce(
        response({
          success: true,
          data: { totalReviews: 0, averageRating: 0 },
        })
      )
      .mockResolvedValueOnce(response({ success: true, sessions: [] }));

    renderReviews();

    expect(
      await screen.findByText("You have not received any reviews yet.")
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Submit Review" })).toBeDisabled();
  });
});
