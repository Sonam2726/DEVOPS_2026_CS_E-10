import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { describe, expect, it } from "vitest";

import ContextualNavigation from "./ContextualNavigation";
import Sidebar from "./Sidebar";

describe("workspace navigation", () => {
  it("highlights Conversations on a conversation detail route", () => {
    localStorage.setItem(
      "skillbridgeUser",
      JSON.stringify({ name: "Test User" })
    );

    render(
      <MemoryRouter initialEntries={["/chat/conversation-1"]}>
        <Routes>
          <Route
            path="*"
            element={<Sidebar isOpen={false} onClose={() => {}} />}
          />
        </Routes>
      </MemoryRouter>
    );

    expect(
      screen.getByRole("link", { name: /Conversations/i }).className
    ).toContain("active");
  });

  it("uses the parent workspace route when no previous location exists", () => {
    render(
      <MemoryRouter initialEntries={["/skill/skill-1"]}>
        <ContextualNavigation
          label="Skill Details"
          fallbackPath="/discover"
          fallbackLabel="Discover Skills"
        />
      </MemoryRouter>
    );

    expect(
      screen.getByRole("link", { name: "Discover Skills" }).getAttribute("href")
    ).toBe("/discover");
  });
});
