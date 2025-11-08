import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileUploadZone } from "@/components/FileUploadZone";
import { AlgorithmSelector, Algorithm } from "@/components/AlgorithmSelector";
import { ResultsPanel } from "@/components/ResultsPanel";
import { compressImage, downloadBlob, CompressionResult } from "@/lib/compression";
import { useToast } from "@/hooks/use-toast";
import { Image } from "lucide-react";

export const ImageCompressionSection = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [algorithm, setAlgorithm] = useState<Algorithm>("lz77");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<CompressionResult | null>(null);
  const { toast } = useToast();

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (JPG, PNG, WebP, etc.)",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedFile(file);
    setResult(null);
    toast({
      title: "Image selected",
      description: `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`,
    });
  };

  const handleCompress = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select an image to compress",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const compressionResult = await compressImage(selectedFile, algorithm);
      
      setResult(compressionResult);
      toast({
        title: "Compression successful!",
        description: `Image compressed by ${compressionResult.compressionRatio.toFixed(1)}%`,
      });
    } catch (error) {
      toast({
        title: "Compression failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (result) {
      downloadBlob(result.blob, result.fileName);
      toast({
        title: "Download started",
        description: `Downloading ${result.fileName}`,
      });
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
          <Image className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Image Compression</h2>
        <p className="text-muted-foreground">
          Compress your images with advanced algorithms while maintaining quality
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <div className="bg-card rounded-xl p-6 border border-border">
            <FileUploadZone 
              onFileSelect={handleFileSelect} 
              mode="compress"
              acceptedTypes="image/*"
              title="Select Image"
              description="Drag and drop your image here"
            />
          </div>

          <div className="bg-card rounded-xl p-6 border border-border">
            <AlgorithmSelector selected={algorithm} onSelect={setAlgorithm} />
          </div>

          <Button
            onClick={handleCompress}
            disabled={!selectedFile || isProcessing}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            size="lg"
          >
            {isProcessing ? "Compressing..." : "Compress Image"}
          </Button>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border">
          <ResultsPanel
            originalSize={result?.originalSize}
            compressedSize={result?.compressedSize}
            compressionRatio={result?.compressionRatio}
            fileName={result?.fileName}
            onDownload={handleDownload}
            mode="compress"
            originalFile={selectedFile || undefined}
            compressedBlob={result?.blob}
          />
        </div>
      </div>
    </div>
  );
};
