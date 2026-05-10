import * as z from "zod";
import { ReactionEnum } from "../../common/enum/post.enum.js";

export const createCommentSchema = z.object({
  body: z.object({
    content: z.string().min(1).optional(),
    parentComment: z.string().optional(),
  }),
  params: z.object({
    postId: z.string(),
  }),
});

export const updateCommentSchema = z.object({
  body: z.object({
    content: z.string().min(1).optional(),
  }),
  params: z.object({
    postId: z.string(),
    commentId: z.string(),
  }),
});

export const reactCommentSchema = z.object({
  body: z.object({
    type: z.nativeEnum(ReactionEnum),
  }),
  params: z.object({
    postId: z.string(),
    commentId: z.string(),
  }),
});

export type CreateCommentDTO = z.infer<typeof createCommentSchema.shape.body>;
export type UpdateCommentDTO = z.infer<typeof updateCommentSchema.shape.body>;
export type ReactCommentDTO = z.infer<typeof reactCommentSchema.shape.body>;