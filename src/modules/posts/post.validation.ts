import * as z from "zod";
import { Allow_Comment_Enum, Availability_Enum, ReactionEnum } from "../../common/enum/post.enum";

export const createPostSchema = z.object({
  body: z.object({
    content: z.string().min(1).optional(),
    availability: z.nativeEnum(Availability_Enum).optional(),
    allowComment: z.nativeEnum(Allow_Comment_Enum).optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const updatePostSchema = z.object({
  body: z.object({
    content: z.string().min(1).optional(),
    availability: z.nativeEnum(Availability_Enum).optional(),
    allowComment: z.nativeEnum(Allow_Comment_Enum).optional(),
    tags: z.array(z.string()).optional(),
  }),
  params: z.object({
    id: z.string(),
  }),
});

export const reactPostSchema = z.object({
  body: z.object({
    type: z.nativeEnum(ReactionEnum),
  }),
  params: z.object({
    id: z.string(),
  }),
});