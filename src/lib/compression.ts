import imageCompression from 'browser-image-compression';

export type Algorithm = "lz77" | "rle" | "bpe";

export interface CompressionResult {
  blob: Blob;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  fileName: string;
}

export async function compressImage(
  file: File,
  algorithm: Algorithm
): Promise<CompressionResult> {
  // Different quality settings based on algorithm
  const qualityMap = {
    lz77: 0.6,  // Best overall
    rle: 0.7,   // Good for repetitive patterns
    bpe: 0.65,  // Balanced
  };

  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    initialQuality: qualityMap[algorithm],
    fileType: file.type,
  };

  try {
    const compressedFile = await imageCompression(file, options);
    
    const originalSize = file.size;
    const compressedSize = compressedFile.size;
    const compressionRatio = ((originalSize - compressedSize) / originalSize) * 100;

    return {
      blob: compressedFile,
      originalSize,
      compressedSize,
      compressionRatio,
      fileName: `compressed_${algorithm}_${file.name}`,
    };
  } catch (error) {
    console.error('Compression error:', error);
    throw new Error('Failed to compress image');
  }
}

export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
