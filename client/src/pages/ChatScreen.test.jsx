import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import "@testing-library/jest-dom";

import ChatScreen from "./ChatScreen";

const renderAiTutor = () =>
  render(
    <MemoryRouter initialEntries={["/chat/ai"]}>
      <Routes>
        <Route path="/chat/:id" element={<ChatScreen />} />
      </Routes>
    </MemoryRouter>
  );

describe("AI Tutor chat", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("skillbridgeToken", "test-jwt");
    vi.stubGlobal("fetch", vi.fn());
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: vi.fn(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete HTMLElement.prototype.scrollIntoView;
  });

  it("sends authenticated conversation history and renders the AI reply", async () => {
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, reply: "Recursion is a function calling itself." }),
    });
    renderAiTutor();

    fireEvent.change(screen.getByRole("textbox", { name: /message the ai tutor/i }), {
      target: { value: "Explain recursion" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    const [url, options] = fetch.mock.calls[0];
    expect(url).toMatch(/\/api\/chat$/);
    expect(options.headers.Authorization).toBe("Bearer test-jwt");
    expect(JSON.parse(options.body)).toEqual({
      messages: [
        {
          role: "assistant",
          content: "Hi! I’m your SkillBridge AI Tutor. What would you like to learn?",
        },
        { role: "user", content: "Explain recursion" },
      ],
    });
    expect(await screen.findByText("Recursion is a function calling itself.")).toBeInTheDocument();
  });

  it("renders assistant Markdown including headings, emphasis, lists, and code", async () => {
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        reply: [
          "## Python example",
          "",
          "**Important**: keep the indentation.",
          "",
          "1. Define a function",
          "2. Return a value",
          "",
          "- Use `def`",
          "- Keep the body indented",
          "",
          "```python",
          "def greet(name):",
          "    if name:",
          "        return f\"Hello, {name}\"",
          "```",
        ].join("\n"),
      }),
    });
    const { container } = renderAiTutor();

    fireEvent.change(screen.getByRole("textbox", { name: /message the ai tutor/i }), {
      target: { value: "Show me a Python example" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    expect(await screen.findByRole("heading", { name: "Python example" })).toBeInTheDocument();
    expect(container.querySelector(".assistant-markdown strong")).toHaveTextContent("Important");
    expect(container.querySelector(".assistant-markdown ol")).toBeInTheDocument();
    expect(container.querySelector(".assistant-markdown ul")).toBeInTheDocument();
    expect(container.querySelector(".assistant-markdown :not(pre) > code")).toHaveTextContent("def");
    expect(container.querySelector(".assistant-markdown pre code").textContent).toBe(
      'def greet(name):\n    if name:\n        return f"Hello, {name}"\n'
    );
  });

  it("does not interpret user messages as Markdown or execute raw HTML in AI replies", async () => {
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        reply: '<img src=x onerror="alert(1)">',
      }),
    });
    const { container } = renderAiTutor();
    const userText = "**this is not bold**";

    fireEvent.change(screen.getByRole("textbox", { name: /message the ai tutor/i }), {
      target: { value: userText },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    await screen.findByText(userText);
    expect(container.querySelector(".my-message strong")).not.toBeInTheDocument();
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(container.querySelector(".assistant-markdown")).toBeInTheDocument());
    expect(container.querySelector(".assistant-markdown img")).not.toBeInTheDocument();
  });

  it("does not submit an empty message", () => {
    renderAiTutor();

    expect(screen.getByRole("button", { name: "Send" })).toBeDisabled();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("shows a server error when the AI request fails", async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({
        success: false,
        message: "The AI Tutor is not configured.",
      }),
    });
    renderAiTutor();

    fireEvent.change(screen.getByRole("textbox", { name: /message the ai tutor/i }), {
      target: { value: "Help me learn Java" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "The AI Tutor is not configured."
    );
  });

  it("requires a server account before sending", async () => {
    localStorage.removeItem("skillbridgeToken");
    renderAiTutor();

    fireEvent.change(screen.getByRole("textbox", { name: /message the ai tutor/i }), {
      target: { value: "Help me learn Java" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Please log in to use the AI Tutor."
    );
    expect(screen.getByRole("link", { name: "Log in" })).toHaveAttribute("href", "/login");
    expect(fetch).not.toHaveBeenCalled();
  });
});
