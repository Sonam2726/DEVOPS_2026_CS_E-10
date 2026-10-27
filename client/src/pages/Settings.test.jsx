import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import Settings from "./Settings";

const response = (body, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
});

const settings = {
  emailNotifications: true,
  pushNotifications: false,
  profileVisibility: "public",
};

describe("Settings page", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("skillbridgeToken", "test-jwt");
    localStorage.setItem(
      "skillbridgeUser",
      JSON.stringify({
        name: "Test User",
        email: "test@example.com",
        role: "student",
      })
    );
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads persisted preferences and saves them through the settings API", async () => {
    fetch
      .mockResolvedValueOnce(response({ success: true, data: { settings } }))
      .mockResolvedValueOnce(
        response({
          success: true,
          data: { settings: { ...settings, emailNotifications: false } },
        })
      );

    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>
    );

    expect(await screen.findByText("Settings")).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: "Toggle email notifications" })
    );
    fireEvent.click(screen.getByRole("button", { name: "Save preferences" }));

    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent(
        "Preferences saved successfully"
      )
    );
    expect(fetch).toHaveBeenLastCalledWith(
      "http://localhost:5000/api/settings",
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({
          emailNotifications: false,
          pushNotifications: false,
          profileVisibility: "public",
        }),
      })
    );
  });

  it("keeps the protected role read-only and reports save failures", async () => {
    fetch
      .mockResolvedValueOnce(response({ success: true, data: { settings } }))
      .mockResolvedValueOnce(
        response({ success: false, message: "Settings unavailable" }, 500)
      );

    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>
    );

    expect(await screen.findByDisplayValue("Student")).toHaveAttribute(
      "readonly"
    );
    fireEvent.click(screen.getByRole("button", { name: "Save preferences" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Settings unavailable"
    );
    expect(
      screen.queryByText("Preferences saved successfully")
    ).not.toBeInTheDocument();
  });
});
