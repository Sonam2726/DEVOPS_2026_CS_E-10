import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Chat.css";

const initialConversations = [
  {
    id: 1,
    name: "Aarav Sharma",
    skill: "Java & OOP",
    message: "Sure, we can discuss Java today.",
    time: "10:30 AM",
    avatar: "AS",
    unread: 2,
  },
  {
    id: 2,
    name: "Priya Mehta",
    skill: "UI/UX Design",
    message: "I have shared the design resources.",
    time: "Yesterday",
    avatar: "PM",
    unread: 1,
  },
  {
    id: 3,
    name: "Rohan Verma",
    skill: "Python & SQL",
    message: "Thanks for the learning session!",
    time: "18 Sep",
    avatar: "RV",
    unread: 0,
  },
  {
    id: 4,
    name: "Sneha Patel",
    skill: "Java Development",
    message: "Let's schedule our next session.",
    time: "17 Sep",
    avatar: "SP",
    unread: 3,
  },
];

function Chat() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");

  // Load saved conversations
  const [conversations, setConversations] = useState(() => {
    const saved = localStorage.getItem("skillbridgeChats");

    return saved
      ? JSON.parse(saved)
      : initialConversations;
  });

  const filteredChats = conversations.filter((chat) => {
    const searchText = search.toLowerCase();

    return (
      chat.name.toLowerCase().includes(searchText) ||
      chat.skill.toLowerCase().includes(searchText) ||
      chat.message.toLowerCase().includes(searchText)
    );
  });

  // Open chat and remove unread count
  const openChat = (id) => {
    setConversations((prev) => {
      const updated = prev.map((chat) =>
        chat.id === id
          ? { ...chat, unread: 0 }
          : chat
      );

      localStorage.setItem(
        "skillbridgeChats",
        JSON.stringify(updated)
      );

      return updated;
    });

    navigate(`/chat/${id}`);
  };

  return (
    <div className="chat-page">

      {/* =========================
          HEADER
      ========================= */}

      <div className="chat-header">
        <span>SKILLBRIDGE CHAT</span>

        <h1>Your Conversations</h1>

        <p>
          Connect with your skill exchange partners and
          continue learning.
        </p>
      </div>

      {/* =========================
          CHAT CONTAINER
      ========================= */}

      <div className="chat-container">

        {/* SEARCH */}

        <div className="chat-search">

          <input
            type="text"
            placeholder="Search by name, skill or message..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {search && (
            <button
              className="clear-search"
              onClick={() => setSearch("")}
            >
              ×
            </button>
          )}

        </div>

        {/* SEARCH RESULT COUNT */}

        <div className="chat-result-count">
          {filteredChats.length}{" "}
          {filteredChats.length === 1
            ? "conversation"
            : "conversations"}
        </div>

        {/* CHAT LIST */}

        <div className="chat-list">

          {filteredChats.length > 0 ? (

            filteredChats.map((chat) => (

              <div
                className="chat-card"
                key={chat.id}
                onClick={() => openChat(chat.id)}
              >

                {/* AVATAR */}

                <div className="chat-avatar">
                  {chat.avatar}
                </div>

                {/* CHAT CONTENT */}

                <div className="chat-content">

                  <div className="chat-top">

                    <h3>{chat.name}</h3>

                    <span className="chat-time">
                      {chat.time}
                    </span>

                  </div>

                  <p className="chat-skill">
                    {chat.skill}
                  </p>

                  <p className="chat-message">
                    {chat.message}
                  </p>

                </div>

                {/* UNREAD */}

                {chat.unread > 0 && (
                  <span className="unread-badge">
                    {chat.unread}
                  </span>
                )}

              </div>

            ))

          ) : (

            <div className="no-chats">

              <div className="no-chat-icon">
                💬
              </div>

              <h3>
                No conversations found
              </h3>

              <p>
                Try searching for another person,
                skill or message.
              </p>

              <button
                onClick={() => setSearch("")}
              >
                Clear Search
              </button>

            </div>

          )}

        </div>

      </div>

    </div>
  );
}

export default Chat;