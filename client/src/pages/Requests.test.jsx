import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";

import Requests from "./Requests";

const firstRequest = {
  _id: "507f1f77bcf86cd799439011",
  receiver: { _id: "507f1f77bcf86cd799439012", name: "Mentor One" },
  skillToLearn: "JavaScript",
  status: "pending",
  createdAt: "2026-10-25T12:00:00.000Z",
};
const secondRequest = {
  ...firstRequest,
  _id: "507f1f77bcf86cd799439013",
  skillToLearn: "Python",
};

const renderRequests = (initialEntries = ["/requests"]) =>
  render(
    <MemoryRouter initialEntries={initialEntries}>
      <Requests />
    </MemoryRouter>
  );

const response = (body, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
});

const pageResult = (page, outgoing, totalOutgoingPages = 2) => ({
  success: true,
  incoming: [],
  outgoing,
  pagination: {
    page,
    limit: 10,
    totalIncoming: 0,
    totalOutgoing: totalOutgoingPages * 10,
    totalIncomingPages: 0,
    totalOutgoingPages,
  },
});

describe("Requests pagination", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("skillbridgeToken", "test-jwt");
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads the next outgoing request page and stops at the API's final page", async () => {
    fetch
      .mockResolvedValueOnce(response(pageResult(1, [firstRequest])))
      .mockResolvedValueOnce(response(pageResult(2, [secondRequest])));

    renderRequests();

    expect(await screen.findByText("JavaScript")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Load more requests" }));

    expect(await screen.findByText("Python")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Load more requests/ })).toBeNull();
    expect(fetch).toHaveBeenLastCalledWith(
      "http://localhost:5000/api/requests?page=2&limit=10",
      expect.objectContaining({
        headers: { Authorization: "Bearer test-jwt" },
        signal: expect.any(AbortSignal),
      })
    );
  });

  it("shows a page error and allows retrying that page", async () => {
    fetch
      .mockResolvedValueOnce(response(pageResult(1, [firstRequest])))
      .mockResolvedValueOnce(
        response({ success: false, message: "Requests unavailable" }, 500)
      )
      .mockResolvedValueOnce(response(pageResult(2, [secondRequest])));

    renderRequests();
    fireEvent.click(
      await screen.findByRole("button", { name: "Load more requests" })
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Requests unavailable"
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Retry loading more" })
    );

    expect(await screen.findByText("Python")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Load more requests/ })).toBeNull();
  });

  it("opens the incoming request selected by a notification and accepts it", async () => {
    const incomingRequest = {
      ...firstRequest,
      _id: "request-1",
      sender: { _id: "sender-1", name: "Learner One" },
      receiver: { _id: "receiver-1", name: "Test User" },
      message: "I would like to learn JavaScript.",
    };

    fetch
      .mockResolvedValueOnce(
        response({
          ...pageResult(1, []),
          incoming: [incomingRequest],
          pagination: {
            ...pageResult(1, []).pagination,
            totalIncoming: 1,
            totalIncomingPages: 1,
          },
        })
      )
      .mockResolvedValueOnce(
        response({
          success: true,
          request: { ...incomingRequest, status: "accepted" },
        })
      );

    renderRequests(["/requests?type=incoming&requestId=request-1"]);

    expect(await screen.findByText("JavaScript")).toBeInTheDocument();
    expect(screen.getByText("From:")).toBeInTheDocument();
    expect(screen.getByText("Learner One")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Accept" })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reject" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Accept" }));

    expect(
      await screen.findByRole("button", { name: "Schedule Session" })
    ).toBeInTheDocument();
    expect(fetch).toHaveBeenLastCalledWith(
      "http://localhost:5000/api/requests/request-1/status",
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({ status: "accepted" }),
      })
    );
  });
});
