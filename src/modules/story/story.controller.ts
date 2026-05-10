import { Router } from "express";
import { authentication } from "../../common/middleware/authentication";
import { upload } from "../../common/middleware/multer.middleware";
import storyService from "./story.service";

const storyRouter = Router();

// POST /api/stories
storyRouter.post("/", authentication, upload.array("attachments", 5), storyService.createStory);

// GET /api/stories
storyRouter.get("/", authentication, storyService.getStories);

// GET /api/stories/user/:userId
storyRouter.get("/user/:userId", authentication, storyService.getUserStories);

// PATCH /api/stories/:storyId/view
storyRouter.patch("/:storyId/view", authentication, storyService.viewStory);

// DELETE /api/stories/:storyId
storyRouter.delete("/:storyId", authentication, storyService.deleteStory);

export default storyRouter;