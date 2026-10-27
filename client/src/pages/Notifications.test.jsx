import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import "@testing-library/jest-dom";

import Notifications from "./Notifications";

const LocationDisplay = () => {
  const location = useLocation();
  return <output data-testid="location">{location.pathname}{location.search}</output>;
};

const renderNotifications = () =>
  render(
    <MemoryRouter>
      <Notifications />
      <LocationDisplay />
    </MemoryRouter>
  );

const response = (body, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
});

const notification = {
  _id: "notification-1",
  type: "skill_request",
  request: "request-1",
  title: "New learning request",
  message: "You received a request to learn JavaScript.",
  isRead: false,
  createdAt: "2026-10-25T12:00:00.000Z",
};

describe("Notifications page", () => {
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

  it("shows loading state while notifications are being fetched", () => {
    fetch.mockReturnValue(new Promise(() => {}));

    renderNotifications();

    expect(screen.getByText("Loading notifications")).toBeInTheDocument();
  });

  it("renders notifications and marks an unread notification as read", async () => {
    fetch
      .mockResolvedValueOnce(
        response({
          success: true,
          data: { notifications: [notification] },
        })
      )
      .mockResolvedValueOnce(
        response({
          success: true,
          data: { notification: { ...notification, isRead: true } },
        })
      );

    renderNotifications();

    expect(await screen.findByText("New learning request")).toBeInTheDocument();
    expect(screen.getByText("1 unread")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Mark as read" }));

    expect(
      await screen.findByText("All caught up")
    ).toBeInTheDocument();
    expect(fetch).toHaveBeenLastCalledWith(
      "http://localhost:5000/api/notifications/notification-1/read",
      expect.objectContaining({
        method: "PUT",
        headers: {
          Authorization: expect.stringMatching(/^Bearer /),
        },
      })
    );
  });

  it("opens a learning request without marking the notification as read", async () => {
    fetch.mockResolvedValue(
      response({
        success: true,
        data: { notifications: [notification] },
      })
    );

    renderNotifications();

    expect(await screen.findByText("New learning request")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "View Request" }));

    expect(screen.getByTestId("location")).toHaveTextContent(
      "/requests?type=incoming&requestId=request-1"
    );
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Mark as read" })).toBeInTheDocument();
  });

  it("renders the empty state when there are no notifications", async () => {
    fetch.mockResolvedValue(
      response({ success: true, data: { notifications: [] } })
    );

    renderNotifications();

    expect(await screen.findByText("No notifications")).toBeInTheDocument();
    expect(screen.getByText("All caught up")).toBeInTheDocument();
  });

  it("shows the retryable error state for an unauthorized response", async () => {
    fetch.mockResolvedValue(
      response({ success: false, message: "Authentication required" }, 401)
    );

    renderNotifications();

    expect(
      await screen.findByText("Unable to load notifications")
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
  });

  it("shows the server error and retries loading", async () => {
    fetch
      .mockResolvedValueOnce(
        response({ success: false, message: "Notifications unavailable" }, 500)
      )
      .mockResolvedValueOnce(
        response({ success: true, data: { notifications: [] } })
      );

    renderNotifications();

    expect(
      await screen.findByText("Unable to load notifications")
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(await screen.findByText("No notifications")).toBeInTheDocument();
  });

  it("shows a network error when notifications cannot be fetched", async () => {
    fetch.mockRejectedValue(new TypeError("Network error"));

    renderNotifications();

    expect(
      await screen.findByRole("heading", {
        name: "Unable to load notifications",
      })
    ).toBeInTheDocument();
  });

  it("does not fetch without a token", async () => {
    localStorage.removeItem("skillbridgeToken");

    renderNotifications();

    expect(
      await screen.findByRole("heading", {
        name: "Unable to load notifications",
      })
    ).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });
});
