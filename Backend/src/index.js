import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.js';
import trackRoutes from './routes/trackRoutes.js';
import playlistRoutes from "./routes/playlistRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
const PORT = process.env.PORT || 6001;
const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS: " + origin), false);
  },
  credentials: true,
}));

// CORS for audio streaming
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", process.env.FRONTEND_URL);
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isRender = process.env.RENDER === "true";

let uploadsPath = "";

if (isRender) {
  uploadsPath = "/opt/render/project/src/uploads";
} else {
  uploadsPath = path.join(__dirname, "..", "uploads");
}

console.log("SERVING UPLOADS FROM:", uploadsPath);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// FIX HERE: remove extra cors()
app.use("/uploads", express.static(uploadsPath));

app.use("/api/playlist", playlistRoutes);
app.use("/api/stats", statsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/track', trackRoutes);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server activated on port ${PORT}`);
  });
});
