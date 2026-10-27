import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import "@testing-library/jest-dom";

import MatchDetails from "./MatchDetails";

const userId = "507f1f77bcf86cd799439011";
const skillId = "507f1f77bcf86cd799439012";
const matchUser = {
  _id: userId,
  name: "Recommended Mentor",
  bio: "I teach backend development.",
  location: "Test City",
  skillsToTeach: [skillId],
};

const renderMatchDetails = (state) =>
  render(
    <MemoryRouter
      initialEntries={[
        { pathname: `/match-details/${userId}`, state },
      ]}
    >
      <Routes>
        <Route path="/match-details/:id" element={<MatchDetails />} />
      </Routes>
    </MemoryRouter>
  );

const response = (body, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
});

describe("Match details page", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("skillbridgeToken", "test-jwt");
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  const mockMatchAndSkill = () => {
    fetch
      .mockResolvedValueOnce(response({ success: true, user: matchUser }))
      .mockResolvedValueOnce(
        response({
          success: true,
          data: {
            _id: skillId,
            name: "Node.js",
            owner: { _id: userId, name: matchUser.name },
          },
        })
      );
  };

  it("loads match and teaching skill data from the existing APIs", async () => {
    mockMatchAndSkill();

    renderMatchDetails();

    expect(
      await screen.findByRole("heading", { name: "Recommended Mentor" })
    ).toBeInTheDocument();
    expect(screen.getByText("I teach backend development.")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Node.js" })).toBeInTheDocument();
    expect(fetch).toHaveBeenNthCalledWith(
      1,
      `http://localhost:5000/api/matches/${userId}`,
      expect.objectContaining({
        headers: { Authorization: "Bearer test-jwt" },
      })
    );
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      `http://localhost:5000/api/skills/${skillId}`,
      expect.any(Object)
    );
  });

  it("focuses and scrolls to the request form when connection intent is present", async () => {
    mockMatchAndSkill();
    const focus = vi.spyOn(HTMLElement.prototype, "focus");
    const scrollIntoView = vi.fn();
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: scrollIntoView,
    });

    renderMatchDetails({ focusRequestForm: true });

    const requestCard = await screen.findByRole("region", {
      name: "Learn from Recommended",
    });

    await waitFor(() => {
      expect(requestCard).toHaveFocus();
      expect(focus).toHaveBeenCalledWith({ preventScroll: true });
      expect(scrollIntoView).toHaveBeenCalledWith({
        behavior: "smooth",
        block: "center",
      });
    });
  });

  it("submits a learning request using the backend request contract", async () => {
    mockMatchAndSkill();
    fetch.mockResolvedValueOnce(
      response({
        success: true,
        request: { _id: "request-id", skillToLearn: "Node.js" },
      }, 201)
    );

    renderMatchDetails();

    fireEvent.change(
      await screen.findByRole("textbox", { name: "Optional message" }),
      { target: { value: "I'd like to learn Node.js." } }
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Send Learning Request" })
    );

    expect(
      await screen.findByRole("heading", { name: "Request Sent" })
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:5000/api/requests",
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer test-jwt",
          },
          body: JSON.stringify({
            receiverId: userId,
            skillToLearn: "Node.js",
            message: "I'd like to learn Node.js.",
          }),
        })
      )
    );
  });

  it("shows a login link when match details are unauthorized", async () => {
    fetch.mockResolvedValue(
      response({ success: false, message: "Unauthorized" }, 401)
    );

    renderMatchDetails();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Your session is invalid or expired."
    );
    expect(screen.getByRole("link", { name: "Log in" })).toHaveAttribute(
      "href",
      "/login"
    );
  });

  it("shows an error when the match details API fails", async () => {
    fetch.mockResolvedValue(
      response({ success: false, message: "Match unavailable" }, 500)
    );

    renderMatchDetails();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Match unavailable"
    );
  });

  it("shows a backend conflict when a learning request cannot be sent", async () => {
    mockMatchAndSkill();
    fetch.mockResolvedValueOnce(
      response(
        { success: false, message: "A pending request for this skill already exists" },
        409
      )
    );

    renderMatchDetails();

    fireEvent.click(
      await screen.findByRole("button", { name: "Send Learning Request" })
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "A pending request for this skill already exists"
    );
  });

  it("shows a network error when the learning request cannot be sent", async () => {
    mockMatchAndSkill();
    fetch.mockRejectedValueOnce(new TypeError("Network error"));

    renderMatchDetails();

    fireEvent.click(
      await screen.findByRole("button", { name: "Send Learning Request" })
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Could not connect to the server."
    );
  });
});
