import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import PostRepository from "../../DB/repositories/post.repository";
import { uploadFiles, deleteFolder } from "../../common/utils/cloudinary.utils";
import { ReactionEnum } from "../../common/enum/post.enum";
import { AppError } from "../../common/utils/globalErrorHandler";
import { successResponse } from "../../common/utils/security/response.success";
import { IRequest } from "../../common/middleware/authentication";

class PostService {
  private readonly _postRepository = new PostRepository();

  createPost = async (req: IRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!._id;
      const files = req.files as Express.Multer.File[] | undefined;

      let attachments: string[] = [];
      let folderId: string | undefined;

      if (files && files.length > 0) {
        folderId = `post/${userId}/${Date.now()}`;
        const uploaded = await uploadFiles(files, folderId, "auto");
        attachments = uploaded.map((f) => f.secure_url);
      }

      const post = await this._postRepository.create({
        ...(req.body.content && { content: req.body.content }),
        ...(req.body.availability && { availability: req.body.availability }),
        ...(req.body.allowComment && { allowComment: req.body.allowComment }),
        ...(req.body.tags && { tags: (req.body.tags as string[]).map((id) => new Types.ObjectId(id)) }),
        ...(folderId && { folderId }),
        createdBy: userId,
        attachments,
      });

      return successResponse({ res, message: "Post created successfully", data: post });
    } catch (error) {
      next(error);
    }
  };

  getAllPosts = async (req: IRequest, res: Response, next: NextFunction) => {
    try {
      const page = Number(req.query["page"]) || 1;
      const limit = Number(req.query["limit"]) || 10;
      const skip = (page - 1) * limit;

      const posts = await this._postRepository.find({
        filter: { availability: "public" },
        options: {
          skip,
          limit,
          sort: { createdAt: -1 },
          populate: [
            { path: "createdBy", select: "firstName lastName profilePicture" },
            { path: "tags", select: "firstName lastName" },
          ],
        },
      });

      return successResponse({ res, message: "Done", data: posts });
    } catch (error) {
      next(error);
    }
  };

  getUserPosts = async (req: IRequest, res: Response, next: NextFunction) => {
    try {
      const profileUserId = new Types.ObjectId(req.params["userId"] as string);
      const requesterId = req.user!._id;
      const page = Number(req.query["page"]) || 1;
      const limit = Number(req.query["limit"]) || 10;
      const skip = (page - 1) * limit;

      const isOwner = profileUserId.toString() === requesterId.toString();
      const filter = isOwner
        ? { createdBy: profileUserId }
        : { createdBy: profileUserId, availability: "public" };

      const posts = await this._postRepository.find({
        filter,
        options: {
          skip,
          limit,
          sort: { createdAt: -1 },
          populate: [{ path: "createdBy", select: "firstName lastName profilePicture" }],
        },
      });

      return successResponse({ res, message: "Done", data: posts });
    } catch (error) {
      next(error);
    }
  };

  getPost = async (req: IRequest, res: Response, next: NextFunction) => {
    try {
      const postId = new Types.ObjectId(req.params["id"] as string);
      const post = await this._postRepository.findById(postId);
      if (!post) throw new AppError("Post not found", 404);

      return successResponse({ res, message: "Done", data: post });
    } catch (error) {
      next(error);
    }
  };

  updatePost = async (req: IRequest, res: Response, next: NextFunction) => {
    try {
      const postId = new Types.ObjectId(req.params["id"] as string);
      const userId = req.user!._id;
      const files = req.files as Express.Multer.File[] | undefined;

      const post = await this._postRepository.findOne({
        filter: { _id: postId, createdBy: userId },
      });
      if (!post) throw new AppError("Post not found or unauthorized", 404);

      let attachments = post.attachments ?? [];
      let folderId = post.folderId;

      if (files && files.length > 0) {
        if (!folderId) folderId = `posts/${userId}/${Date.now()}`;
        const uploaded = await uploadFiles(files, folderId, "auto");
        attachments = [...attachments, ...uploaded.map((f) => f.secure_url)];
      }

      const updated = await this._postRepository.findByIdAndUpdate({
        id: postId,
        update: {
          ...(req.body.content && { content: req.body.content }),
          ...(req.body.availability && { availability: req.body.availability }),
          ...(req.body.allowComment && { allowComment: req.body.allowComment }),
          ...(req.body.tags && { tags: (req.body.tags as string[]).map((id) => new Types.ObjectId(id)) }),
          ...(folderId && { folderId }),
          attachments,
        },
      });

      return successResponse({ res, message: "Post updated successfully", data: updated });
    } catch (error) {
      next(error);
    }
  };

  softDeletePost = async (req: IRequest, res: Response, next: NextFunction) => {
    try {
      const postId = new Types.ObjectId(req.params["id"] as string);
      const userId = req.user!._id;

      const post = await this._postRepository.findOne({
        filter: { _id: postId, createdBy: userId },
      });
      if (!post) throw new AppError("Post not found or unauthorized", 404);

      await this._postRepository.findByIdAndUpdate({
        id: postId,
        update: { isDeleted: true, deletedAt: new Date() },
      });

      return successResponse({ res, message: "Post soft deleted successfully" });
    } catch (error) {
      next(error);
    }
  };

  hardDeletePost = async (req: IRequest, res: Response, next: NextFunction) => {
    try {
      const postId = new Types.ObjectId(req.params["id"] as string);
      const userId = req.user!._id;

      const post = await this._postRepository.findOne({
        filter: { _id: postId, createdBy: userId },
      });
      if (!post) throw new AppError("Post not found or unauthorized", 404);

      if (post.folderId) await deleteFolder(post.folderId);

      await this._postRepository.findOneAndDelete({ filter: { _id: postId } });

      return successResponse({ res, message: "Post permanently deleted" });
    } catch (error) {
      next(error);
    }
  };

  reactToPost = async (req: IRequest, res: Response, next: NextFunction) => {
    try {
      const postId = new Types.ObjectId(req.params["id"] as string);
      const userId = req.user!._id;
      const { type } = req.body;

      if (!Object.values(ReactionEnum).includes(type)) {
        throw new AppError("Invalid reaction type", 400);
      }

      const post = await this._postRepository.findById(postId);
      if (!post) throw new AppError("Post not found", 404);

      const reactions = post.reactions ?? [];
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

      const updated = await this._postRepository.findByIdAndUpdate({
        id: postId,
        update: { reactions },
      });

      return successResponse({ res, message: "Reaction updated", data: updated });
    } catch (error) {
      next(error);
    }
  };
}

export default new PostService();