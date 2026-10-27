import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";

import Exchange from "./Exchange";

const requestId = "507f1f77bcf86cd799439011";
const currentTime = new Date();
const future = new Date(currentTime.getTime() + 24 * 60 * 60 * 1000);
const dateValue = `${future.getFullYear()}-${String(
  future.getMonth() + 1
).padStart(2, "0")}-${String(future.getDate()).padStart(2, "0")}`;

const renderExchange = () =>
  render(
    <MemoryRouter>
      <Exchange />
    </MemoryRouter>
  );

const response = (body, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
});

const request = {
  _id: requestId,
  sender: { _id: "507f1f77bcf86cd799439012", name: "Learner" },
  receiver: { _id: "507f1f77bcf86cd799439013", name: "Mentor" },
  skillToLearn: "JavaScript",
  status: "pending",
  message: "I would like to learn.",
  createdAt: "2026-10-25T12:00:00.000Z",
};

const requestsPage = (page, incoming, outgoing, totalPages = 1) => ({
  success: true,
  incoming,
  outgoing,
  pagination: {
    page,
    limit: 50,
    totalIncoming: totalPages * 50,
    totalOutgoing: totalPages * 50,
    totalIncomingPages: totalPages,
    totalOutgoingPages: totalPages,
  },
});

describe("Exchange page", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("skillbridgeToken", "test-jwt");
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads real requests and sessions from the backend", async () => {
    fetch
      .mockResolvedValueOnce(response(requestsPage(1, [request], [])))
      .mockResolvedValueOnce(
        response({
          success: true,
          count: 0,
          sessions: [],
        })
      );

    renderExchange();

    expect(await screen.findByText("Learner")).toBeInTheDocument();
    expect(screen.getByText("I would like to learn.")).toBeInTheDocument();
    expect(fetch).toHaveBeenNthCalledWith(
      1,
      "http://localhost:5000/api/requests?page=1&limit=50",
      expect.objectContaining({
        headers: { Authorization: "Bearer test-jwt" },
      })
    );
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      "http://localhost:5000/api/sessions",
      expect.objectContaining({
        headers: { Authorization: "Bearer test-jwt" },
      })
    );
  });

  it("loads more requests and hides the control on the final API page", async () => {
    fetch
      .mockResolvedValueOnce(
        response(requestsPage(1, [request], [], 2))
      )
      .mockResolvedValueOnce(response({ success: true, sessions: [] }))
      .mockResolvedValueOnce(
        response(
          requestsPage(
            2,
            [
              {
                ...request,
                _id: "second-request",
                sender: { _id: "second-user", name: "Second Learner" },
              },
            ],
            [],
            2
          )
        )
      );

    renderExchange();
    expect(await screen.findByText("Learner")).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: "Load more requests" })
    );

    expect(await screen.findByText("Second Learner")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Load more requests/ })
    ).toBeNull();
    expect(fetch).toHaveBeenLastCalledWith(
      "http://localhost:5000/api/requests?page=2&limit=50",
      expect.objectContaining({
        headers: { Authorization: "Bearer test-jwt" },
      })
    );
  });

  it("shows an error and retries loading an additional request page", async () => {
    fetch
      .mockResolvedValueOnce(
        response(requestsPage(1, [request], [], 2))
      )
      .mockResolvedValueOnce(response({ success: true, sessions: [] }))
      .mockResolvedValueOnce(
        response({ success: false, message: "Page unavailable" }, 503)
      )
      .mockResolvedValueOnce(
        response(
          requestsPage(
            2,
            [
              {
                ...request,
                _id: "second-request",
                sender: { _id: "second-user", name: "Second Learner" },
              },
            ],
            [],
            2
          )
        )
      );

    renderExchange();
    fireEvent.click(
      await screen.findByRole("button", { name: "Load more requests" })
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Page unavailable"
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Retry loading more" })
    );

    expect(await screen.findByText("Second Learner")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Load more requests/ })
    ).toBeNull();
  });

  it("accepts an incoming pending request through the request status API", async () => {
    fetch
      .mockResolvedValueOnce(response(requestsPage(1, [request], [])))
      .mockResolvedValueOnce(response({ success: true, sessions: [] }))
      .mockResolvedValueOnce(
        response({
          success: true,
          request: { ...request, status: "accepted" },
        })
      );

    renderExchange();
    fireEvent.click(
      await screen.findByRole("button", { name: "Accept Request" })
    );

    expect(
      await screen.findByRole("button", { name: "Schedule Session" })
    ).toBeInTheDocument();
    expect(fetch).toHaveBeenLastCalledWith(
      `http://localhost:5000/api/requests/${requestId}/status`,
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({ status: "accepted" }),
      })
    );
  });

  it("creates a session only from an accepted request and sends its request ID", async () => {
    fetch
      .mockResolvedValueOnce(
        response(requestsPage(1, [{ ...request, status: "accepted" }], []))
      )
      .mockResolvedValueOnce(response({ success: true, sessions: [] }))
      .mockResolvedValueOnce(
        response({
          success: true,
          session: {
            _id: "507f1f77bcf86cd799439014",
            request: requestId,
            status: "upcoming",
            scheduledAt: future.toISOString(),
          },
        }, 201)
      );

    renderExchange();
    fireEvent.click(
      await screen.findByRole("button", { name: "Schedule Session" })
    );
    fireEvent.change(screen.getByLabelText("Date"), {
      target: { value: dateValue },
    });
    fireEvent.change(screen.getByLabelText("Time"), {
      target: { value: "23:59" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Confirm Session" }));

    expect(await screen.findByRole("status")).toHaveTextContent(
      "Session scheduled successfully."
    );
    expect(fetch).toHaveBeenLastCalledWith(
      "http://localhost:5000/api/sessions",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining(`"requestId":"${requestId}"`),
      })
    );
  });

  it("shows backend session conflicts without claiming success", async () => {
    fetch
      .mockResolvedValueOnce(
        response(requestsPage(1, [{ ...request, status: "accepted" }], []))
      )
      .mockResolvedValueOnce(response({ success: true, sessions: [] }))
      .mockResolvedValueOnce(
        response({ success: false, message: "A session already exists" }, 409)
      );

    renderExchange();
    fireEvent.click(
      await screen.findByRole("button", { name: "Schedule Session" })
    );
    fireEvent.change(screen.getByLabelText("Date"), {
      target: { value: dateValue },
    });
    fireEvent.change(screen.getByLabelText("Time"), {
      target: { value: "23:59" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Confirm Session" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "A session already exists"
    );
    expect(screen.queryByText("Session scheduled successfully.")).toBeNull();
  });

  it("shows a login link when the API denies access", async () => {
    fetch
      .mockResolvedValueOnce(
        response({ success: false, message: "Unauthorized" }, 401)
      )
      .mockResolvedValueOnce(response({ success: true, sessions: [] }));

    renderExchange();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Your session is invalid or expired."
    );
    expect(screen.getByRole("link", { name: "Log in" })).toHaveAttribute(
      "href",
      "/login"
    );
  });
});
