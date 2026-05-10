import { Response, NextFunction } from "express";
import { Types } from "mongoose";
import admin from "../../config/firebase.config";
import NotificationRepository from "../../DB/repositories/notification.repository";
import UserRepository from "../../DB/repositories/user.repository";
import { AppError } from "../../common/utils/globalErrorHandler";
import { successResponse } from "../../common/utils/security/response.success";
import { IRequest } from "../../common/middleware/authentication";

class NotificationService {
  private readonly _notificationRepository = new NotificationRepository();
  private readonly _userRepository = new UserRepository();

  storeFcmToken = async (req: IRequest, res: Response, next: NextFunction) => {
    try {
      const { fcmToken } = req.body;
      if (!fcmToken) throw new AppError("fcmToken is required", 400);

      await this._userRepository.findByIdAndUpdate({
        id: req.user!._id,
        update: { fcmToken },
      });

      return successResponse({ res, message: "FCM token stored successfully" });
    } catch (error) {
      next(error);
    }
  };

  sendNotification = async (req: IRequest, res: Response, next: NextFunction) => {
    try {
      const { userId, title, body } = req.body;
      if (!userId || !title || !body) throw new AppError("userId, title, body are required", 400);

      const user = await this._userRepository.findById(new Types.ObjectId(userId as string));
      if (!user?.fcmToken) throw new AppError("User has no FCM token", 404);

      await this._notificationRepository.create({
        title,
        body,
        userId: new Types.ObjectId(userId as string),
      });

      await admin.messaging().send({
        token: user.fcmToken,
        data: { title, body },
      });

      return successResponse({ res, message: "Notification sent successfully" });
    } catch (error) {
      next(error);
    }
  };

  getNotifications = async (req: IRequest, res: Response, next: NextFunction) => {
    try {
      const notifications = await this._notificationRepository.find({
        filter: { userId: req.user!._id },
        options: { sort: { createdAt: -1 } },
      });

      return successResponse({ res, message: "Done", data: notifications });
    } catch (error) {
      next(error);
    }
  };

  markAsRead = async (req: IRequest, res: Response, next: NextFunction) => {
    try {
      const notification = await this._notificationRepository.findOneAndUpdate({
        filter: { _id: new Types.ObjectId(req.params["id"] as string), userId: req.user!._id },
        update: { isRead: true },
      });
      if (!notification) throw new AppError("Notification not found", 404);

      return successResponse({ res, message: "Marked as read", data: notification });
    } catch (error) {
      next(error);
    }
  };

  markAllAsRead = async (req: IRequest, res: Response, next: NextFunction) => {
    try {
      await this._notificationRepository.findOneAndUpdate({
        filter: { userId: req.user!._id, isRead: false },
        update: { isRead: true },
      });

      return successResponse({ res, message: "All notifications marked as read" });
    } catch (error) {
      next(error);
    }
  };

  deleteNotification = async (req: IRequest, res: Response, next: NextFunction) => {
    try {
      await this._notificationRepository.findOneAndDelete({
        filter: { _id: new Types.ObjectId(req.params["id"] as string), userId: req.user!._id },
      });

      return successResponse({ res, message: "Notification deleted successfully" });
    } catch (error) {
      next(error);
    }
  };
}

export default new NotificationService();