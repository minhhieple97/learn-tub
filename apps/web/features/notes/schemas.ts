/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";

// TipTap/ProseMirror node schemas
const textNodeSchema = z.object({
  type: z.literal("text"),
  text: z.string(),
  marks: z.array(z.any()).optional(),
});

const imageAttrsSchema = z.object({
  src: z.string().url("Invalid image URL"),
  alt: z.string().optional(),
  title: z.string().optional(),
  width: z.union([z.string(), z.number()]).optional(),
  height: z.union([z.string(), z.number()]).optional(),
});

const imageNodeSchema = z.object({
  type: z.literal("image"),
  attrs: imageAttrsSchema,
});

const paragraphNodeSchema = z.object({
  type: z.literal("paragraph"),
  content: z.array(textNodeSchema).optional(),
});

const headingNodeSchema = z.object({
  type: z.literal("heading"),
  attrs: z.object({
    level: z.number().min(1).max(6),
  }),
  content: z.array(textNodeSchema).optional(),
});

const blockquoteNodeSchema = z.object({
  type: z.literal("blockquote"),
  content: z
    .array(z.union([paragraphNodeSchema, headingNodeSchema]))
    .optional(),
});

const bulletListNodeSchema = z.object({
  type: z.literal("bulletList"),
  content: z
    .array(
      z.object({
        type: z.literal("listItem"),
        content: z.array(paragraphNodeSchema).optional(),
      }),
    )
    .optional(),
});

const orderedListNodeSchema = z.object({
  type: z.literal("orderedList"),
  attrs: z
    .object({
      start: z.number().optional(),
    })
    .optional(),
  content: z
    .array(
      z.object({
        type: z.literal("listItem"),
        content: z.array(paragraphNodeSchema).optional(),
      }),
    )
    .optional(),
});

const hardBreakNodeSchema = z.object({
  type: z.literal("hardBreak"),
});

const codeBlockNodeSchema = z.object({
  type: z.literal("codeBlock"),
  attrs: z
    .object({
      language: z.string().optional(),
    })
    .optional(),
  content: z.array(textNodeSchema).optional(),
});

// Union of all possible content nodes
const contentNodeSchema: z.ZodType<any> = z.lazy(() =>
  z.union([
    paragraphNodeSchema,
    headingNodeSchema,
    blockquoteNodeSchema,
    bulletListNodeSchema,
    orderedListNodeSchema,
    imageNodeSchema,
    hardBreakNodeSchema,
    codeBlockNodeSchema,
  ]),
);

const documentContentSchema = z.object({
  type: z.literal("doc"),
  content: z.array(contentNodeSchema).optional(),
});

// TypeScript type exports
export type TextNode = z.infer<typeof textNodeSchema>;
export type ImageAttrs = z.infer<typeof imageAttrsSchema>;
export type ImageNode = z.infer<typeof imageNodeSchema>;
export type ParagraphNode = z.infer<typeof paragraphNodeSchema>;
export type HeadingNode = z.infer<typeof headingNodeSchema>;
export type BlockquoteNode = z.infer<typeof blockquoteNodeSchema>;
export type BulletListNode = z.infer<typeof bulletListNodeSchema>;
export type OrderedListNode = z.infer<typeof orderedListNodeSchema>;
export type HardBreakNode = z.infer<typeof hardBreakNodeSchema>;
export type CodeBlockNode = z.infer<typeof codeBlockNodeSchema>;
export type ContentNode = z.infer<typeof contentNodeSchema>;
export type DocumentContent = z.infer<typeof documentContentSchema>;

// Main schema type exports
export type Note = z.infer<typeof noteSchema>;
export type CreateNotePayload = z.infer<typeof createNotePayloadSchema>;
export type UpdateNotePayload = z.infer<typeof updateNotePayloadSchema>;
export type SaveNoteInput = z.infer<typeof saveNoteInputSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteInputSchema>;
export type DeleteNoteInput = z.infer<typeof deleteNoteInputSchema>;

export const noteSchema = z.object({
  id: z.string().uuid(),
  content: z.string().min(1, "Content is required"),
  timestamp_seconds: z.number().min(0),
  tags: z.array(z.string()).default([]),
  created_at: z.string(),
  updated_at: z.string(),
  video_id: z.string().uuid().optional(),
  user_id: z.string().uuid().optional(),
});

export const createNotePayloadSchema = z.object({
  video_id: z.string().uuid(),
  user_id: z.string().uuid(),
  content: z.string().min(1, "Content is required"),
  timestamp_seconds: z.number().min(0),
  tags: z.array(z.string()).default([]),
});

export const updateNotePayloadSchema = z.object({
  content: z.string().min(1, "Content is required"),
  tags: z.array(z.string()).default([]),
  updated_at: z.string(),
});

export const noteEditorPropsSchema = z.object({
  videoId: z.string().min(1),
  currentTimestamp: z.number().min(0),
  onTimestampClick: z.function().args(z.number()).returns(z.void()).optional(),
});

export const saveNoteInputSchema = z.object({
  videoId: z.string().uuid("Invalid video ID"),
  content: documentContentSchema,
  timestamp: z.number().min(0, "Timestamp must be positive"),
  tags: z.array(z.string().min(1).max(50)).max(10, "Too many tags").default([]),
});

export const updateNoteInputSchema = z.object({
  noteId: z.string().uuid("Invalid note ID"),
  content: documentContentSchema,
  tags: z.array(z.string().min(1).max(50)).max(10, "Too many tags").default([]),
});

export const deleteNoteInputSchema = z.object({
  noteId: z.string().uuid("Invalid note ID"),
});

export const EvaluateNoteQuerySchema = z.object({
  noteId: z.string().uuid("Invalid note ID format"),
  aiModelId: z.string().uuid("Invalid AI Model ID"),
});

export const uploadScreenshotInputSchema = z.object({
  fileData: z.string(), // base64 encoded file data
  fileName: z.string().min(1, "File name is required"),
  fileSize: z.number().positive("File size must be positive"),
  mimeType: z.string().min(1, "MIME type is required"),
});

export const saveScreenshotMetadataInputSchema = z.object({
  videoId: z.string().uuid("Invalid video ID"),
  fileName: z.string().min(1, "File name is required"),
  fileSize: z.number().positive("File size must be positive"),
  width: z.number().positive("Width must be positive"),
  height: z.number().positive("Height must be positive"),
  timestamp: z.number().min(0, "Timestamp must be non-negative"),
  videoTitle: z.string().optional(),
});

export const captureAndSaveScreenshotInputSchema = z.object({
  videoId: z.string().uuid("Invalid video ID"),
  fileData: z.string(), // base64 encoded canvas data
  fileName: z.string().min(1, "File name is required"),
  fileSize: z.number().positive("File size must be positive"),
  width: z.number().positive("Width must be positive"),
  height: z.number().positive("Height must be positive"),
  timestamp: z.number().min(0, "Timestamp must be non-negative"),
  videoTitle: z.string().optional(),
  noteId: z.string().uuid().optional(),
});

export const handleImagePasteInputSchema = z.object({
  fileData: z.string(), // base64 encoded file data
  fileName: z.string().min(1, "File name is required"),
  fileSize: z.number().positive("File size must be positive"),
  mimeType: z.string().min(1, "MIME type is required"),
});

export const deleteImageInputSchema = z.object({
  imageUrl: z.string().url("Invalid image URL"),
  storagePath: z.string().min(1, "Storage path is required"),
});
