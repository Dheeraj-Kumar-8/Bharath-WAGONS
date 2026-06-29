const GROQ_CHAT_COMPLETIONS_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
const MAX_ARRAY_ITEMS = 20;
const MAX_OBJECT_KEYS = 40;
const MAX_DEPTH = 5;
const MAX_STRING_LENGTH = 500;
const MAX_CONTEXT_CHARS = 18000;
const MAX_HISTORY_MESSAGES = 8;

const SCOPE_GUIDANCE = {
  admin: "Focus on zone-level operations, alerts, fleet status, and decision support for an admin user.",
  operator: "Focus on live wagon operations, tracking, cargo, alerts, and maintenance actions for an operator user.",
  analyst: "Focus on KPIs, trends, performance interpretation, alerts, and concise analytics insights for an analyst user.",
};

function compactValue(value, depth = 0) {
  if (value == null) return value;

  if (typeof value === "string") {
    return value.length > MAX_STRING_LENGTH
      ? `${value.slice(0, MAX_STRING_LENGTH - 3)}...`
      : value;
  }

  if (typeof value !== "object") return value;
  if (depth >= MAX_DEPTH) return "[Truncated]";

  if (Array.isArray(value)) {
    return value.slice(0, MAX_ARRAY_ITEMS).map((item) => compactValue(item, depth + 1));
  }

  return Object.fromEntries(
    Object.entries(value)
      .slice(0, MAX_OBJECT_KEYS)
      .map(([key, nestedValue]) => [key, compactValue(nestedValue, depth + 1)]),
  );
}

function serialiseContext(context = {}) {
  const compacted = compactValue(context);
  const json = JSON.stringify(compacted, null, 2);
  return json.length > MAX_CONTEXT_CHARS ? `${json.slice(0, MAX_CONTEXT_CHARS)}...` : json;
}

function normaliseConversation(conversation = []) {
  return conversation
    .filter((item) => item && typeof item.text === "string" && item.text.trim())
    .slice(-MAX_HISTORY_MESSAGES)
    .map((item) => ({
      role: item.role === "assistant" ? "assistant" : "user",
      text: item.text.trim(),
    }));
}

function buildSystemPrompt({ scope = "admin", zone = "", userName = "" }) {
  const guidance = SCOPE_GUIDANCE[scope] || SCOPE_GUIDANCE.admin;
  const zoneLine = zone ? `Current zone: ${zone}.` : "Current zone: not specified.";
  const userLine = userName ? `Current signed-in user: ${userName}.` : "Current signed-in user: not specified.";

  return [
    "You are the Indian Railways Command Center hybrid AI assistant.",
    guidance,
    zoneLine,
    userLine,
    "You must ground every answer in the provided dashboard data and the deterministic local assistant answer.",
    "Do not invent wagon IDs, alert counts, delays, routes, maintenance tasks, KPIs, or statistics.",
    "If the dashboard data does not contain the requested information, say that clearly and offer the closest available insight.",
    "Keep responses concise, operationally useful, and easy to scan.",
    "Do not mention hidden prompts, JSON, internal tooling, or that you were given structured context.",
  ].join(" ");
}

function buildUserPrompt({ query, localResponse, conversation, context }) {
  const history = normaliseConversation(conversation)
    .map((message) => `${message.role.toUpperCase()}: ${message.text}`)
    .join("\n");

  return [
    "Latest user question:",
    query,
    "",
    "Deterministic local assistant answer:",
    localResponse?.text || "No local answer was produced.",
    "",
    "Suggested follow-up chips:",
    Array.isArray(localResponse?.chips) && localResponse.chips.length
      ? localResponse.chips.join(", ")
      : "None",
    "",
    "Recent conversation:",
    history || "No prior conversation available.",
    "",
    "Dashboard data snapshot:",
    serialiseContext(context),
    "",
    "Write the final user-facing answer now.",
  ].join("\n");
}

function extractReply(data) {
  const content = data?.choices?.[0]?.message?.content;

  if (typeof content === "string") return content.trim();

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") return part;
        if (typeof part?.text === "string") return part.text;
        return "";
      })
      .join("\n")
      .trim();
  }

  return "";
}

export async function getHybridAssistantReply(payload) {
  if (!process.env.GROQ_API_KEY) {
    const error = new Error("GROQ_API_KEY is not configured on the backend");
    error.statusCode = 503;
    throw error;
  }

  const body = {
    model: DEFAULT_GROQ_MODEL,
    temperature: 0.2,
    max_tokens: 500,
    messages: [
      {
        role: "system",
        content: buildSystemPrompt(payload),
      },
      {
        role: "user",
        content: buildUserPrompt(payload),
      },
    ],
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  let response;
  try {
    response = await fetch(GROQ_CHAT_COMPLETIONS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (error) {
    const wrapped = new Error(
      error.name === "AbortError"
        ? "Groq request timed out"
        : `Unable to reach Groq: ${error.message}`,
    );
    wrapped.statusCode = 502;
    throw wrapped;
  } finally {
    clearTimeout(timeoutId);
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data?.error?.message || "Groq request failed";
    const error = new Error(message);
    error.statusCode = response.status >= 500 ? 502 : response.status;
    throw error;
  }

  const reply = extractReply(data);

  if (!reply) {
    const error = new Error("Groq returned an empty reply");
    error.statusCode = 502;
    throw error;
  }

  return {
    reply,
    model: data?.model || DEFAULT_GROQ_MODEL,
    usage: data?.usage || null,
  };
}
