import mongoose, { Types } from "mongoose";
import { ReactionEnum } from "../../common/enum/post.enum";

export interface IReaction {
  userId: Types.ObjectId;
  type: ReactionEnum;
}

export interface IComment {
  _id?: Types.ObjectId;
  content?: string;
  attachments?: string[];
  createdBy?: Types.ObjectId;
  postId?: Types.ObjectId;
  parentComment?: Types.ObjectId;
  reactions?: IReaction[];
  isDeleted?: boolean;
  deletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const CommentSchema = new mongoose.Schema<IComment>(
  {
    content: {
      type: String,
      required: function (this: IComment) {
        return !this.attachments?.length;
      },
    },
    attachments: [String],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
    parentComment: { type: mongoose.Schema.Types.ObjectId, ref: "Comment" },
    reactions: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        type: { type: String, enum: Object.values(ReactionEnum), required: true },
      },
    ],
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
CommentSchema.pre(/^find/, function () {
  const query = this as mongoose.Query<unknown, IComment>;
  const conditions = query.getQuery();
  if (conditions["paranoid"] === false) {
    const { paranoid, ...rest } = conditions;
    query.setQuery(rest);
  } else {
    query.setQuery({ ...conditions, isDeleted: false });
  }
});

const CommentModel =
  mongoose.models.Comment || mongoose.model<IComment>("Comment", CommentSchema);

export default CommentModel;