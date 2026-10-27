
const MAX_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 2000;
const OLLAMA_BASE_URL = (
  process.env.OLLAMA_URL || "http://localhost:11434"
).replace(/\/$/, "");

exports.sendChatMessage = async (req, res) => {
  const { messages } = req.body || {};

  if (
    !Array.isArray(messages) ||
    messages.length === 0 ||
    messages.length > MAX_MESSAGES
  ) {
    return res.status(400).json({
      success: false,
      message: `Provide between 1 and ${MAX_MESSAGES} chat messages`,
    });
  }

  const validMessages = messages.every(
    (message) =>
      message &&
      ["user", "assistant"].includes(message.role) &&
      typeof message.content === "string" &&
      message.content.trim().length > 0 &&
      message.content.length <= MAX_MESSAGE_LENGTH
  );

  if (!validMessages || messages[messages.length - 1].role !== "user") {
    return res.status(400).json({
      success: false,
      message: "Chat messages must be valid and end with a user message",
    });
  }

  try {
    console.log("Chat API: Sending request to Ollama...");

    const startTime = Date.now();

    const ollamaResponse = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3.2:1b",
        stream: false,
        messages: [
          {
            role: "system",
            content:
              "You are SkillBridge AI Tutor, a helpful assistant for learning skills. " +
              "Explain concepts in simple, beginner-friendly English, starting with a short, direct definition. " +
              "Use clear headings and concise bullet points when useful. Give one relevant, correct example rather than repeating an explanation. " +
              "For programming questions, include one complete, properly fenced code block when code is useful, preserving indentation; explain it step by step only when helpful. " +
              "Keep mathematical formulas inline unless a multi-line formula or code block is genuinely needed. " +
              "Avoid excessive length, repeated calculations, unnecessary introductions, and repetitive conclusions. " +
              "For broad questions, give a useful, concise answer and offer more detail if needed. " +
              "Give accurate, practical explanations and ask clarifying questions when useful. Never invent facts or claim access to private SkillBridge user data. " +
              "Use standard Markdown compatible with the react-markdown frontend.",
          },
          ...messages.map(({ role, content }) => ({
            role,
            content: content.trim(),
          })),
        ],
      }),
      signal: AbortSignal.timeout(120_000),
    });

    console.log("Chat API: Ollama responded with status:", ollamaResponse.status);
    console.log("Chat API: Ollama response time:", Date.now() - startTime, "ms");

    if (!ollamaResponse.ok) {
      console.error("Ollama chat request failed:", {
        status: ollamaResponse.status,
      });

      return res.status(502).json({
        success: false,
        message: "The AI service is temporarily unavailable. Please try again.",
      });
    }

    const completion = await ollamaResponse.json();
    const reply = completion.message?.content?.trim();

    if (!reply) {
      console.error("Chat API: Ollama returned an empty response.");

      return res.status(502).json({
        success: false,
        message: "The AI Tutor returned an empty response. Please try again.",
      });
    }

    console.log("Chat API: Reply generated successfully.");

    return res.json({
      success: true,
      reply,
    });
  } catch (error) {
    console.error("AI chat request failed:", {
      name: error?.name,
      message: error?.message,
      cause: error?.cause?.message,
    });

    return res.status(502).json({
      success: false,
      message: "The AI service is temporarily unavailable. Please try again.",
    });
  }
};
