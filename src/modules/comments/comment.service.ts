import { Response, NextFunction } from "express";
import { Types } from "mongoose";
import CommentRepository from "../../DB/repositories/comment.repository.js";
import { uploadFiles, deleteFolder } from "../../common/utils/cloudinary.utils.js";
import { ReactionEnum } from "../../common/enum/post.enum.js";
import { AppError } from "../../common/utils/globalErrorHandler.js";
import { successResponse } from "../../common/utils/security/response.success.js";
import { IRequest } from "../../common/middleware/authentication.js";

class CommentService {
  private readonly _commentRepository = new CommentRepository();

  createComment = async (req: IRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!._id;
      const postId = new Types.ObjectId(req.params["postId"] as string);
      const files = req.files as Express.Multer.File[] | undefined;

      let attachments: string[] = [];
      let folderId: string | undefined;

      if (files && files.length > 0) {
        folderId = `comments/${userId}/${Date.now()}`;
        const uploaded = await uploadFiles(files, folderId, "auto");
        attachments = uploaded.map((f) => f.secure_url);
      }

      const comment = await this._commentRepository.create({
        ...(req.body.content && { content: req.body.content }),
        ...(req.body.parentComment && { parentComment: new Types.ObjectId(req.body.parentComment) }),
        ...(folderId && { folderId }),
        postId,
        createdBy: userId,
        attachments,
      });

      return successResponse({ res, message: "Comment created successfully", data: comment });
    } catch (error) {
      next(error);
    }
  };

  getPostComments = async (req: IRequest, res: Response, next: NextFunction) => {
    try {
      const postId = new Types.ObjectId(req.params["postId"] as string);
      const page = Number(req.query["page"]) || 1;
      const limit = Number(req.query["limit"]) || 10;
      const skip = (page - 1) * limit;

      const comments = await this._commentRepository.find({
        filter: { postId, parentComment: { $exists: false } },
        options: {
          skip,
          limit,
          sort: { createdAt: -1 },
          populate: [{ path: "createdBy", select: "firstName lastName profilePicture" }],
        },
      });

      return successResponse({ res, message: "Done", data: comments });
    } catch (error) {
      next(error);
    }
  };

  getReplies = async (req: IRequest, res: Response, next: NextFunction) => {
    try {
      const commentId = new Types.ObjectId(req.params["commentId"] as string);
      const page = Number(req.query["page"]) || 1;
      const limit = Number(req.query["limit"]) || 10;
      const skip = (page - 1) * limit;

      const replies = await this._commentRepository.find({
        filter: { parentComment: commentId },
        options: {
          skip,
          limit,
          sort: { createdAt: -1 },
          populate: [{ path: "createdBy", select: "firstName lastName profilePicture" }],
        },
      });

      return successResponse({ res, message: "Done", data: replies });
    } catch (error) {
      next(error);
    }
  };

  updateComment = async (req: IRequest, res: Response, next: NextFunction) => {
    try {
      const commentId = new Types.ObjectId(req.params["commentId"] as string);
      const userId = req.user!._id;
      const files = req.files as Express.Multer.File[] | undefined;

      const comment = await this._commentRepository.findOne({
        filter: { _id: commentId, createdBy: userId },
      });
      if (!comment) throw new AppError("Comment not found or unauthorized", 404);

      let attachments = comment.attachments ?? [];

      if (files && files.length > 0) {
        const folderId = `comments/${userId}/${Date.now()}`;
        const uploaded = await uploadFiles(files, folderId, "auto");
        attachments = [...attachments, ...uploaded.map((f: { secure_url: any }) => f.secure_url)];
      }

      const updated = await this._commentRepository.findByIdAndUpdate({
        id: commentId,
        update: {
          ...(req.body.content && { content: req.body.content }),
          attachments,
        },
      });

      return successResponse({ res, message: "Comment updated successfully", data: updated });
    } catch (error) {
      next(error);
    }
  };

  softDeleteComment = async (req: IRequest, res: Response, next: NextFunction) => {
    try {
      const commentId = new Types.ObjectId(req.params["commentId"] as string);
      const userId = req.user!._id;

      const comment = await this._commentRepository.findOne({
        filter: { _id: commentId, createdBy: userId },
      });
      if (!comment) throw new AppError("Comment not found or unauthorized", 404);

      await this._commentRepository.findByIdAndUpdate({
        id: commentId,
        update: { isDeleted: true, deletedAt: new Date() },
      });

      return successResponse({ res, message: "Comment soft deleted successfully" });
    } catch (error) {
      next(error);
    }
  };

  hardDeleteComment = async (req: IRequest, res: Response, next: NextFunction) => {
    try {
      const commentId = new Types.ObjectId(req.params["commentId"] as string);
      const userId = req.user!._id;

      const comment = await this._commentRepository.findOne({
        filter: { _id: commentId, createdBy: userId },
      });
      if (!comment) throw new AppError("Comment not found or unauthorized", 404);

      await this._commentRepository.deleteMany({
        filter: { parentComment: commentId },
      });

      await this._commentRepository.findOneAndDelete({
        filter: { _id: commentId },
      });

      return successResponse({ res, message: "Comment permanently deleted" });
    } catch (error) {
      next(error);
    }
  };

  reactToComment = async (req: IRequest, res: Response, next: NextFunction) => {
    try {
      const commentId = new Types.ObjectId(req.params["commentId"] as string);
      const userId = req.user!._id;
      const { type } = req.body;

      if (!Object.values(ReactionEnum).includes(type)) {
        throw new AppError("Invalid reaction type", 400);
      }

      const comment = await this._commentRepository.findById(commentId);
      if (!comment) throw new AppError("Comment not found", 404);

      const reactions = comment.reactions ?? [];
      const existingIndex = reactions.findIndex(
        (r) => r.userId.toString() === userId.toString()
      );

      if (existingIndex !== -1) {
        if (reactions[existingIndex]!.type === type) {
          reactions.splice(existingIndex, 1);
        } else {
          reactions[existingIndex]!.type = type;
        }
      } else {
        reactions.push({ userId, type });
      }

      const updated = await this._commentRepository.findByIdAndUpdate({
        id: commentId,
        update: { reactions },
      });

      return successResponse({ res, message: "Reaction updated", data: updated });
    } catch (error) {
      next(error);
    }
  };
}

export default new CommentService();