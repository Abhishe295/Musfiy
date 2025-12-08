import express from "express";
import {
  getAllTracks,
  getEmotionTracks,
  uploadTrack,
  updateTrack,
  deleteTrack,
  timePlayed
} from "../controllers/trackController.js";

import { upload } from "../middleware/multer.js";
import userAuth from "../middleware/userAuth.js";

const router = express.Router();

router.get("/all", getAllTracks);
router.get("/emotion/:emotion", getEmotionTracks);

router.post("/upload", userAuth, upload.single("track"), uploadTrack);

router.put("/:id", userAuth, updateTrack);
router.delete("/:id", userAuth, deleteTrack);
router.post("/play/:id", timePlayed);


export default router;
