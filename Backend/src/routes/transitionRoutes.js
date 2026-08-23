import express from "express";
import { logTransition, predictNext } from "../controllers/transitionController.js";

const router = express.Router();

router.post("/", logTransition);
router.get("/predict/:id", predictNext);

export default router;
