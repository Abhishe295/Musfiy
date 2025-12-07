import mongoose from "mongoose";
import dotenv from "dotenv";
import Track from "./models/trackModel.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const tracks = [
  { title: "A Man without Love", artist: "Engelbert Humperdinck", fileUrl: "/uploads/music/music1.mp3" },
  { title: "I Wanna be Yours", artist: "Arctic Monkeys", fileUrl: "/uploads/music/music2.mp3" },
  { title: "Lover", artist: "Diljit Dosanjh", fileUrl: "/uploads/music/music3.mp3" },
  { title: "Kinni Kinni", artist: "Diljit Dosanjh", fileUrl: "/uploads/music/music4.mp3" },
  { title: "Left and Right", artist: "Charlie Puth", fileUrl: "/uploads/music/music5.mp3" },
  { title: "Hey Sexy Lady", artist: "Shaggy, Brian", fileUrl: "/uploads/music/music6.mp3" },
  { title: "Untill I Found You", artist: "Stephen Sanchez", fileUrl: "/uploads/music/music7.mp3" },
  { title: "Perfect", artist: "Ed Sheeran", fileUrl: "/uploads/music/music8.mp3" },
  { title: "Sunflower", artist: "Post Malone, Swae Lee", fileUrl: "/uploads/music/music9.mp3" },
  { title: "Jo Tum Mere Ho", artist: "Anuv Jain", fileUrl: "/uploads/music/music10.mp3" },
  { title: "Night Changes", artist: "One Direction", fileUrl: "/uploads/music/music11.mp3" },
  { title: "Shape of You", artist: "Ed Sheeran", fileUrl: "/uploads/music/music12.mp3" },
  { title: "There's Nothing Holdin me back", artist: "Some one", fileUrl: "/uploads/music/music13.mp3" },
  { title: "Attention", artist: "Charlie Puth", fileUrl: "/uploads/music/music14.mp3" },
  { title: "Hai apna Dil to awara", artist: "Kishore Kumar", fileUrl: "/uploads/music/music15.mp3" },
  { title: "Dil to Bachha hai Ji", artist: "Kishore Kumar", fileUrl: "/uploads/music/music16.mp3" },
  { title: "Dancin", artist: "Krono remix", fileUrl: "/uploads/music/music17.mp3" },
  { title: "Die with a smile", artist: "Brono", fileUrl: "/uploads/music/music18.mp3" },
  { title: "Mr. Saxophone", artist: "Alexandar Stan", fileUrl: "/uploads/music/music19.mp3" },
  { title: "Counting Stars", artist: "One Republic", fileUrl: "/uploads/music/music20.mp3" },
  { title: "Home", artist: "Edward Sharpe", fileUrl: "/uploads/music/music21.mp3" },
  { title: "Feel It", artist: "D4vd", fileUrl: "/uploads/music/music22.mpeg" },
  { title: "Aankhon me doob jaane ko", artist: "The 9teen", fileUrl: "/uploads/music/music23.mp3" },
  { title: "Maharani", artist: "Arpit bala", fileUrl: "/uploads/music/music24.mp3" },
  { title: "Blinding Lights", artist: "The Weeknd", fileUrl: "/uploads/music/music25.mp4" }
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB Connected.");

    await Track.deleteMany();
    console.log("Old tracks removed.");

    await Track.insertMany(tracks);
    console.log("Tracks inserted successfully!");

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

seed();
