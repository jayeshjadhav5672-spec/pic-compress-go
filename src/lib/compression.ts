import imageCompression from 'browser-image-compression';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { PDFDocument } from 'pdf-lib';

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
  
  // Add logging to track FFmpeg operations
  ffmpeg.on('log', ({ message }) => {
    console.log('[FFmpeg]:', message);
  });

  ffmpeg.on('progress', ({ progress, time }) => {
    console.log('[FFmpeg Progress]:', `${Math.round(progress * 100)}%`, `Time: ${time}ms`);
  });
  
  console.log('[FFmpeg] Loading FFmpeg WASM...');
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  });
  console.log('[FFmpeg] FFmpeg loaded successfully');
  
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
      crf: 23,        // Best quality (lower = better quality)
      preset: 'slow', // Better compression
      videoBitrate: '1M',
      audioBitrate: '128k',
    },
    rle: {
      crf: 28,        // Faster compression
      preset: 'fast',
      videoBitrate: '800k',
      audioBitrate: '96k',
    },
    bpe: {
      crf: 26,        // Balanced
      preset: 'medium',
      videoBitrate: '900k',
      audioBitrate: '112k',
    },
  };

  const settings = compressionSettings[algorithm];
  const inputName = 'input.mp4';
  const outputName = 'output.mp4';
  
  try {
    console.log('[Video Compression] Starting compression with algorithm:', algorithm);
    console.log('[Video Compression] Original file size:', (file.size / 1024 / 1024).toFixed(2), 'MB');
    
    await ffmpeg.writeFile(inputName, await fetchFile(file));
    console.log('[Video Compression] File written to FFmpeg');
    
    // Enhanced compression with better settings
    const ffmpegArgs = [
      '-i', inputName,
      // Video codec with optimal settings
      '-c:v', 'libx264',
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
      // Optimization flags for H.264
      '-profile:v', 'high',
      '-level', '4.0',
      '-threads', '0',
      outputName
    ];
    
    console.log('[Video Compression] Running FFmpeg with args:', ffmpegArgs.join(' '));
    await ffmpeg.exec(ffmpegArgs);
    console.log('[Video Compression] FFmpeg execution completed');
    
    const data = await ffmpeg.readFile(outputName);
    const compressedBlob = new Blob([new Uint8Array(data as Uint8Array)], { type: 'video/mp4' });
    
    const originalSize = file.size;
    const compressedSize = compressedBlob.size;
    const compressionRatio = ((originalSize - compressedSize) / originalSize) * 100;

    console.log('[Video Compression] Compressed size:', (compressedSize / 1024 / 1024).toFixed(2), 'MB');
    console.log('[Video Compression] Compression ratio:', compressionRatio.toFixed(2), '%');

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
    console.error('[Video Compression] Error details:', error);
    if (error instanceof Error) {
      throw new Error(`Video compression failed: ${error.message}`);
    }
    throw new Error('Failed to compress video. Please check console for details.');
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

export async function compressPDF(
  file: File,
  algorithm: Algorithm
): Promise<CompressionResult> {
  try {
    console.log('[PDF Compression] Starting compression with algorithm:', algorithm);
    console.log('[PDF Compression] Original file size:', (file.size / 1024 / 1024).toFixed(2), 'MB');
    
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    
    // Compression settings based on algorithm
    const compressionSettings = {
      lz77: { objectsPerTick: 50, useObjectStreams: true },
      rle: { objectsPerTick: 100, useObjectStreams: false },
      bpe: { objectsPerTick: 75, useObjectStreams: true },
    };
    
    const settings = compressionSettings[algorithm];
    
    // Save with compression settings
    const compressedPdfBytes = await pdfDoc.save({
      useObjectStreams: settings.useObjectStreams,
      objectsPerTick: settings.objectsPerTick,
    });
    
    const compressedBlob = new Blob([new Uint8Array(compressedPdfBytes)], { type: 'application/pdf' });
    
    const originalSize = file.size;
    const compressedSize = compressedBlob.size;
    const compressionRatio = ((originalSize - compressedSize) / originalSize) * 100;
    
    console.log('[PDF Compression] Compressed size:', (compressedSize / 1024 / 1024).toFixed(2), 'MB');
    console.log('[PDF Compression] Compression ratio:', compressionRatio.toFixed(2), '%');
    
    return {
      blob: compressedBlob,
      originalSize,
      compressedSize,
      compressionRatio,
      fileName: `compressed_${algorithm}_${file.name}`,
    };
  } catch (error) {
    console.error('[PDF Compression] Error details:', error);
    if (error instanceof Error) {
      throw new Error(`PDF compression failed: ${error.message}`);
    }
    throw new Error('Failed to compress PDF. Please check console for details.');
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
