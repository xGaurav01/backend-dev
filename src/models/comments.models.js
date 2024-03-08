import mongoose from "mongoose";

// content, videoId, ownerId
const commentsSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, "Content is Required"],
    },
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
      required: [true, "Video is Required"],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner is Required"],
    },
  },
  { timestamps: true }
);

export const Comment = mongoose.model("Comment", commentsSchema);
