import mongoose, { Types } from "mongoose";
import { Allow_Comment_Enum, Availability_Enum, ReactionEnum } from "../../common/enum/post.enum";

export interface IReaction {
  userId: Types.ObjectId;
  type: ReactionEnum;
}

export interface IPost {
  _id?: Types.ObjectId;
  content?: string;
  attachments?: string[];
  createdBy?: Types.ObjectId;
  tags?: Types.ObjectId[];
  reactions?: IReaction[];
  allowComment?: Allow_Comment_Enum;
  availability?: Availability_Enum;
  folderId?: string;
  isDeleted?: boolean;
  deletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const PostSchema = new mongoose.Schema<IPost>(
  {
    content: {
      type: String,
      min: 1,
      required: function (this: IPost) {
        return !this.attachments?.length;
      },
    },
    attachments: [String],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    reactions: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        type: { type: String, enum: Object.values(ReactionEnum), required: true },
      },
    ],
    allowComment: {
      type: String,
      enum: Object.values(Allow_Comment_Enum),
      default: Allow_Comment_Enum.allow,
    },
    availability: {
      type: String,
      enum: Object.values(Availability_Enum),
      default: Availability_Enum.public,
    },
    folderId: { type: String },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    strictQuery: true,
  }
);

// Soft delete hook
PostSchema.pre(/^find/, function () {
  const query = this as mongoose.Query<unknown, IPost>;
  const conditions = query.getQuery();
  if (conditions["paranoid"] === false) {
    const { paranoid, ...rest } = conditions;
    query.setQuery(rest);
  } else {
    query.setQuery({ ...conditions, isDeleted: false });
  }
});

// Hard delete cascade hook
PostSchema.pre("findOneAndDelete", async function () {
  const post = await this.model.findOne(this.getQuery());
  if (post) {
    await mongoose.model("Comment").deleteMany({ postId: post._id });
  }
});

const PostModel = mongoose.models.Post || mongoose.model<IPost>("Post", PostSchema);

export default PostModel;