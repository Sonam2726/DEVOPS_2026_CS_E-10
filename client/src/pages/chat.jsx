import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import "./chat.css";

const API_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  "http://localhost:5000/api";

const aiTutorConversation = {
  id: "ai",
  name: "SkillBridge AI Tutor",
  skill: "AI-powered learning support",
  message: "Ask a question about a skill you are learning.",
  time: "Available now",
  avatar: "AI",
  unreadCount: 0,
};

const getInitials = (name = "") =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "?";

const formatTime = (value) => {
  if (!value) return "No messages yet";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : date.toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
};

function Chat() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const loadConversations = async () => {
      const token = localStorage.getItem("skillbridgeToken");
      if (!token) {
        setError("Please log in to view your conversations.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/conversations`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok || !Array.isArray(result.conversations)) {
          throw new Error(result.message || "Unable to load conversations.");
        }
        setConversations(result.conversations);

        const participantId = searchParams.get("participantId");
        if (participantId) {
          const createResponse = await fetch(`${API_URL}/conversations`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ participantId }),
            signal: controller.signal,
          });
          const createResult = await createResponse.json().catch(() => ({}));
          if (!createResponse.ok || !createResult.conversation?.id) {
            throw new Error(
              createResult.message || "Unable to start this conversation."
            );
          }
          navigate(`/chat/${createResult.conversation.id}`, { replace: true });
        }
      } catch (loadError) {
        if (loadError.name !== "AbortError") {
          setError(loadError.message || "Could not connect to the server.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    loadConversations();
    return () => controller.abort();
  }, [navigate, searchParams]);

  const filteredChats = useMemo(() => {
    const chats = [
      aiTutorConversation,
      ...conversations.map((conversation) => ({
        ...conversation,
        name: conversation.participant?.name || "SkillBridge member",
        skill: "Skill exchange connection",
        message:
          conversation.lastMessage?.content || "Start your conversation.",
        time: formatTime(
          conversation.lastMessage?.createdAt || conversation.updatedAt
        ),
        avatar: getInitials(conversation.participant?.name),
        unread: conversation.unreadCount,
      })),
    ];
    const searchText = search.toLowerCase();
    return chats.filter(
      (chat) =>
        chat.name.toLowerCase().includes(searchText) ||
        chat.skill.toLowerCase().includes(searchText) ||
        chat.message.toLowerCase().includes(searchText)
    );
  }, [conversations, search]);

  const openChat = (id) => navigate(`/chat/${id}`);

  return (
    <main className="chat-page">
      <header className="chat-header">
        <span>SKILLBRIDGE CHAT</span>
        <h1>Your Conversations</h1>
        <p>Connect with your skill exchange partners and continue learning.</p>
      </header>

      <section className="chat-container">
        <div className="chat-search">
          <input
            type="text"
            placeholder="Search by name, skill or message..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search conversations"
          />
          {search && (
            <button className="clear-search" onClick={() => setSearch("")}>
              ×
            </button>
          )}
        </div>

        {loading && <p role="status">Loading conversations...</p>}
        {!loading && error && (
          <div className="no-chats" role="alert">
            <h3>Unable to load conversations</h3>
            <p>{error}</p>
            <Link to="/login">Log in</Link>
          </div>
        )}
        {!loading && !error && (
          <>
            <div className="chat-result-count">
              {filteredChats.length}{" "}
              {filteredChats.length === 1 ? "conversation" : "conversations"}
            </div>
            <div className="chat-list">
              {filteredChats.length > 0 ? (
                filteredChats.map((chat) => (
                  <div
                    className="chat-card"
                    key={chat.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`Open ${chat.name} conversation`}
                    onClick={() => openChat(chat.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        openChat(chat.id);
                      }
                    }}
                  >
                    <div className="chat-avatar">{chat.avatar}</div>
                    <div className="chat-content">
                      <div className="chat-top">
                        <h3>{chat.name}</h3>
                        <span className="chat-time">{chat.time}</span>
                      </div>
                      <p className="chat-skill">{chat.skill}</p>
                      <p className="chat-message">{chat.message}</p>
                    </div>
                    {chat.unread > 0 && (
                      <span className="unread-badge">{chat.unread}</span>
                    )}
                  </div>
                ))
              ) : (
                <div className="no-chats">
                  <h3>No conversations found</h3>
                  <p>Try searching for another person, skill or message.</p>
                  <button onClick={() => setSearch("")}>Clear Search</button>
                </div>
              )}
            </div>
          </>
        )}
      </section>
    </main>
  );
}

export default Chat;
