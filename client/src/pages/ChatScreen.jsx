import React, { useEffect, useRef, useState } from "react";
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
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);

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

  // Auto scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isTyping]);

  // Send message
  const sendMessage = () => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      return;
    }

    const newMessage = {
      id: Date.now(),
      sender: "me",
      text: trimmedMessage,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prevMessages) => [
      ...prevMessages,
      newMessage,
    ]);

    setMessage("");

    // Demo typing response
    if (person.status === "Online") {
      setIsTyping(true);

      setTimeout(() => {
        setIsTyping(false);

        const reply = {
          id: Date.now() + 1,
          sender: "other",
          text: "Sure! That sounds great. 👍",
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };

        setMessages((prevMessages) => [
          ...prevMessages,
          reply,
        ]);
      }, 1200);
    }
  };

  // Enter = send
  // Shift + Enter = new line
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chat-screen">

      {/* =========================
          CHAT HEADER
      ========================= */}

      <div className="chat-header">

        <button
          className="back-button"
          onClick={() => navigate("/chat")}
          aria-label="Go back"
        >
          ←
        </button>

        <div className="chat-avatar">
          {person.avatar}
        </div>

        <div className="chat-user-info">
          <h2>{person.name}</h2>

          <p>
            {person.status === "Online" && (
              <span className="online-dot"></span>
            )}

            {person.status} • {person.skill}
          </p>
        </div>

      </div>

      {/* =========================
          MESSAGES
      ========================= */}

      <div className="messages-container">

        <div className="chat-date">
          Today
        </div>

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`message-row ${
              msg.sender === "me"
                ? "message-right"
                : "message-left"
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

        {/* Typing indicator */}

        {isTyping && (
          <div className="message-row message-left">

            <div className="message-bubble their-message typing-bubble">

              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>

            </div>

          </div>
        )}

        <div ref={messagesEndRef}></div>

      </div>

      {/* =========================
          MESSAGE INPUT
      ========================= */}

      <div className="message-input-area">

        <input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={500}
        />

        <button
          onClick={sendMessage}
          disabled={!message.trim()}
        >
          Send
        </button>

      </div>

    </div>
  );
}

export default ChatScreen;