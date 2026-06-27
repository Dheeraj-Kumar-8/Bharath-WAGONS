import { getHybridAssistantReply } from "../services/groqAssistantService.js";

export const postHybridChat = async (req, res, next) => {
  try {
    const query = typeof req.body?.query === "string" ? req.body.query.trim() : "";

    if (!query) {
      return res.status(400).json({ success: false, message: "Query is required" });
    }

    console.log("[POST /api/assistant/hybrid-chat] request received");

    const result = await getHybridAssistantReply({
      scope: req.body?.scope || "admin",
      zone: req.body?.zone || "",
      userName: req.body?.userName || "",
      query,
      localResponse: req.body?.localResponse || {},
      conversation: req.body?.conversation || [],
      context: req.body?.context || {},
    });

    res.json({
      success: true,
      reply: result.reply,
      model: result.model,
      usage: result.usage,
      source: "groq-hybrid",
    });
  } catch (error) {
    console.error("[POST /api/assistant/hybrid-chat] error:", error.message);
    res.status(error.statusCode || 502);
    next(error);
  }
};
