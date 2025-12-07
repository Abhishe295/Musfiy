import express from "express";
import { getTopTracks } from "../controllers/statsController.js";

const router = express.Router();

// No auth needed → public stats
router.get("/top-tracks", getTopTracks);

export default router;
