// src/shared/services/file-upload.service.ts
import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class FileUploadService {
  private readonly logger = new Logger(FileUploadService.name);

  /**
   * Convert Multer file to Blob for fetch upload
   */
  async createBlobForUpload(file: Express.Multer.File): Promise<Blob> {
    try {
      // Handle different buffer types
      let arrayBuffer: ArrayBuffer;

      if (file.buffer.buffer instanceof SharedArrayBuffer) {
        // Copy SharedArrayBuffer to regular ArrayBuffer
        arrayBuffer = new ArrayBuffer(file.buffer.byteLength);
        const targetView = new Uint8Array(arrayBuffer);
        targetView.set(file.buffer);
      } else {
        // Regular ArrayBuffer - slice to get correct portion
        arrayBuffer = file.buffer.buffer.slice(
          file.buffer.byteOffset,
          file.buffer.byteOffset + file.buffer.byteLength,
        );
      }

      return new Blob([arrayBuffer], { type: file.mimetype });
    } catch (error) {
      this.logger.error('Failed to create blob:', error);
      throw new HttpException(
        'Failed to process file for upload',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Create FormData with multiple files
   */
  async createFormDataWithFiles(
    files: Express.Multer.File[],
    additionalData: Record<string, string> = {},
  ): Promise<FormData> {
    const formData = new FormData();

    // Add files
    for (const file of files) {
      const blob = await this.createBlobForUpload(file);
      formData.append('files', blob, file.originalname);
    }

    // Add additional data
    for (const [key, value] of Object.entries(additionalData)) {
      formData.append(key, value);
    }

    return formData;
  }

  /**
   * Upload files to external service
   */
  async uploadToExternalService(
    url: string,
    formData: FormData,
    headers: Record<string, string> = {},
    timeout: number = 30000,
  ): Promise<any> {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          ...headers,
          // Don't set Content-Type for FormData - let fetch set it with boundary
        },
        body: formData,
        signal: AbortSignal.timeout(timeout),
      });

      console.log('adsjfhdaskfhsjfhsdfdfa', response);
      if (!response.ok) {
        await response.text();
        throw new HttpException(
          `Upload failed: ${response.statusText}`,
          response.status,
        );
      }

      return await response.json();
    } catch (error) {
      if (error.name === 'TimeoutError') {
        throw new HttpException('Upload timeout', HttpStatus.REQUEST_TIMEOUT);
      }
      throw error;
    }
  }
}
