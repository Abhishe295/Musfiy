import Track from "../models/trackModel.js";
import userModel from "../models/userModel.js";
import fs from "fs";
import path from "path";


export const getAllTracks = async (req, res) => {
  try {
    const tracks = await Track.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      tracks,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getEmotionTracks = async (req, res) => {
  const { emotion } = req.params;

  try {
    const tracks = await Track.find({ emotionTag: emotion });

    return res.status(200).json({
      success: true,
      tracks,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const uploadTrack = async (req, res) => {
  try {
    const { title, artist, emotionTag } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const fileUrl = `/uploads/music/${req.file.filename}`;

    const newTrack = await Track.create({
      title,
      artist,
      emotionTag: emotionTag || null,
      fileUrl,
      uploadedBy: req.user?._id || null,
    });

    if (req.user) {
      await userModel.findByIdAndUpdate(req.user._id, {
        $push: { uploadedTracks: newTrack._id },
      });
    }

    return res.status(201).json({
      success: true,
      message: "Track uploaded successfully",
      track: newTrack,
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const updateTrack = async (req, res) => {
  const { id } = req.params;
  const { title, artist, emotionTag } = req.body;

  try {
    const updated = await Track.findByIdAndUpdate(
      id,
      { title, artist, emotionTag },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Track not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Track updated successfully",
      updatedTrack: updated,
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


export const deleteTrack = async (req, res) => {
  const { id } = req.params;

  try {
    const track = await Track.findById(id);

    if (!track) {
      return res.status(404).json({ success: false, message: "Track not found" });
    }

    const cleanPath = track.fileUrl.startsWith("/")
      ? track.fileUrl.substring(1)
      : track.fileUrl;

    const filePath = path.join(process.cwd(), cleanPath);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Track.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Track deleted successfully",
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const timePlayed = async (req, res) => {
  try {
    const track = await Track.findById(req.params.id);
    if (!track) return res.status(404).json({ success: false });

    track.timesUsed++;
    await track.save();

    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false });
  }
}


