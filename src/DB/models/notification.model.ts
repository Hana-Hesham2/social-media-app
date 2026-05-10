import mongoose, { Types } from "mongoose";

export interface INotification {
  _id: Types.ObjectId;
  title: string;
  body: string;
  userId: Types.ObjectId;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new mongoose.Schema<INotification>(
  {
    title: { type: String, required: true },
    body: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const notificationModel =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", notificationSchema);

export default notificationModel;