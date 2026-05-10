import { Model } from "mongoose";
import BaseRepository from "./base.repository.js";
import notificationModel, { INotification } from "../models/notification.model.js";

class NotificationRepository extends BaseRepository<INotification> {
  constructor(protected readonly model: Model<INotification> = notificationModel) {
    super(model);
  }
}

export default NotificationRepository;