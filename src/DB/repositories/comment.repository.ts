import { Model } from "mongoose";
import BaseRepository from "./base.repository.js";
import CommentModel, { IComment } from "../models/comment.model.js";

class CommentRepository extends BaseRepository<IComment> {
  constructor(protected readonly model: Model<IComment> = CommentModel) {
    super(model);
  }
}

export default CommentRepository;