import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import "@testing-library/jest-dom";
import ChatScreen from "./ChatScreen";

const renderConversation = () =>
  render(
    <MemoryRouter initialEntries={["/chat/conversation-1"]}>
      <Routes>
        <Route path="/chat/:id" element={<ChatScreen />} />
      </Routes>
    </MemoryRouter>
  );

describe("human conversation chat", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("skillbridgeToken", "test-jwt");
    localStorage.setItem(
      "skillbridgeUser",
      JSON.stringify({ id: "user-1", name: "Current User" })
    );
    vi.stubGlobal("fetch", vi.fn((url, options) => {
      if (url.endsWith("/messages") && options?.method === "POST") {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            message: {
              id: "message-2",
              senderId: "user-1",
              content: "Hello there",
              createdAt: "2026-10-27T12:00:00.000Z",
            },
          }),
        });
      }
      if (url.endsWith("/read")) {
        return Promise.resolve({ ok: true, json: async () => ({ success: true }) });
      }
      if (url.endsWith("/conversations")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            conversations: [
              { id: "conversation-1", participant: { name: "Other User" } },
            ],
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({
          success: true,
          messages: [
            {
              id: "message-1",
              senderId: "other-user",
              content: "Welcome",
              createdAt: "2026-10-27T11:59:00.000Z",
              deliveredAt: "2026-10-27T11:59:01.000Z",
            },
          ],
        }),
      });
    }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads persisted history and sends a human message to the conversation API", async () => {
    renderConversation();

    expect(await screen.findByText("Welcome")).toBeInTheDocument();
    fireEvent.change(screen.getByRole("textbox", { name: "Type a message" }), {
      target: { value: "Hello there" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    expect(await screen.findByText("Hello there")).toBeInTheDocument();
    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/conversations/conversation-1/messages"),
        expect.objectContaining({ method: "POST" })
      )
    );
    expect(fetch.mock.calls.some(([, options]) =>
      options?.method === "POST" &&
      JSON.parse(options.body).content === "Hello there"
    )).toBe(true);
  });
});
