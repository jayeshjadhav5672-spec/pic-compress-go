import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export type Algorithm = "lz77" | "rle" | "bpe";

interface AlgorithmSelectorProps {
  selected: Algorithm;
  onSelect: (algorithm: Algorithm) => void;
}

const algorithms = [
  {
    id: "lz77" as Algorithm,
    name: "LZ77",
    description: "Best overall compression",
  },
  {
    id: "rle" as Algorithm,
    name: "RLE",
    description: "Best for repetitive data",
  },
  {
    id: "bpe" as Algorithm,
    name: "BPE",
    description: "Good for text files",
  },
];

export const AlgorithmSelector = ({ selected, onSelect }: AlgorithmSelectorProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground">Compression Algorithm</h2>
      
      <RadioGroup value={selected} onValueChange={(value) => onSelect(value as Algorithm)}>
        <div className="space-y-3">
          {algorithms.map((algo) => (
            <div
              key={algo.id}
              className="flex items-start space-x-3 rounded-lg border border-border bg-card/50 p-4 hover:bg-card/70 transition-colors cursor-pointer"
              onClick={() => onSelect(algo.id)}
            >
              <RadioGroupItem value={algo.id} id={algo.id} className="mt-1" />
              <Label htmlFor={algo.id} className="flex-1 cursor-pointer">
                <div className="font-semibold text-foreground">{algo.name}</div>
                <div className="text-sm text-muted-foreground">{algo.description}</div>
              </Label>
            </div>
          ))}
        </div>
      </RadioGroup>
    </div>
  );
};
