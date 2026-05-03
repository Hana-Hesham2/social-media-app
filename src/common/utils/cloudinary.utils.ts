import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { Readable } from "node:stream";
import multer from "multer";

// UPLOAD small FILE 
export const uploadFile = async (
  fileBuffer: Buffer,
  folder: string,
  fileName: string,
  resourceType: "image" | "video" | "raw" | "auto" = "auto"
) => {
  return new Promise<UploadApiResponse>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: fileName,
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error("Upload failed"));
        resolve(result);
      }
    );

    const readable = Readable.from(fileBuffer);
    readable.pipe(uploadStream);
  });
};

// UPLOAD LARGE FILE (chunks)
export const uploadLargeFile = async (
  fileBuffer: Buffer,
  folder: string,
  fileName: string,
  resourceType: "image" | "video" | "raw" | "auto" = "auto"
) => {
  return new Promise<UploadApiResponse>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_chunked_stream(
      {
        folder,
        public_id: fileName,
        resource_type: resourceType,
        chunk_size: 6000000, // 6MB per chunk
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error("Upload failed"));
        resolve(result);
      }
    );

    const readable = Readable.from(fileBuffer);
    readable.pipe(uploadStream);
  });
};

// UPLOAD MULTIPLE FILES

export const uploadFiles = async (
  files: Express.Multer.File[],
  folder: string,
  resourceType: "image" | "video" | "raw" | "auto" = "auto"
) => {
  const uploadPromises = files.map((file) =>
    uploadFile(file.buffer, folder, file.originalname, resourceType)
  );
  return Promise.all(uploadPromises);
};

// GET FILE

export const getFile = async (publicId: string, resourceType: "image" | "video" | "raw" = "image") => {
  const result = await cloudinary.api.resource(publicId, {
    resource_type: resourceType,
  });
  return result;
};


// DOWNLOAD FILE 

export const getDownloadUrl = (
  publicId: string,
  resourceType: "image" | "video" | "raw" = "raw",
  attachmentName?: string
) => {
  const url = cloudinary.url(publicId, {
    resource_type: resourceType,
    flags: "attachment" + (attachmentName ? `:${attachmentName}` : ""),
    sign_url: true, 
  });
  return url;
};


// DELETE FILE

export const deleteFile = async (
  publicId: string,
  resourceType: "image" | "video" | "raw" = "image"
) => {
  const result = await cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
  });
  return result; 
};


// DELETE FOLDER

export const deleteFolder = async (folderPath: string) => {

    const resources = await cloudinary.api.resources({
    type: "upload",
    prefix: folderPath,
    max_results: 500,
  });

  if (resources.resources.length > 0) {
    const publicIds = resources.resources.map((r: any) => r.public_id);
    await cloudinary.api.delete_resources(publicIds);
  }

  const result = await cloudinary.api.delete_folder(folderPath);
  return result;
};