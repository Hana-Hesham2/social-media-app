import { Router } from "express";
import { authentication } from "../../common/middleware/authentication";
import notificationService from "./notification.service";

const notificationRouter = Router();

notificationRouter.post("/store-token", authentication, notificationService.storeFcmToken);
notificationRouter.post("/send", authentication, notificationService.sendNotification);
notificationRouter.get("/", authentication, notificationService.getNotifications);
notificationRouter.patch("/read-all", authentication, notificationService.markAllAsRead);
notificationRouter.patch("/:id/read", authentication, notificationService.markAsRead);
notificationRouter.delete("/:id", authentication, notificationService.deleteNotification);

export default notificationRouter;