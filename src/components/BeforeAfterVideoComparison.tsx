import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface BeforeAfterVideoComparisonProps {
  originalFile: File;
  compressedBlob: Blob;
  className?: string;
}

export const BeforeAfterVideoComparison = ({
  originalFile,
  compressedBlob,
  className,
}: BeforeAfterVideoComparisonProps) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const originalVideoUrl = useRef<string>();
  const compressedVideoUrl = useRef<string>();

  useEffect(() => {
    // Create object URLs
    originalVideoUrl.current = URL.createObjectURL(originalFile);
    compressedVideoUrl.current = URL.createObjectURL(compressedBlob);

    return () => {
      // Cleanup URLs
      if (originalVideoUrl.current) URL.revokeObjectURL(originalVideoUrl.current);
      if (compressedVideoUrl.current) URL.revokeObjectURL(compressedVideoUrl.current);
    };
  }, [originalFile, compressedBlob]);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, percentage)));
  };

  const handleMouseDown = () => setIsDragging(true);
  
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-foreground">Before/After Comparison</h3>
        <p className="text-sm text-muted-foreground">
          Drag the slider to compare
        </p>
      </div>
      
      <div
        ref={containerRef}
        className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden select-none"
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        onMouseUp={handleMouseUp}
        onTouchEnd={handleMouseUp}
      >
        {/* Compressed Video (Background - Right Side) */}
        <div className="absolute inset-0">
          <video
            src={compressedVideoUrl.current}
            className="w-full h-full object-contain"
            controls
            playsInline
          />
          <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm px-3 py-1 rounded-md text-sm font-medium text-foreground shadow-lg">
            Compressed
          </div>
        </div>

        {/* Original Video (Foreground - Left Side) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <video
            src={originalVideoUrl.current}
            className="w-full h-full object-contain"
            controls
            playsInline
          />
          <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm px-3 py-1 rounded-md text-sm font-medium text-foreground shadow-lg">
            Original
          </div>
        </div>

        {/* Slider Handle */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-primary cursor-ew-resize z-10"
          style={{ left: `${sliderPosition}%` }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
        >
          {/* Handle Circle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-primary rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform">
            <div className="flex gap-1">
              <div className="w-0.5 h-6 bg-primary-foreground rounded-full" />
              <div className="w-0.5 h-6 bg-primary-foreground rounded-full" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Original: {(originalFile.size / 1024 / 1024).toFixed(2)} MB</span>
        <span>Compressed: {(compressedBlob.size / 1024 / 1024).toFixed(2)} MB</span>
      </div>
    </div>
  );
};
