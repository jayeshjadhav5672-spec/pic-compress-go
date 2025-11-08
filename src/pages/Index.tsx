import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageCompressionSection } from "@/components/ImageCompressionSection";
import { VideoCompressionSection } from "@/components/VideoCompressionSection";
import { Image, Video } from "lucide-react";

const Index = () => {

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-foreground mb-4">
            Smart Compressor
          </h1>
          <p className="text-xl text-muted-foreground">
            Professional image and video compression with advanced algorithms
          </p>
        </header>

        <Tabs defaultValue="image" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="image" className="flex items-center gap-2">
              <Image className="w-4 h-4" />
              Image Compression
            </TabsTrigger>
            <TabsTrigger value="video" className="flex items-center gap-2">
              <Video className="w-4 h-4" />
              Video Compression
            </TabsTrigger>
          </TabsList>

          <TabsContent value="image">
            <ImageCompressionSection />
          </TabsContent>

          <TabsContent value="video">
            <VideoCompressionSection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
