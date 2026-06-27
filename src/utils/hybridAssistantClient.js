const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";
const REQUEST_TIMEOUT_MS = 9000;
const MAX_HISTORY_MESSAGES = 8;

function normaliseConversation(messages = []) {
  return messages
    .filter((message) => message && typeof message.text === "string" && message.text.trim())
    .slice(-MAX_HISTORY_MESSAGES)
    .map((message) => ({
      role: message.role === "ai" ? "assistant" : "user",
      text: message.text.trim(),
    }));
}

export async function requestHybridAssistantReply({
  scope,
  zone,
  userName,
  query,
  localResponse,
  messages,
  context,
}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE_URL}/api/assistant/hybrid-chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        scope,
        zone,
        userName,
        query,
        localResponse,
        conversation: normaliseConversation(messages),
        context,
      }),
      signal: controller.signal,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data?.success || typeof data?.reply !== "string") {
      const message = data?.message || "Hybrid assistant request failed";
      throw new Error(message);
    }

    return data.reply.trim();
  } finally {
    clearTimeout(timeoutId);
  }
}
