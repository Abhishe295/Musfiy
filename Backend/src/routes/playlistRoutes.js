import express from "express";
import userAuth from "../middleware/userAuth.js";
import { generatePlaylist } from "../controllers/playlistController.js";

const router = express.Router();

router.post("/generate", userAuth, generatePlaylist);

export default router;
