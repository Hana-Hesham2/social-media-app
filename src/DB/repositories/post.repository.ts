import { Model } from "mongoose";
import BaseRepository from "./base.repository.js";
import PostModel, { IPost } from "../models/post.model.js";

class PostRepository extends BaseRepository<IPost> {
  constructor(protected readonly model: Model<IPost> = PostModel) {
    super(model);
  }
}

export default PostRepository;