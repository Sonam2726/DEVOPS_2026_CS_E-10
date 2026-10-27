import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import "./ChatScreen.css";
import ContextualNavigation from "../components/ContextualNavigation";

const API_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  "http://localhost:5000/api";
const AI_GREETING =
  "Hi! I’m your SkillBridge AI Tutor. What would you like to learn?";

const formatTime = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

function ChatScreen() {
  const { id } = useParams();
  const isAiTutor = id === "ai";
  const token = localStorage.getItem("skillbridgeToken");
  const currentUser = JSON.parse(localStorage.getItem("skillbridgeUser") || "null");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(
    isAiTutor
      ? [{ id: "ai-greeting", sender: "other", text: AI_GREETING, time: formatTime(new Date()) }]
      : []
  );
  const [participant, setParticipant] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(!isAiTutor);
  const [error, setError] = useState("");
  const [requiresLogin, setRequiresLogin] = useState(!token);
  const messagesEndRef = useRef(null);

  const loadMessages = useCallback(
    async (signal) => {
      if (isAiTutor || !token) return;
      const response = await fetch(`${API_URL}/conversations/${id}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
        signal,
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !Array.isArray(result.messages)) {
        throw new Error(result.message || "Unable to load this conversation.");
      }
      setMessages(
        result.messages.map((item) => ({
          id: item.id,
          sender: String(item.senderId) === String(currentUser?.id) ? "me" : "other",
          text: item.content,
          time: formatTime(item.createdAt),
          deliveredAt: item.deliveredAt,
          readAt: item.readAt,
        }))
      );
      setError("");
      await fetch(`${API_URL}/conversations/${id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        signal,
      });
    },
    [currentUser?.id, id, isAiTutor, token]
  );

  useEffect(() => {
    if (isAiTutor) return undefined;
    const controller = new AbortController();
    const load = async () => {
      try {
        await loadMessages(controller.signal);
        const conversationResponse = await fetch(`${API_URL}/conversations`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        const conversationResult = await conversationResponse.json().catch(() => ({}));
        const current = conversationResult.conversations?.find(
          (conversation) => String(conversation.id) === String(id)
        );
        setParticipant(current?.participant || null);
      } catch (loadError) {
        if (loadError.name !== "AbortError") {
          setError(loadError.message || "Could not connect to the server.");
          setRequiresLogin(loadError.message?.includes("token") || false);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    load();
    const poll = window.setInterval(
      () =>
        loadMessages(controller.signal).catch((pollError) => {
          if (pollError.name !== "AbortError") {
            setError("Connection lost. Retrying for new messages...");
          }
        }),
      4000
    );
    return () => {
      controller.abort();
      window.clearInterval(poll);
    };
  }, [id, isAiTutor, loadMessages, token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async (event) => {
    event?.preventDefault();
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isTyping) return;

    if (!token) {
      setRequiresLogin(true);
      setError(
        isAiTutor
          ? "Please log in to use the AI Tutor."
          : "Please log in to send messages."
      );
      return;
    }

    if (isAiTutor) {
      setIsTyping(true);
      setError("");
      const newMessage = {
        id: `local-${Date.now()}`,
        sender: "me",
        text: trimmedMessage,
        time: formatTime(new Date()),
      };
      setMessages((current) => [...current, newMessage]);
      setMessage("");
      try {
        const response = await fetch(`${API_URL}/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            messages: [...messages, newMessage].slice(-20).map((item) => ({
              role: item.sender === "me" ? "user" : "assistant",
              content: item.text,
            })),
          }),
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok || !result.success || typeof result.reply !== "string") {
          throw new Error(result.message || "The AI Tutor could not respond. Please try again.");
        }
        setMessages((current) => [
          ...current,
          { id: `ai-${Date.now()}`, sender: "other", text: result.reply, time: formatTime(new Date()) },
        ]);
      } catch (sendError) {
        setError(sendError.message || "The AI Tutor could not respond. Please try again.");
      } finally {
        setIsTyping(false);
      }
      return;
    }

    setIsTyping(true);
    setError("");
    try {
      const response = await fetch(`${API_URL}/conversations/${id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: trimmedMessage,
          clientMessageId: crypto.randomUUID(),
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.success || !result.message) {
        throw new Error(result.message || "Unable to send message.");
      }
      setMessages((current) => [
        ...current,
        {
          id: result.message.id,
          sender: "me",
          text: result.message.content,
          time: formatTime(result.message.createdAt),
          deliveredAt: result.message.deliveredAt,
          readAt: result.message.readAt,
        },
      ]);
      setMessage("");
    } catch (sendError) {
      setError(sendError.message || "Could not connect to the server.");
    } finally {
      setIsTyping(false);
    }
  };

  const personName = isAiTutor
    ? "SkillBridge AI Tutor"
    : participant?.name || "Conversation";
  const personAvatar = isAiTutor
    ? "AI"
    : personName
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();

  return (
    <main className="chat-screen">
      <ContextualNavigation
        label={isAiTutor ? "AI Tutor" : `Chat with ${personName}`}
        fallbackPath="/chat"
        fallbackLabel="Conversations"
      />
      <header className="chat-header">
        <div className="chat-avatar">{personAvatar || "?"}</div>
        <div className="chat-user-info">
          <h2>{personName}</h2>
          <p>{isAiTutor ? "Ready • AI-powered learning support" : "Human conversation"}</p>
        </div>
      </header>

      <div className="messages-container" role="log" aria-label="Conversation messages" aria-live="polite">
        {loading && <p role="status">Loading messages...</p>}
        {!loading && error && <div className="chat-error" role="alert">{error}</div>}
        {!loading && !error && messages.length === 0 && (
          <p className="chat-date">No messages yet. Start the conversation.</p>
        )}
        {messages.map((item) => (
          <div key={item.id} className={`message-row ${item.sender === "me" ? "message-right" : "message-left"}`}>
            <div className={`message-bubble ${item.sender === "me" ? "my-message" : "their-message"}`}>
              {isAiTutor && item.sender === "other" ? (
                <div className="assistant-markdown"><ReactMarkdown>{item.text}</ReactMarkdown></div>
              ) : (
                <p>{item.text}</p>
              )}
              <span className="message-time">
                {item.time}
                {item.sender === "me" && (
                  <small aria-label={item.readAt ? "Read" : item.deliveredAt ? "Delivered" : "Sent"}>
                    {" "}• {item.readAt ? "Read" : item.deliveredAt ? "Delivered" : "Sent"}
                  </small>
                )}
              </span>
            </div>
          </div>
        ))}
        {isTyping && <div className="message-row message-left" role="status"><div className="message-bubble their-message typing-bubble">...</div></div>}
        <div ref={messagesEndRef} />
      </div>

      {error && requiresLogin && <Link to="/login">Log in</Link>}
      <form className="message-input-area" onSubmit={sendMessage}>
        <input
          type="text"
          aria-label={isAiTutor ? "Message the AI Tutor" : "Type a message"}
          placeholder={isAiTutor ? "Ask the AI Tutor..." : "Type a message..."}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          maxLength={2000}
          disabled={loading || isTyping}
        />
        <button type="submit" disabled={!message.trim() || loading || isTyping}>
          {isTyping ? (isAiTutor ? "Thinking..." : "Sending...") : "Send"}
        </button>
      </form>
    </main>
  );
}

export default ChatScreen;
