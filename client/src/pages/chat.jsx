import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Chat.css";

const conversations = [
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

  const filteredChats = conversations.filter((chat) =>
    chat.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="chat-page">

      <div className="chat-header">
        <span>SKILLBRIDGE CHAT</span>

        <h1>Your Conversations</h1>

        <p>
          Connect with your skill exchange partners and continue learning.
        </p>
      </div>

      <div className="chat-container">

        <div className="chat-search">
          <input
            type="text"
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="chat-list">

          {filteredChats.length > 0 ? (
            filteredChats.map((chat) => (

              <div
                className="chat-card"
                key={chat.id}
                onClick={() => navigate(`/chat/${chat.id}`)}
              >

                <div className="chat-avatar">
                  {chat.avatar}
                </div>

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

                {chat.unread > 0 && (
                  <span className="unread-badge">
                    {chat.unread}
                  </span>
                )}

              </div>

            ))
          ) : (
            <div className="no-chats">
              <h3>No conversations found</h3>
              <p>Try searching for another person.</p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}

export default Chat;