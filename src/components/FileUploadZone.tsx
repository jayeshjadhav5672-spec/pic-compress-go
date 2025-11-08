import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface FileUploadZoneProps {
  onFileSelect: (file: File) => void;
  mode: "compress" | "decompress";
  acceptedTypes?: string;
  title?: string;
  description?: string;
}

export const FileUploadZone = ({ 
  onFileSelect, 
  mode, 
  acceptedTypes = "image/*,video/*",
  title,
  description 
}: FileUploadZoneProps) => {
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      const files = e.dataTransfer.files;
      if (files && files[0]) {
        onFileSelect(files[0]);
      }
    },
    [onFileSelect]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files[0]) {
        onFileSelect(files[0]);
      }
    },
    [onFileSelect]
  );

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground">
        {title || (mode === "compress" ? "Select File" : "Select Compressed File")}
      </h2>
      
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="border-2 border-dashed border-border rounded-lg p-12 flex flex-col items-center justify-center gap-4 bg-card/50 hover:bg-card/70 transition-colors cursor-pointer"
      >
        <Upload className="w-12 h-12 text-primary" />
        <p className="text-foreground font-medium">
          {description || (mode === "compress" 
            ? "Drag and drop your file here" 
            : "Drag and drop your compressed file here")}
        </p>
        <p className="text-muted-foreground">or</p>
        <label htmlFor="file-input">
          <Button variant="outline" className="cursor-pointer" asChild>
            <span>Browse Files</span>
          </Button>
        </label>
        <input
          id="file-input"
          type="file"
          accept={acceptedTypes}
          onChange={handleFileInput}
          className="hidden"
        />
      </div>
    </div>
  );
};
