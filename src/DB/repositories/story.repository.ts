import { Model } from "mongoose";
import BaseRepository from "./base.repository.js";
import StoryModel, { IStory } from "../models/story.model.js";

class StoryRepository extends BaseRepository<IStory> {
  constructor(protected readonly model: Model<IStory> = StoryModel) {
    super(model);
  }
}

export default StoryRepository;