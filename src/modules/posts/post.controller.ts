import { Router } from "express";
import { authentication } from "../../common/middleware/authentication";
import { upload } from "../../common/middleware/multer.middleware";
import postService from "./post.service";
import commentRouter from "../comments/comment.controller";


const postRouter = Router();

postRouter.use("/:postId/comments", commentRouter);
postRouter.post("/", authentication, upload.array("attachments", 10), postService.createPost);
postRouter.get("/", authentication, postService.getAllPosts);
postRouter.get("/profile/:userId", authentication, postService.getUserPosts);
postRouter.get("/:id", authentication, postService.getPost);
postRouter.patch("/:id", authentication, upload.array("attachments", 10), postService.updatePost);
postRouter.delete("/:id/soft", authentication, postService.softDeletePost);
postRouter.delete("/:id/hard", authentication, postService.hardDeletePost);
postRouter.post("/:id/react", authentication, postService.reactToPost);

export default postRouter;