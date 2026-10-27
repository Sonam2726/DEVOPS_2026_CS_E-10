import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import MySkills from "./MySkills";

describe("My Skills page", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("skillbridgeToken", "tashu-token");
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            data: [
              {
                _id: "skill-1",
                name: "Python",
                category: "Programming",
                level: "Advanced",
                description: "Python mentoring",
              },
            ],
          }),
        })
      )
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders the authenticated user's published skills and publish action", async () => {
    render(
      <MemoryRouter>
        <MySkills />
      </MemoryRouter>
    );

    expect(await screen.findByRole("heading", { name: "Python" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Add Skill" })).toHaveAttribute(
      "href",
      "/offer-skill"
    );
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:5000/api/skills/mine",
      expect.objectContaining({
        headers: { Authorization: "Bearer tashu-token" },
      })
    );
  });
});
