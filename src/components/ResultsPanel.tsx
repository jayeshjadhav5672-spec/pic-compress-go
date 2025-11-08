import { Button } from "@/components/ui/button";
import { Download, Package } from "lucide-react";
import { MediaPreview } from "./MediaPreview";
import { BeforeAfterVideoComparison } from "./BeforeAfterVideoComparison";

interface ResultsPanelProps {
  originalSize?: number;
  compressedSize?: number;
  compressionRatio?: number;
  fileName?: string;
  onDownload?: () => void;
  mode: "compress" | "decompress";
  originalFile?: File;
  compressedBlob?: Blob;
}

export const ResultsPanel = ({
  originalSize,
  compressedSize,
  compressionRatio,
  fileName,
  onDownload,
  mode,
  originalFile,
  compressedBlob,
}: ResultsPanelProps) => {
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  if (!originalSize) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 text-muted-foreground">
        <Package className="w-24 h-24 opacity-50" />
        <p className="text-lg">
          {mode === "compress" ? "Compression results will appear here" : "Decompression results will appear here"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Before/After Video Comparison for videos */}
      {originalFile && compressedBlob && originalFile.type.startsWith('video/') && (
        <BeforeAfterVideoComparison
          originalFile={originalFile}
          compressedBlob={compressedBlob}
        />
      )}

      {/* Media Preview for images or as fallback */}
      {originalFile && compressedBlob && originalFile.type.startsWith('image/') && (
        <MediaPreview
          originalFile={originalFile}
          compressedBlob={compressedBlob}
          originalSize={originalSize}
          compressedSize={compressedSize}
        />
      )}

      <div className="space-y-4">
        <div className="bg-card/50 rounded-lg p-6 border border-border">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Original Size</h3>
          <p className="text-3xl font-bold text-foreground">{formatSize(originalSize)}</p>
        </div>

        {compressedSize && (
          <>
            <div className="bg-card/50 rounded-lg p-6 border border-border">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                {mode === "compress" ? "Compressed Size" : "Decompressed Size"}
              </h3>
              <p className="text-3xl font-bold text-primary">{formatSize(compressedSize)}</p>
            </div>

            {compressionRatio !== undefined && mode === "compress" && (
              <div className="bg-card/50 rounded-lg p-6 border border-border">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Compression Ratio</h3>
                <p className="text-3xl font-bold text-accent">{compressionRatio.toFixed(1)}%</p>
              </div>
            )}
          </>
        )}
      </div>

      {fileName && onDownload && (
        <Button
          onClick={onDownload}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          size="lg"
        >
          <Download className="w-5 h-5 mr-2" />
          Download {mode === "compress" ? "Compressed" : "Decompressed"} File
        </Button>
      )}
    </div>
  );
};
