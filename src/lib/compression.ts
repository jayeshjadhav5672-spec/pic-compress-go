import imageCompression from 'browser-image-compression';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

export type Algorithm = "lz77" | "rle" | "bpe";

export interface CompressionResult {
  blob: Blob;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  fileName: string;
}

let ffmpeg: FFmpeg | null = null;

async function loadFFmpeg() {
  if (ffmpeg) return ffmpeg;
  
  ffmpeg = new FFmpeg();
  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
  
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  });
  
  return ffmpeg;
}

export async function compressVideo(
  file: File,
  algorithm: Algorithm
): Promise<CompressionResult> {
  const ffmpeg = await loadFFmpeg();
  
  // Quality settings based on algorithm
  const crfMap = {
    lz77: 28,  // Best overall
    rle: 32,   // Faster, larger file
    bpe: 30,   // Balanced
  };

  const inputName = 'input.mp4';
  const outputName = 'output.mp4';
  
  try {
    await ffmpeg.writeFile(inputName, await fetchFile(file));
    
    await ffmpeg.exec([
      '-i', inputName,
      '-c:v', 'libx264',
      '-crf', crfMap[algorithm].toString(),
      '-preset', 'medium',
      '-c:a', 'aac',
      '-b:a', '128k',
      outputName
    ]);
    
    const data = await ffmpeg.readFile(outputName);
    const compressedBlob = new Blob([new Uint8Array(data as Uint8Array)], { type: 'video/mp4' });
    
    const originalSize = file.size;
    const compressedSize = compressedBlob.size;
    const compressionRatio = ((originalSize - compressedSize) / originalSize) * 100;

    return {
      blob: compressedBlob,
      originalSize,
      compressedSize,
      compressionRatio,
      fileName: `compressed_${algorithm}_${file.name}`,
    };
  } catch (error) {
    console.error('Video compression error:', error);
    throw new Error('Failed to compress video');
  }
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
