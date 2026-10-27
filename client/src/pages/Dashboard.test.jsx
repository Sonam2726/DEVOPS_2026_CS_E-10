import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";

import Dashboard from "./Dashboard";

const renderDashboard = () =>
  render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  );

const response = (body, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
});

const dashboardData = {
  user: { name: "Test User" },
  statistics: {
    totalSkills: 3,
    requests: { accepted: 2 },
    sessions: { completed: 4 },
  },
  recentActivity: [
    {
      _id: "notification-1",
      type: "skill_request",
      title: "New learning request",
      message: "You received a request to learn JavaScript.",
      createdAt: "2026-10-25T12:00:00.000Z",
    },
  ],
};

describe("Dashboard page", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("skillbridgeToken", "test-jwt");
    localStorage.setItem(
      "skillbridgeUser",
      JSON.stringify({ name: "Test User" })
    );
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows loading state while the dashboard request is pending", () => {
    fetch.mockReturnValue(new Promise(() => {}));

    renderDashboard();

    expect(screen.getAllByRole("status")[0]).toHaveTextContent(
      "Loading your dashboard..."
    );
  });

  it("renders dashboard statistics and recent activity", async () => {
    fetch.mockResolvedValue(response({ success: true, data: dashboardData }));

    renderDashboard();

    expect(
      await screen.findByRole("heading", { name: "Welcome back, Test User" })
    ).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("New learning request")).toBeInTheDocument();
  });

  it("renders the empty recent-activity state", async () => {
    fetch.mockResolvedValue(
      response({
        success: true,
        data: { ...dashboardData, recentActivity: [] },
      })
    );

    renderDashboard();

    expect(await screen.findByText("No recent activity yet.")).toBeInTheDocument();
  });

  it("shows a login link for an unauthorized dashboard response", async () => {
    fetch.mockResolvedValue(
      response({ success: false, message: "Authentication required" }, 401)
    );

    renderDashboard();

    expect(
      await screen.findByText("Your session is invalid or expired. Please log in again.")
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Log in" })).toHaveAttribute(
      "href",
      "/login"
    );
  });

  it("shows a server error without rendering dashboard content", async () => {
    fetch.mockResolvedValue(
      response({ success: false, message: "Dashboard unavailable" }, 500)
    );

    renderDashboard();

    expect(await screen.findByText("Dashboard unavailable")).toBeInTheDocument();
    expect(screen.queryByText("Your progress")).toBeNull();
  });

  it("shows a network error when the dashboard request fails", async () => {
    fetch.mockRejectedValue(new TypeError("Network error"));

    renderDashboard();

    expect(
      await screen.findByText("Could not connect to the server. Please try again.")
    ).toBeInTheDocument();
  });

  it("does not fetch without a token", async () => {
    localStorage.removeItem("skillbridgeToken");

    renderDashboard();

    expect(
      await screen.findByText("Please log in to view your dashboard.")
    ).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });
});
