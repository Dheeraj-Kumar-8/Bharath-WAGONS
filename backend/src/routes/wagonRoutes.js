import express from "express";
import { getWagons } from "../controllers/wagonController.js";

const router = express.Router();

router.get("/", getWagons);

export default router;
