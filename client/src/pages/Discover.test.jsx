import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";

import Discover from "./Discover";

const firstSkill = {
  _id: "507f1f77bcf86cd799439011",
  name: "JavaScript Basics",
  description: "Learn the language",
  category: "Programming",
  level: "Beginner",
  owner: { name: "Mentor One" },
};
const secondSkill = {
  ...firstSkill,
  _id: "507f1f77bcf86cd799439012",
  name: "JavaScript Advanced",
};

const response = (body, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
});

const skillsPage = (page, data, totalPages = 2) => ({
  success: true,
  data,
  pagination: { page, limit: 10, total: totalPages * 10, totalPages },
});

describe("Discover pagination", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads additional skills and removes Load more at the final page", async () => {
    fetch
      .mockResolvedValueOnce(response(skillsPage(1, [firstSkill])))
      .mockResolvedValueOnce(response(skillsPage(2, [secondSkill])));

    render(
      <MemoryRouter>
        <Discover />
      </MemoryRouter>
    );

    expect(await screen.findByRole("heading", { name: "JavaScript Basics" }))
      .toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Load more skills" }));

    expect(
      await screen.findByRole("heading", { name: "JavaScript Advanced" })
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Load more skills/ })).toBeNull();
    expect(fetch).toHaveBeenLastCalledWith(
      "http://localhost:5000/api/skills?page=2&limit=10",
      expect.any(Object)
    );
  });

  it("sends name and category filters to the paginated skill-list endpoint", async () => {
    fetch.mockResolvedValue(response(skillsPage(1, [firstSkill], 1)));

    render(
      <MemoryRouter>
        <Discover />
      </MemoryRouter>
    );
    await screen.findByRole("heading", { name: "JavaScript Basics" });

    fireEvent.change(screen.getByPlaceholderText("Search Skills..."), {
      target: { value: "JavaScript" },
    });
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "Programming" },
    });

    expect(
      await screen.findByRole("heading", { name: "JavaScript Basics" })
    ).toBeInTheDocument();
    expect(fetch).toHaveBeenLastCalledWith(
      "http://localhost:5000/api/skills?page=1&limit=10&name=JavaScript&category=Programming",
      expect.any(Object)
    );
  });

  it("shows a later-page error and retries the same page", async () => {
    fetch
      .mockResolvedValueOnce(response(skillsPage(1, [firstSkill])))
      .mockResolvedValueOnce(
        response({ success: false, message: "Page unavailable" }, 503)
      )
      .mockResolvedValueOnce(response(skillsPage(2, [secondSkill])));

    render(
      <MemoryRouter>
        <Discover />
      </MemoryRouter>
    );
    fireEvent.click(
      await screen.findByRole("button", { name: "Load more skills" })
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Page unavailable"
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Retry loading more" })
    );

    expect(
      await screen.findByRole("heading", { name: "JavaScript Advanced" })
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Load more skills/ })).toBeNull();
  });
});
