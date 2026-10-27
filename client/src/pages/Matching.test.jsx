import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import {
  MemoryRouter,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import "@testing-library/jest-dom";

import Matching from "./Matching";

const NavigationState = () => {
  const location = useLocation();

  return (
    <output data-testid="navigation-state">
      {JSON.stringify(location.state || null)}
    </output>
  );
};

const renderMatching = () =>
  render(
    <MemoryRouter initialEntries={["/matching"]}>
      <Routes>
        <Route path="/matching" element={<Matching />} />
        <Route
          path="/match-details/:id"
          element={<NavigationState />}
        />
      </Routes>
    </MemoryRouter>
  );

const response = (body, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
});

describe("Matching page", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("skillbridgeToken", "test-jwt");
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads recommended teachers from the authenticated matches API", async () => {
    fetch.mockResolvedValue(
      response({
        success: true,
        count: 1,
        matches: [
          {
            _id: "507f1f77bcf86cd799439011",
            name: "Recommended Mentor",
            bio: "Backend developer",
          },
        ],
      })
    );

    renderMatching();

    expect(
      await screen.findByRole("heading", { name: "Recommended Mentor" })
    ).toBeInTheDocument();
    expect(screen.getByText("Backend developer")).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:5000/api/matches/recommendations",
      expect.objectContaining({
        headers: { Authorization: "Bearer test-jwt" },
      })
    );
    expect(
      screen.getByText(/Learner recommendations are not provided/i)
    ).toBeInTheDocument();
  });

  it("shows an empty state when there are no recommendations", async () => {
    fetch.mockResolvedValue(response({ success: true, count: 0, matches: [] }));

    renderMatching();

    expect(
      await screen.findByText(/No recommended teachers found yet/i)
    ).toBeInTheDocument();
  });

  it("shows a login link when recommendations require authentication", async () => {
    fetch.mockResolvedValue(
      response({ success: false, message: "Authentication required" }, 401)
    );

    renderMatching();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Your session is invalid or expired."
    );
    expect(screen.getByRole("link", { name: "Log in" })).toHaveAttribute(
      "href",
      "/login"
    );
  });

  it("shows a network error when recommendations cannot be fetched", async () => {
    fetch.mockRejectedValue(new TypeError("Network error"));

    renderMatching();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Could not connect to the server."
    );
  });

  it("navigates to match details without connection intent from View Profile", async () => {
    fetch.mockResolvedValue(
      response({
        success: true,
        count: 1,
        matches: [{ _id: "507f1f77bcf86cd799439011", name: "Recommended Mentor" }],
      })
    );

    renderMatching();

    fireEvent.click(
      await screen.findByRole("button", { name: "View Profile" })
    );

    expect(screen.getByTestId("navigation-state")).toHaveTextContent("null");
  });

  it("navigates to match details with connection intent from Connect", async () => {
    fetch.mockResolvedValue(
      response({
        success: true,
        count: 1,
        matches: [{ _id: "507f1f77bcf86cd799439011", name: "Recommended Mentor" }],
      })
    );

    renderMatching();

    fireEvent.click(await screen.findByRole("button", { name: "Connect" }));

    expect(screen.getByTestId("navigation-state")).toHaveTextContent(
      JSON.stringify({ focusRequestForm: true })
    );
  });
});
