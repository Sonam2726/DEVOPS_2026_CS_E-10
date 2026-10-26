import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import "./ChatScreen.css";

const API_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  "http://localhost:5000/api";

const chatData = {
  ai: {
    name: "SkillBridge AI Tutor",
    skill: "AI-powered learning support",
    avatar: "AI",
    status: "Ready",
  },
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
  const isAiTutor = id === "ai";

  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState("");
  const [requiresLogin, setRequiresLogin] = useState(false);

  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([
    ...(isAiTutor
      ? [
          {
            id: 1,
            sender: "other",
            text: "Hi! I’m your SkillBridge AI Tutor. What would you like to learn?",
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]
      : [
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
        ]),
  ]);

  // Auto scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isTyping]);

  const sendMessage = async (event) => {
    event?.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage || isTyping) {
      return;
    }

    if (isAiTutor) {
      const token = localStorage.getItem("skillbridgeToken");
      if (!token || token === "demo-token") {
        setRequiresLogin(true);
        setError(
          token
            ? "Demo login cannot access the AI Tutor. Log in with a server account."
            : "Please log in to use the AI Tutor."
        );
        return;
      }
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

    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setMessage("");
    setError("");
    setRequiresLogin(false);

    if (isAiTutor) {
      setIsTyping(true);

      try {
        const token = localStorage.getItem("skillbridgeToken");
        const conversation = [...messages, newMessage]
          .slice(-20)
          .map((item) => ({
            role: item.sender === "me" ? "user" : "assistant",
            content: item.text,
          }));
        const response = await fetch(`${API_URL}/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ messages: conversation }),
        });
        const result = await response.json().catch(() => ({}));

        if (!response.ok || !result.success || typeof result.reply !== "string") {
          const unauthenticated = response.status === 401 || response.status === 403;
          setRequiresLogin(unauthenticated);
          setError(
            unauthenticated
              ? "Your login is invalid or expired. Please log in again."
              : result.message || "The AI Tutor could not respond. Please try again."
          );
          return;
        }

        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: Date.now() + 1,
            sender: "other",
            text: result.reply,
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]);
      } catch (requestError) {
        setError(
          requestError instanceof TypeError
            ? "Could not connect to the server. Please try again."
            : "The AI Tutor could not respond. Please try again."
        );
      } finally {
        setIsTyping(false);
      }

      return;
    }

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

      <div
        className="messages-container"
        role="log"
        aria-label="Conversation messages"
        aria-live="polite"
        aria-relevant="additions"
      >

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

              {isAiTutor && msg.sender === "other" ? (
                <div className="assistant-markdown">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              ) : (
                <p>{msg.text}</p>
              )}

              <span className="message-time">
                {msg.time}
              </span>

            </div>
          </div>
        ))}

        {/* Typing indicator */}

        {isTyping && (
          <div
            className="message-row message-left"
            role="status"
            aria-label={isAiTutor ? "AI Tutor is responding" : "User is typing"}
          >

            <div className="message-bubble their-message typing-bubble">

              <span className="typing-dot" aria-hidden="true"></span>
              <span className="typing-dot" aria-hidden="true"></span>
              <span className="typing-dot" aria-hidden="true"></span>

            </div>

          </div>
        )}

        <div ref={messagesEndRef}></div>

      </div>

      {/* =========================
          MESSAGE INPUT
      ========================= */}

      {error && (
        <div className="chat-error" role="alert">
          <span>{error}</span>
          {requiresLogin && <Link to="/login">Log in</Link>}
        </div>
      )}

      <form className="message-input-area" onSubmit={sendMessage}>
        <input
          type="text"
          aria-label={isAiTutor ? "Message the AI Tutor" : "Type a message"}
          placeholder={isAiTutor ? "Ask the AI Tutor..." : "Type a message..."}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={isAiTutor ? 2000 : 500}
          disabled={isTyping}
        />

        <button
          type="submit"
          disabled={!message.trim() || isTyping}
        >
          {isTyping ? "Thinking..." : "Send"}
        </button>
      </form>

    </div>
  );
}

export default ChatScreen;