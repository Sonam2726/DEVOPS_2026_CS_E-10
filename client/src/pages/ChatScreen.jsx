import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./ChatScreen.css";

const users = {
  1: {
    name: "Aarav Sharma",
    skill: "Java & OOP",
    avatar: "AS",
  },
  2: {
    name: "Priya Mehta",
    skill: "UI/UX Design",
    avatar: "PM",
  },
  3: {
    name: "Rohan Verma",
    skill: "Python & SQL",
    avatar: "RV",
  },
  4: {
    name: "Sneha Patel",
    skill: "Java Development",
    avatar: "SP",
  },
};

function ChatScreen() {
  const { id } = useParams();
  const navigate = useNavigate();

  const user = users[id] || users[1];

  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "other",
      text: `Hi! I'm ${user.name}. Ready for our skill exchange?`,
      time: "10:25 AM",
    },
    {
      id: 2,
      sender: "me",
      text: "Yes! I'm ready. Looking forward to learning together.",
      time: "10:27 AM",
    },
    {
      id: 3,
      sender: "other",
      text: "Great! We can start with the basics.",
      time: "10:28 AM",
    },
  ]);

  const sendMessage = () => {
    if (!message.trim()) return;

    const newMessage = {
      id: Date.now(),
      sender: "me",
      text: message.trim(),
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((previousMessages) => [
      ...previousMessages,
      newMessage,
    ]);

    setMessage("");
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div className="chat-screen">

      {/* =========================
          CHAT HEADER
      ========================= */}

      <div className="chat-screen-header">

        <button
          className="chat-back-button"
          onClick={() => navigate("/chat")}
        >
          ←
        </button>

        <div className="chat-screen-avatar">
          {user.avatar}
        </div>

        <div className="chat-user-details">
          <h2>{user.name}</h2>
          <p>{user.skill}</p>
        </div>

        <div className="online-indicator">
          <span>●</span> Online
        </div>

      </div>


      {/* =========================
          MESSAGES
      ========================= */}

      <div className="chat-messages">

        {messages.map((item) => (

          <div
            key={item.id}
            className={
              item.sender === "me"
                ? "message-wrapper my-message"
                : "message-wrapper"
            }
          >

            <div className="message-bubble">
              <p>{item.text}</p>

              <span>
                {item.time}
              </span>
            </div>

          </div>

        ))}

      </div>


      {/* =========================
          MESSAGE INPUT
      ========================= */}

      <div className="chat-input-container">

        <input
          type="text"
          placeholder="Type your message..."
          value={message}
          onChange={(event) =>
            setMessage(event.target.value)
          }
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