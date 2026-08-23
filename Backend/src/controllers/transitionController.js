import PlayTransition from "../models/playTransitionModel.js";

// Fire-and-forget from the client whenever the current track changes
// (skip, natural end, or manual selection). Never a hard failure for the
// caller — this is training data for a nice-to-have prefetch feature,
// not something worth surfacing an error over.
export const logTransition = async (req, res) => {
  try {
    const { from, to } = req.body;

    if (!from || !to || from === to) {
      return res.status(200).json({ success: true });
    }

    await PlayTransition.findOneAndUpdate(
      { from, to },
      { $inc: { count: 1 } },
      { upsert: true }
    );

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(200).json({ success: false });
  }
};

// Given the track currently playing, return the historically most common
// track played right after it (cold start -> null, and the client falls
// back to prefetching whatever's next in the queue instead).
export const predictNext = async (req, res) => {
  try {
    const { id } = req.params;

    const top = await PlayTransition.findOne({ from: id })
      .sort({ count: -1 })
      .lean();

    if (!top) {
      return res.status(200).json({ success: true, predictedTrackId: null });
    }

    return res.status(200).json({
      success: true,
      predictedTrackId: top.to,
      confidence: top.count,
    });
  } catch (error) {
    return res.status(200).json({ success: true, predictedTrackId: null });
  }
};
