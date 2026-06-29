const BACKEND_URL = "http://localhost:5000/api/assistant/hybrid-chat";

/**
 * history: [{ role: "user"|"assistant", content: string }]
 * Returns the assistant reply string.
 */
export async function askGroq(history) {
  const conversation = history.map(m => ({ role: m.role, text: m.content }));
  const query = history.filter(m => m.role === "user").at(-1)?.content || "";

  const res = await fetch(BACKEND_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, conversation, scope: "operator" }),
  });

  if (!res.ok) throw new Error(`Backend ${res.status}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.message || "Backend error");
  return data.reply;
}
