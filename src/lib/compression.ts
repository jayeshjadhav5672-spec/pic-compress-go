import imageCompression from 'browser-image-compression';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

export type Algorithm = "lz77" | "rle" | "bpe" | "h265";

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
  
  // Advanced compression settings based on algorithm
  const compressionSettings = {
    lz77: {
      codec: 'libx264',
      crf: 23,        // Best quality (lower = better quality)
      preset: 'slow', // Better compression
      videoBitrate: '1M',
      audioBitrate: '128k',
    },
    rle: {
      codec: 'libx264',
      crf: 28,        // Faster compression
      preset: 'fast',
      videoBitrate: '800k',
      audioBitrate: '96k',
    },
    bpe: {
      codec: 'libx264',
      crf: 26,        // Balanced
      preset: 'medium',
      videoBitrate: '900k',
      audioBitrate: '112k',
    },
    h265: {
      codec: 'libx265',
      crf: 28,        // H.265 with CRF 28 gives similar quality to H.264 CRF 23
      preset: 'medium', // Balanced for H.265
      videoBitrate: '700k', // 30-50% smaller than H.264
      audioBitrate: '128k',
    },
  };

  const settings = compressionSettings[algorithm];
  const inputName = 'input.mp4';
  const outputName = 'output.mp4';
  
  try {
    await ffmpeg.writeFile(inputName, await fetchFile(file));
    
    // Enhanced compression with better settings
    const ffmpegArgs = [
      '-i', inputName,
      // Video codec with optimal settings
      '-c:v', settings.codec,
      '-crf', settings.crf.toString(),
      '-preset', settings.preset,
      '-b:v', settings.videoBitrate,
      // Optimize for web streaming
      '-movflags', '+faststart',
      // Better pixel format for compatibility
      '-pix_fmt', 'yuv420p',
      // Scale down if too large (maintains aspect ratio)
      '-vf', 'scale=\'min(1920,iw)\':\'min(1080,ih)\':force_original_aspect_ratio=decrease',
      // Audio codec with optimal settings
      '-c:a', 'aac',
      '-b:a', settings.audioBitrate,
      '-ar', '44100',
    ];

    // Add codec-specific optimization flags
    if (settings.codec === 'libx264') {
      ffmpegArgs.push('-profile:v', 'high', '-level', '4.0');
    } else if (settings.codec === 'libx265') {
      ffmpegArgs.push('-tag:v', 'hvc1'); // Better compatibility for H.265
    }

    ffmpegArgs.push('-threads', '0', outputName);
    
    await ffmpeg.exec(ffmpegArgs);
    
    const data = await ffmpeg.readFile(outputName);
    const compressedBlob = new Blob([new Uint8Array(data as Uint8Array)], { type: 'video/mp4' });
    
    const originalSize = file.size;
    const compressedSize = compressedBlob.size;
    const compressionRatio = ((originalSize - compressedSize) / originalSize) * 100;

    // Clean up
    await ffmpeg.deleteFile(inputName);
    await ffmpeg.deleteFile(outputName);

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
    lz77: 0.6,   // Best overall
    rle: 0.7,    // Good for repetitive patterns
    bpe: 0.65,   // Balanced
    h265: 0.6,   // High quality for images
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
