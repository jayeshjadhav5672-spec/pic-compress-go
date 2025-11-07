import { useEffect, useState } from "react";

interface MediaPreviewProps {
  originalFile?: File;
  compressedBlob?: Blob;
  originalSize?: number;
  compressedSize?: number;
}

export const MediaPreview = ({
  originalFile,
  compressedBlob,
  originalSize,
  compressedSize,
}: MediaPreviewProps) => {
  const [originalUrl, setOriginalUrl] = useState<string>("");
  const [compressedUrl, setCompressedUrl] = useState<string>("");
  const [isVideo, setIsVideo] = useState(false);

  useEffect(() => {
    if (originalFile) {
      const url = URL.createObjectURL(originalFile);
      setOriginalUrl(url);
      setIsVideo(originalFile.type.startsWith('video/'));
      return () => URL.revokeObjectURL(url);
    }
  }, [originalFile]);

  useEffect(() => {
    if (compressedBlob) {
      const url = URL.createObjectURL(compressedBlob);
      setCompressedUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [compressedBlob]);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  if (!originalFile) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-foreground mb-4">
        {isVideo ? 'Video Preview' : 'Image Preview'}
      </h3>
      
      <div className="grid md:grid-cols-2 gap-4">
        {/* Original Media */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Original</span>
            {originalSize && (
              <span className="text-sm font-medium text-foreground">
                {formatSize(originalSize)}
              </span>
            )}
          </div>
          <div className="relative aspect-video bg-card/30 rounded-lg overflow-hidden border border-border">
            {isVideo ? (
              <video
                src={originalUrl}
                controls
                className="w-full h-full object-contain"
              />
            ) : (
              <img
                src={originalUrl}
                alt="Original"
                className="w-full h-full object-contain"
              />
            )}
          </div>
        </div>

        {/* Compressed Media */}
        {compressedUrl && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Compressed</span>
              {compressedSize && (
                <span className="text-sm font-medium text-primary">
                  {formatSize(compressedSize)}
                </span>
              )}
            </div>
            <div className="relative aspect-video bg-card/30 rounded-lg overflow-hidden border border-border">
              {isVideo ? (
                <video
                  src={compressedUrl}
                  controls
                  className="w-full h-full object-contain"
                />
              ) : (
                <img
                  src={compressedUrl}
                  alt="Compressed"
                  className="w-full h-full object-contain"
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
