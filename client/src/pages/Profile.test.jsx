import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";

import Profile from "./Profile";

const testProfile = {
  id: "profile-user-id",
  name: "Test User",
  email: "test@example.com",
  bio: "A real profile bio.",
  location: "Test City",
  skillsToTeach: [{ _id: "skill-1", name: "React" }],
  skillsToLearn: [{ _id: "skill-2", name: "Python" }],
};

const renderProfile = () =>
  render(
    <MemoryRouter>
      <Profile />
    </MemoryRouter>
  );

const jsonResponse = (body, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
});

describe("Profile page", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("skillbridgeToken", "test-jwt");
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads profile data and displays real profile skills", async () => {
    fetch.mockResolvedValue(
      jsonResponse({ success: true, data: { profile: testProfile } })
    );

    renderProfile();

    expect(
      await screen.findByRole("heading", { name: "Test User" })
    ).toBeInTheDocument();
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
    expect(screen.getByText("A real profile bio.")).toBeInTheDocument();
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("Python")).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:5000/api/users/profile",
      expect.objectContaining({
        headers: { Authorization: "Bearer test-jwt" },
      })
    );
  });

  it("shows empty states for profile fields and skills", async () => {
    fetch.mockResolvedValue(
      jsonResponse({
        success: true,
        data: {
          profile: {
            ...testProfile,
            bio: "",
            location: "",
            skillsToTeach: [],
            skillsToLearn: [],
          },
        },
      })
    );

    renderProfile();

    expect(
      await screen.findByText("No bio has been added yet.")
    ).toBeInTheDocument();
    expect(
      screen.getByText("No skills have been added to your profile yet.")
    ).toBeInTheDocument();
    expect(screen.getByText("Location not provided")).toBeInTheDocument();
  });

  it("saves bio edits through the profile update endpoint", async () => {
    fetch
      .mockResolvedValueOnce(
        jsonResponse({ success: true, data: { profile: testProfile } })
      )
      .mockResolvedValueOnce(
        jsonResponse({
          success: true,
          data: { profile: { ...testProfile, bio: "Updated bio." } },
        })
      );

    renderProfile();
    fireEvent.click(
      await screen.findByRole("button", { name: "Edit Profile" })
    );
    fireEvent.change(screen.getByRole("textbox", { name: "Profile bio" }), {
      target: { value: "Updated bio." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save Changes" }));

    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent(
        "Profile updated successfully."
      )
    );
    expect(screen.getByText("Updated bio.")).toBeInTheDocument();
    expect(fetch).toHaveBeenLastCalledWith(
      "http://localhost:5000/api/users/profile",
      expect.objectContaining({
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-jwt",
        },
        body: JSON.stringify({
          name: "Test User",
          email: "test@example.com",
          bio: "Updated bio.",
          location: "Test City",
        }),
      })
    );
  });

  it("provides a login link for an unauthorized profile request", async () => {
    fetch.mockResolvedValue(
      jsonResponse({ success: false, message: "Unauthorized" }, 401)
    );

    renderProfile();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Your session is invalid or expired."
    );
    expect(screen.getByRole("link", { name: "Log in" })).toHaveAttribute(
      "href",
      "/login"
    );
  });

  it("shows a server error when the profile cannot be loaded", async () => {
    fetch.mockResolvedValue(
      jsonResponse({ success: false, message: "Profile service unavailable" }, 500)
    );

    renderProfile();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Profile service unavailable"
    );
  });

  it("shows an error when the server response has no profile", async () => {
    fetch.mockResolvedValue(jsonResponse({ success: true, data: {} }));

    renderProfile();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "The server did not return profile data."
    );
  });

  it("shows a network error when the profile request fails", async () => {
    fetch.mockRejectedValue(new TypeError("Network request failed"));

    renderProfile();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Could not connect to the server."
    );
  });

  it("asks the user to log in when no token is stored", async () => {
    localStorage.removeItem("skillbridgeToken");
    renderProfile();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Please log in to view your profile."
    );
    expect(fetch).not.toHaveBeenCalled();
  });
});
