import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import fs from "fs";
import path from "path";
import cloudinary from "./config/cloudinary.js";
import Track from "./models/trackModel.js";


console.log("CLOUDINARY KEY:", process.env.CLOUDINARY_API_KEY);
console.log("CLOUDINARY SECRET:", process.env.CLOUDINARY_API_SECRET);
console.log("CLOUDINARY NAME:", process.env.CLOUDINARY_CLOUD_NAME);
const MONGO_URI = process.env.MONGO_URI;

const tracks = [
  { title: "A Man without Love", artist: "Engelbert Humperdinck", file: "music1.mp3" },
  { title: "I Wanna be Yours", artist: "Arctic Monkeys", file: "music2.mp3" },
  { title: "Lover", artist: "Diljit Dosanjh", file: "music3.mp3" },
  { title: "Kinni Kinni", artist: "Diljit Dosanjh", file: "music4.mp3" },
  { title: "Left and Right", artist: "Charlie Puth", file: "music5.mp3" },
  { title: "Hey Sexy Lady", artist: "Shaggy, Brian & Tony Gold", file: "music6.mp3" },
  { title: "Until I Found You", artist: "Stephen Sanchez", file: "music7.mp3" },
  { title: "Perfect", artist: "Ed Sheeran", file: "music8.mp3" },
  { title: "Sunflower", artist: "Post Malone, Swae Lee", file: "music9.mp3" },
  { title: "Jo Tum Mere Ho", artist: "Anuv Jain", file: "music10.mp3" },
  { title: "Night Changes", artist: "One Direction", file: "music11.mp3" },
  { title: "Shape of You", artist: "Ed Sheeran", file: "music12.mp3" },
  { title: "There's Nothing Holdin' Me Back", artist: "Shawn Mendes", file: "music13.mp3" },
  { title: "Attention", artist: "Charlie Puth", file: "music14.mp3" },
  { title: "Hai Apna Dil To Awara", artist: "Kishore Kumar", file: "music15.mp3" },
  { title: "Dil To Bachha Hai Ji", artist: "Rahat Fateh Ali Khan", file: "music16.mp3" },
  { title: "Dancin (Krono Remix)", artist: "Aaron Smith", file: "music17.mp3" },
  { title: "Die With a Smile", artist: "Bruno Mars", file: "music18.mp3" },
  { title: "Mr. Saxobeat", artist: "Alexandra Stan", file: "music19.mp3" },
  { title: "Counting Stars", artist: "OneRepublic", file: "music20.mp3" },
  { title: "Home", artist: "Edward Sharpe & The Magnetic Zeros", file: "music21.mp3" },
  { title: "Feel It", artist: "d4vd", file: "music22.mpeg" },
  { title: "Aankhon Mein Doob Jaane Ko", artist: "The 9teen", file: "music23.mp3" },
  { title: "Maharani", artist: "Arpit Bala", file: "music24.mp3" },
  { title: "Blinding Lights", artist: "The Weeknd", file: "music25.mp4" }
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB Connected");

    await Track.deleteMany();
    console.log("Old tracks deleted");

    const insertedTracks = [];

    for (const track of tracks) {
      const filePath = path.join("uploads/music", track.file);

      const uploadResult = await cloudinary.uploader.upload(filePath, {
        resource_type: "video",
        folder: "musify_tracks",
      });

      insertedTracks.push({
        title: track.title,
        artist: track.artist,
        fileUrl: uploadResult.secure_url,
      });

      console.log(`Uploaded ${track.file}`);
    }

    await Track.insertMany(insertedTracks);

    console.log("Seed completed");
    process.exit();

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();