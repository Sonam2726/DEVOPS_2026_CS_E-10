import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./ChatScreen.css";

const chatData = {
  1: {
    name: "Aarav Sharma",
    skill: "Java & OOP",
    avatar: "AS",
    status: "Online",
  },
  2: {
    name: "Priya Mehta",
    skill: "UI/UX Design",
    avatar: "PM",
    status: "Online",
  },
  3: {
    name: "Rohan Verma",
    skill: "Python & SQL",
    avatar: "RV",
    status: "Offline",
  },
};

function ChatScreen() {
  const { id } = useParams();
  const navigate = useNavigate();

  const person = chatData[id] || chatData[1];

  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "other",
      text: `Hi! I'm happy to help you with ${person.skill}.`,
      time: "6:10 PM",
    },
    {
      id: 2,
      sender: "me",
      text: "Thank you! When can we start?",
      time: "6:11 PM",
    },
    {
      id: 3,
      sender: "other",
      text: "We can start today. Does 6 PM work for you?",
      time: "6:12 PM",
    },
  ]);

  const sendMessage = () => {
    if (!message.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      sender: "me",
      text: message,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages([...messages, newMessage]);
    setMessage("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div className="chat-screen">

      {/* Header */}
      <div className="chat-header">

        <button
          className="back-button"
          onClick={() => navigate("/chat")}
        >
          ←
        </button>

        <div className="chat-avatar">
          {person.avatar}
        </div>

        <div className="chat-user-info">
          <h2>{person.name}</h2>
          <p>
            <span className="online-dot"></span>
            {person.status} • {person.skill}
          </p>
        </div>

      </div>

      {/* Messages */}
      <div className="messages-container">

        <div className="chat-date">
          Today
        </div>

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`message-row ${
              msg.sender === "me" ? "message-right" : "message-left"
            }`}
          >
            <div
              className={`message-bubble ${
                msg.sender === "me"
                  ? "my-message"
                  : "their-message"
              }`}
            >
              <p>{msg.text}</p>

              <span className="message-time">
                {msg.time}
              </span>
            </div>
          </div>
        ))}

      </div>

      {/* Input */}
      <div className="message-input-area">

        <input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <button onClick={sendMessage}>
          Send
        </button>

      </div>

    </div>
  );
}

export default ChatScreen;