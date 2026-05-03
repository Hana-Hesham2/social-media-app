

export interface UploadResponse {
  success: boolean;
  message: string;
  data?: object;
  error?: string;
}

export interface FileData {
  public_id: string;
  url: string;
  format: string;
  size: number;
  width?: number;
  height?: number;
}