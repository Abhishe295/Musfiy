import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type:String, required: true, unique:true},
    password: {type: String, default: "Password"},
    uploadedTracks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Track",
      }
    ],
    generatedMixes: [
      {
        mood: { type: String },
        tracks: [
          {
            track: { type: mongoose.Schema.Types.ObjectId, ref: "Track" },
            weight: Number,
          }
        ],
        createdAt: { type: Date, default: Date.now }
      }
    ],
},{timestamps:true}
);
const userModel = mongoose.models.user || mongoose.model("user",userSchema);
export default userModel;
