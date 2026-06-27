import express from "express";
import { postHybridChat } from "../controllers/assistantController.js";

const router = express.Router();

router.post("/hybrid-chat", postHybridChat);

export default router;
