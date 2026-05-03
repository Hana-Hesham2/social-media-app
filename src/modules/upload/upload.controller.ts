import { Router } from "express";
import { upload, uploadLarge } from "../../common/middleware/multer.middleware";
import {
  uploadSingleFile,
  uploadLargeFileHandler,
  uploadMultipleFiles,
  getFileHandler,
  downloadFileHandler,
  deleteFileHandler,
  deleteFolderHandler,
} from "./upload.service";

const router = Router();

router.post("/single", upload.single("file"), uploadSingleFile);
router.post("/large", uploadLarge.single("file"), uploadLargeFileHandler);
router.post("/multiple", upload.array("files", 10), uploadMultipleFiles);
router.get("/file/:publicId", getFileHandler);
router.get("/download/:publicId", downloadFileHandler);
router.delete("/file/:publicId", deleteFileHandler);
router.delete("/folder", deleteFolderHandler);

export default router;