import Track from "../models/trackModel.js";
import userModel from "../models/userModel.js";
import fs from "fs";
import path from "path";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

// Sensible batch-size guardrails so a caller can't request the whole
// library in one shot (which was the root cause of the slow initial load).
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

const parsePagination = (req) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(
    Math.max(parseInt(req.query.limit, 10) || DEFAULT_PAGE_SIZE, 1),
    MAX_PAGE_SIZE
  );
  return { page, limit, skip: (page - 1) * limit };
};

export const getAllTracks = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req);

    // .lean() skips Mongoose document hydration since we're only ever
    // reading this data for display -> cheaper to serialize, faster response.
    const tracksQuery = Track.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit + 1) // fetch one extra to cheaply know if there's another page
      .lean();

    const tracks = await tracksQuery;

    const hasMore = tracks.length > limit;
    if (hasMore) tracks.pop(); // drop the lookahead doc before responding

    // Only compute the (relatively expensive) full collection count on the
    // very first page, and only because the UI can make use of it — we don't
    // want a countDocuments() call on every single page request.
    let totalCount;
    if (page === 1) {
      totalCount = await Track.estimatedDocumentCount();
    }

    return res.status(200).json({
      success: true,
      tracks,
      page,
      limit,
      hasMore,
      ...(totalCount !== undefined && { totalCount }),
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getEmotionTracks = async (req, res) => {
  const { emotion } = req.params;

  try {
    const { page, limit, skip } = parsePagination(req);

    const tracks = await Track.find({ emotionTag: emotion })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit + 1)
      .lean();

    const hasMore = tracks.length > limit;
    if (hasMore) tracks.pop();

    return res.status(200).json({
      success: true,
      tracks,
      page,
      limit,
      hasMore,
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

    const uploadStream = () =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            resource_type: "video",
            folder: "musify_tracks",
          },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );

        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });

    const result = await uploadStream();

    const fileUrl = result.secure_url;

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
    // Atomic increment: one round trip instead of find() + save(),
    // and avoids two concurrent plays racing on the same document.
    const track = await Track.findByIdAndUpdate(
      req.params.id,
      { $inc: { timesUsed: 1 } },
      { new: true }
    );
    if (!track) return res.status(404).json({ success: false });

    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false });
  }
}


