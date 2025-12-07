import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.js';
import trackRoutes from './routes/trackRoutes.js';
import playlistRoutes from "./routes/playlistRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";
import cors from 'cors';





dotenv.config();
const PORT = process.env.PORT || 6001;
const app  = express();
const allowedOrigins = ["http://localhost:5173", process.env.FRONTEND_URL, ]
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use("/uploads", express.static("uploads"));
app.use("/api/playlist", playlistRoutes);
app.use("/api/stats", statsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/track', trackRoutes);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server activated on port ${PORT}`);
  });
});
