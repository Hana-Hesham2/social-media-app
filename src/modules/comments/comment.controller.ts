import { Router } from "express";
import { authentication } from "../../common/middleware/authentication.js";
import { upload } from "../../common/middleware/multer.middleware.js";
import commentService from "./comment.service.js";

const commentRouter = Router({ mergeParams: true });

// POST /api/posts/:postId/comments
commentRouter.post("/", authentication, upload.array("attachments", 5), commentService.createComment);

// GET /api/posts/:postId/comments
commentRouter.get("/", authentication, commentService.getPostComments);

// GET /api/posts/:postId/comments/:commentId/replies
commentRouter.get("/:commentId/replies", authentication, commentService.getReplies);

// PATCH /api/posts/:postId/comments/:commentId
commentRouter.patch("/:commentId", authentication, upload.array("attachments", 5), commentService.updateComment);

// DELETE /api/posts/:postId/comments/:commentId/soft
commentRouter.delete("/:commentId/soft", authentication, commentService.softDeleteComment);

// DELETE /api/posts/:postId/comments/:commentId/hard
commentRouter.delete("/:commentId/hard", authentication, commentService.hardDeleteComment);

// POST /api/posts/:postId/comments/:commentId/react
commentRouter.post("/:commentId/react", authentication, commentService.reactToComment);

export default commentRouter;