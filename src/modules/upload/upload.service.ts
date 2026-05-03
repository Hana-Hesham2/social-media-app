import { Request, Response } from "express";
import {
  uploadFile,
  uploadLargeFile,
  uploadFiles,
  getFile,
  getDownloadUrl,
  deleteFile,
  deleteFolder,
} from "../../common/utils/cloudinary.utils";

export const uploadSingleFile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: "No file uploaded" });
      return;
    }
    const folder = typeof req.body.folder === "string" ? req.body.folder : "general";
    const fileName = req.file.originalname.split(".")[0] ?? "file";
    const result = await uploadFile(req.file.buffer, folder, fileName);

    res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      data: {
        public_id: result.public_id,
        url: result.secure_url,
        format: result.format,
        size: result.bytes,
        width: result.width,
        height: result.height,
      },
    });
  } catch (error: unknown) {
  console.log("UPLOAD ERROR:", error);
  const message = error instanceof Error ? error.message : String(error);
  res.status(500).json({ success: false, message, error });
}
};

export const uploadLargeFileHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: "No file uploaded" });
      return;
    }
    const folder = typeof req.body.folder === "string" ? req.body.folder : "large-files";
    const fileName = req.file.originalname.split(".")[0] ?? "largefile";
    const result = await uploadLargeFile(req.file.buffer, folder, fileName);

    res.status(200).json({
      success: true,
      message: "Large file uploaded successfully",
      data: {
        public_id: result.public_id,
        url: result.secure_url,
        format: result.format,
        size: result.bytes,
      },
    });
  } catch (error: unknown) {
  console.log("UPLOAD ERROR:", error);
  const message = error instanceof Error ? error.message : String(error);
  res.status(500).json({ success: false, message, error });
}
};

export const uploadMultipleFiles = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      res.status(400).json({ success: false, message: "No files uploaded" });
      return;
    }
    const folder = typeof req.body.folder === "string" ? req.body.folder : "multiple";
    const results = await uploadFiles(req.files, folder);

    res.status(200).json({
      success: true,
      message: `${results.length} files uploaded successfully`,
      data: results.map((r) => ({
        public_id: r.public_id,
        url: r.secure_url,
        format: r.format,
        size: r.bytes,
      })),
    });
  } catch (error: unknown) {
  console.log("UPLOAD ERROR:", error);
  const message = error instanceof Error ? error.message : String(error);
  res.status(500).json({ success: false, message, error });
}
};

export const getFileHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const publicId = Array.isArray(req.params["publicId"])
        ? req.params["publicId"][0]
        : req.params["publicId"];
    if (!publicId) {
      res.status(400).json({ success: false, message: "publicId is required" });
      return;
    }
    const rawType = req.query["type"];
    const resourceType: "image" | "video" | "raw" =
      rawType === "video" || rawType === "raw" ? rawType : "image";

    const result = await getFile(publicId, resourceType);
    res.status(200).json({ success: true, message: "File info retrieved", data: result });
  } catch (error: unknown) {
  console.log("UPLOAD ERROR:", error);
  const message = error instanceof Error ? error.message : String(error);
  res.status(500).json({ success: false, message, error });
}
};

export const downloadFileHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const publicId = Array.isArray(req.params["publicId"])
    ? req.params["publicId"][0]
    : req.params["publicId"];
    if (!publicId) {
      res.status(400).json({ success: false, message: "publicId is required" });
      return;
    }
    const rawType = req.query["type"];
    const resourceType: "image" | "video" | "raw" =
      rawType === "image" || rawType === "video" ? rawType : "raw";
    const attachmentName =
      typeof req.query["name"] === "string" ? req.query["name"] : undefined;

    const downloadUrl = getDownloadUrl(publicId, resourceType, attachmentName);
    res.status(200).json({ success: true, message: "Download URL generated", data: { downloadUrl } });
  } catch (error: unknown) {
  console.log("UPLOAD ERROR:", error);
  const message = error instanceof Error ? error.message : String(error);
  res.status(500).json({ success: false, message, error });
}
};

export const deleteFileHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const publicId = Array.isArray(req.params["publicId"])
      ? req.params["publicId"][0]
      : req.params["publicId"];
    if (!publicId) {
      res.status(400).json({ success: false, message: "publicId is required" });
      return;
    }
    const rawType = req.query["type"];
    const resourceType: "image" | "video" | "raw" =
      rawType === "video" || rawType === "raw" ? rawType : "image";

    const result = await deleteFile(publicId, resourceType);
    if (result.result !== "ok") {
      res.status(404).json({ success: false, message: "File not found or already deleted" });
      return;
    }
    res.status(200).json({ success: true, message: "File deleted successfully" });
  } catch (error: unknown) {
  console.log("UPLOAD ERROR:", error);
  const message = error instanceof Error ? error.message : String(error);
  res.status(500).json({ success: false, message, error });
}
};

export const deleteFolderHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const folderPath = typeof req.body.folderPath === "string" ? req.body.folderPath : null;
    if (!folderPath) {
      res.status(400).json({ success: false, message: "folderPath is required in body" });
      return;
    }
    const result = await deleteFolder(folderPath);
    res.status(200).json({
      success: true,
      message: "Folder and all contents deleted successfully",
      data: result,
    });
  } catch (error: unknown) {
  console.log("UPLOAD ERROR:", error);
  const message = error instanceof Error ? error.message : String(error);
  res.status(500).json({ success: false, message, error });
}
};