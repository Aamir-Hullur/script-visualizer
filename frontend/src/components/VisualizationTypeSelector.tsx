import { VisualizationType } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface VisualizationTypeSelectorProps {
  value: VisualizationType;
  onChange: (value: VisualizationType) => void;
}

export function VisualizationTypeSelector({ 
  value, 
  onChange 
}: VisualizationTypeSelectorProps) {
  return (
    <Select
      value={value}
      onValueChange={onChange}
    >
      <SelectTrigger className="w-[120px]">
        <SelectValue placeholder="Type" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="static">Static</SelectItem>
        <SelectItem value="interactive">Interactive</SelectItem>
      </SelectContent>
    </Select>
  );
}