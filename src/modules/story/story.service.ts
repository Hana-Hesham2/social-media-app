import { Response, NextFunction } from "express";
import { Types } from "mongoose";
import StoryRepository from "../../DB/repositories/story.repository";
import { uploadFiles, deleteFolder } from "../../common/utils/cloudinary.utils";
import { AppError } from "../../common/utils/globalErrorHandler";
import { successResponse } from "../../common/utils/security/response.success";
import { IRequest } from "../../common/middleware/authentication";

class StoryService {
  private readonly _storyRepository = new StoryRepository();

  createStory = async (req: IRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!._id;
      const files = req.files as Express.Multer.File[] | undefined;

      let attachments: string[] = [];
      let folderId: string | undefined;

      if (files && files.length > 0) {
        folderId = `stories/${userId}/${Date.now()}`;
        const uploaded = await uploadFiles(files, folderId, "auto");
        attachments = uploaded.map((f) => f.secure_url);
      }

      if (!req.body.content && attachments.length === 0) {
        throw new AppError("Content or attachments are required", 400);
      }

      const story = await this._storyRepository.create({
        ...(req.body.content && { content: req.body.content }),
        ...(folderId && { folderId }),
        createdBy: userId,
        attachments,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      return successResponse({ res, message: "Story created successfully", data: story });
    } catch (error) {
      next(error);
    }
  };

  getStories = async (req: IRequest, res: Response, next: NextFunction) => {
    try {
      const page = Number(req.query["page"]) || 1;
      const limit = Number(req.query["limit"]) || 10;
      const skip = (page - 1) * limit;

      const stories = await this._storyRepository.find({
        filter: { expiresAt: { $gt: new Date() } },
        options: {
          skip,
          limit,
          sort: { createdAt: -1 },
          populate: [{ path: "createdBy", select: "firstName lastName profilePicture" }],
        },
      });

      return successResponse({ res, message: "Done", data: stories });
    } catch (error) {
      next(error);
    }
  };

  getUserStories = async (req: IRequest, res: Response, next: NextFunction) => {
    try {
      const userId = new Types.ObjectId(req.params["userId"] as string);

      const stories = await this._storyRepository.find({
        filter: { createdBy: userId, expiresAt: { $gt: new Date() } },
        options: {
          sort: { createdAt: -1 },
          populate: [{ path: "createdBy", select: "firstName lastName profilePicture" }],
        },
      });

      return successResponse({ res, message: "Done", data: stories });
    } catch (error) {
      next(error);
    }
  };

  viewStory = async (req: IRequest, res: Response, next: NextFunction) => {
    try {
      const storyId = new Types.ObjectId(req.params["storyId"] as string);
      const userId = req.user!._id;

      const story = await this._storyRepository.findById(storyId);
      if (!story) throw new AppError("Story not found or expired", 404);

      const alreadyViewed = story.viewers?.some(
        (v) => v.toString() === userId.toString()
      );

      if (!alreadyViewed) {
        await this._storyRepository.findByIdAndUpdate({
          id: storyId,
          update: { $push: { viewers: userId } },
        });
      }

      return successResponse({ res, message: "Done", data: story });
    } catch (error) {
      next(error);
    }
  };

  deleteStory = async (req: IRequest, res: Response, next: NextFunction) => {
    try {
      const storyId = new Types.ObjectId(req.params["storyId"] as string);
      const userId = req.user!._id;

      const story = await this._storyRepository.findOne({
        filter: { _id: storyId, createdBy: userId },
      });
      if (!story) throw new AppError("Story not found or unauthorized", 404);

      if (story.folderId) await deleteFolder(story.folderId);

      await this._storyRepository.findOneAndDelete({
        filter: { _id: storyId },
      });

      return successResponse({ res, message: "Story deleted successfully" });
    } catch (error) {
      next(error);
    }
  };
}

export default new StoryService();