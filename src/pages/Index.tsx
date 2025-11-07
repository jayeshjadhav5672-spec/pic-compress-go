import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileUploadZone } from "@/components/FileUploadZone";
import { AlgorithmSelector, Algorithm } from "@/components/AlgorithmSelector";
import { ResultsPanel } from "@/components/ResultsPanel";
import { compressImage, downloadBlob, CompressionResult } from "@/lib/compression";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [mode, setMode] = useState<"compress" | "decompress">("compress");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [algorithm, setAlgorithm] = useState<Algorithm>("lz77");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<CompressionResult | null>(null);
  const { toast } = useToast();

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setResult(null);
    toast({
      title: "File selected",
      description: `${file.name} (${(file.size / 1024).toFixed(2)} KB)`,
    });
  };

  const handleCompress = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to compress",
        variant: "destructive",
      });
      return;
    }

    if (!selectedFile.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
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
        description: `File compressed by ${compressionResult.compressionRatio.toFixed(1)}%`,
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-foreground mb-4">
            Smart Compressor
          </h1>
          <p className="text-xl text-muted-foreground">
            {mode === "compress" 
              ? "Compress your files with advanced algorithms" 
              : "Decompress your files"}
          </p>
        </header>

        <div className="flex justify-center gap-4 mb-12">
          <Button
            variant={mode === "compress" ? "default" : "outline"}
            onClick={() => {
              setMode("compress");
              setSelectedFile(null);
              setResult(null);
            }}
            size="lg"
            className="px-8"
          >
            Compress
          </Button>
          <Button
            variant={mode === "decompress" ? "default" : "outline"}
            onClick={() => {
              setMode("decompress");
              setSelectedFile(null);
              setResult(null);
            }}
            size="lg"
            className="px-8"
          >
            Decompress
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <div className="bg-card rounded-xl p-6 border border-border">
              <FileUploadZone onFileSelect={handleFileSelect} mode={mode} />
            </div>

            {mode === "compress" && (
              <div className="bg-card rounded-xl p-6 border border-border">
                <AlgorithmSelector selected={algorithm} onSelect={setAlgorithm} />
              </div>
            )}

            <Button
              onClick={handleCompress}
              disabled={!selectedFile || isProcessing || mode === "decompress"}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              size="lg"
            >
              {isProcessing 
                ? "Processing..." 
                : mode === "compress" 
                ? "Compress File" 
                : "Decompress File"}
            </Button>
          </div>

          <div className="bg-card rounded-xl p-6 border border-border">
            <ResultsPanel
              originalSize={result?.originalSize}
              compressedSize={result?.compressedSize}
              compressionRatio={result?.compressionRatio}
              fileName={result?.fileName}
              onDownload={handleDownload}
              mode={mode}
            />
          </div>
        </div>

        {mode === "decompress" && (
          <div className="mt-8 text-center">
            <p className="text-muted-foreground">
              Note: Decompression feature coming soon. Currently, only compression is available.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
