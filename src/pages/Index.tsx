import { ImageCompressionSection } from "@/components/ImageCompressionSection";

const Index = () => {

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-foreground mb-4">
            Smart Compressor
          </h1>
          <p className="text-xl text-muted-foreground">
            Professional image compression with advanced algorithms
          </p>
        </header>

        <ImageCompressionSection />
      </div>
    </div>
  );
};

export default Index;
