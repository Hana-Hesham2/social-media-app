import mongoose, { Types } from "mongoose";

export interface IStory {
  _id?: Types.ObjectId;
  content?: string;
  attachments?: string[];
  createdBy?: Types.ObjectId;
  folderId?: string;
  viewers?: Types.ObjectId[];
  expiresAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const StorySchema = new mongoose.Schema<IStory>(
  {
    content: { type: String },
    attachments: [String],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    folderId: { type: String },
    viewers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

StorySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const StoryModel =
  mongoose.models.Story || mongoose.model<IStory>("Story", StorySchema);

export default StoryModel;