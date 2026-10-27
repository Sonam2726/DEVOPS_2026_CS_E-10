import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";

import Search from "./Search";

const firstSkill = {
  _id: "507f1f77bcf86cd799439011",
  name: "JavaScript Basics",
  description: "Learn the language",
  category: "Programming",
  level: "Beginner",
};
const secondSkill = {
  ...firstSkill,
  _id: "507f1f77bcf86cd799439012",
  name: "JavaScript Advanced",
  level: "Advanced",
};

const renderSearch = () =>
  render(
    <MemoryRouter>
      <Search />
    </MemoryRouter>
  );

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

describe("Search pagination", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads the next API page and hides Load more on the final page", async () => {
    fetch
      .mockResolvedValueOnce(response(skillsPage(1, [firstSkill])))
      .mockResolvedValueOnce(response(skillsPage(2, [secondSkill])));

    renderSearch();

    expect(await screen.findByRole("heading", { name: "JavaScript Basics" }))
      .toBeInTheDocument();
    expect(fetch).toHaveBeenNthCalledWith(
      1,
      "http://localhost:5000/api/skills?page=1&limit=10",
      expect.any(Object)
    );

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

  it("sends active search/category/level filters to the paginated listing API", async () => {
    fetch.mockResolvedValue(response(skillsPage(1, [firstSkill], 1)));

    renderSearch();
    await screen.findByRole("heading", { name: "JavaScript Basics" });

    fireEvent.change(screen.getByPlaceholderText("Search for a skill..."), {
      target: { value: "JavaScript" },
    });
    fireEvent.change(screen.getByLabelText("Category"), {
      target: { value: "Programming" },
    });
    fireEvent.change(screen.getByLabelText("Level"), {
      target: { value: "Beginner" },
    });

    expect(
      await screen.findByRole("heading", { name: "JavaScript Basics" })
    ).toBeInTheDocument();
    expect(fetch).toHaveBeenLastCalledWith(
      "http://localhost:5000/api/skills?page=1&limit=10&name=JavaScript&category=Programming&level=Beginner",
      expect.any(Object)
    );
  });

  it("shows an API error when a later skill page fails and allows retry", async () => {
    fetch
      .mockResolvedValueOnce(response(skillsPage(1, [firstSkill])))
      .mockResolvedValueOnce(
        response({ success: false, message: "Skills unavailable" }, 500)
      )
      .mockResolvedValueOnce(response(skillsPage(2, [secondSkill])));

    renderSearch();
    fireEvent.click(
      await screen.findByRole("button", { name: "Load more skills" })
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Skills unavailable"
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
