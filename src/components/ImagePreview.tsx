import { useEffect, useState } from "react";

interface ImagePreviewProps {
  originalFile?: File;
  compressedBlob?: Blob;
  originalSize?: number;
  compressedSize?: number;
}

export const ImagePreview = ({
  originalFile,
  compressedBlob,
  originalSize,
  compressedSize,
}: ImagePreviewProps) => {
  const [originalUrl, setOriginalUrl] = useState<string>("");
  const [compressedUrl, setCompressedUrl] = useState<string>("");

  useEffect(() => {
    if (originalFile) {
      const url = URL.createObjectURL(originalFile);
      setOriginalUrl(url);
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
      <h3 className="text-xl font-semibold text-foreground mb-4">Image Preview</h3>
      
      <div className="grid md:grid-cols-2 gap-4">
        {/* Original Image */}
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
            <img
              src={originalUrl}
              alt="Original"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Compressed Image */}
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
              <img
                src={compressedUrl}
                alt="Compressed"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
