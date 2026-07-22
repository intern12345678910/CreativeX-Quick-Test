import { useEditorStore } from '@/store/useEditorStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TextElement, ShapeElement } from '@/types';
import { Bold, Italic, Trash2 } from 'lucide-react';

export default function PropertiesPanel() {
  const selectedId = useEditorStore((state) => state.selectedId);
  const elements = useEditorStore((state) => state.elements);
  const updateElement = useEditorStore((state) => state.updateElement);
  const deleteElement = useEditorStore((state) => state.deleteElement);

  const selectedElement = elements.find((el) => el.id === selectedId);

  if (!selectedElement) {
    return (
      <div className="w-72 bg-card border-l border-border p-4">
        <h3 className="text-sm font-semibold text-foreground mb-4">Properties</h3>
        <div className="text-sm text-muted-foreground text-center py-8">
          Select an element to edit
        </div>
      </div>
    );
  }

  const handleUpdate = (updates: Partial<typeof selectedElement>) => {
    updateElement(selectedId!, updates);
  };

  return (
    <div className="w-72 bg-card border-l border-border flex flex-col">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Properties</h3>
          <p className="text-xs text-muted-foreground capitalize">{selectedElement.type}</p>
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-destructive"
          onClick={() => deleteElement(selectedId!)}
          data-testid="button-delete-selected"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {/* Common properties */}
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Position X</Label>
              <Input
                type="number"
                value={Math.round(selectedElement.x)}
                onChange={(e) => handleUpdate({ x: Number(e.target.value) })}
                className="h-8 mt-1"
                data-testid="input-position-x"
              />
            </div>
            <div>
              <Label className="text-xs">Position Y</Label>
              <Input
                type="number"
                value={Math.round(selectedElement.y)}
                onChange={(e) => handleUpdate({ y: Number(e.target.value) })}
                className="h-8 mt-1"
                data-testid="input-position-y"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <Label className="text-xs">Width</Label>
              <Input
                type="number"
                value={Math.round(selectedElement.width)}
                onChange={(e) => handleUpdate({ width: Number(e.target.value) })}
                className="h-8 mt-1"
                data-testid="input-width"
              />
            </div>
            <div>
              <Label className="text-xs">Height</Label>
              <Input
                type="number"
                value={Math.round(selectedElement.height)}
                onChange={(e) => handleUpdate({ height: Number(e.target.value) })}
                className="h-8 mt-1"
                data-testid="input-height"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs">Rotation: {selectedElement.rotation}°</Label>
            <Slider
              value={[selectedElement.rotation]}
              onValueChange={([value]) => handleUpdate({ rotation: value })}
              min={-180}
              max={180}
              step={1}
              className="mt-2"
              data-testid="slider-rotation"
            />
          </div>

          <div>
            <Label className="text-xs">Opacity: {Math.round(selectedElement.opacity * 100)}%</Label>
            <Slider
              value={[selectedElement.opacity * 100]}
              onValueChange={([value]) => handleUpdate({ opacity: value / 100 })}
              min={0}
              max={100}
              step={1}
              className="mt-2"
              data-testid="slider-opacity"
            />
          </div>

          {/* Text-specific properties */}
          {selectedElement.type === 'text' && (
            <>
              <div>
                <Label className="text-xs">Content</Label>
                <Input
                  value={(selectedElement as TextElement).content}
                  onChange={(e) => handleUpdate({ content: e.target.value })}
                  className="h-8 mt-1"
                  data-testid="input-text-content"
                />
              </div>

              <div>
                <Label className="text-xs">Font Size</Label>
                <Input
                  type="number"
                  value={(selectedElement as TextElement).fontSize}
                  onChange={(e) => handleUpdate({ fontSize: Number(e.target.value) })}
                  className="h-8 mt-1"
                  data-testid="input-font-size"
                />
              </div>

              <div>
                <Label className="text-xs">Font Family</Label>
                <Select
                  value={(selectedElement as TextElement).fontFamily}
                  onValueChange={(value) => handleUpdate({ fontFamily: value })}
                >
                  <SelectTrigger className="h-8 mt-1" data-testid="select-font-family">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inter, sans-serif">Inter</SelectItem>
                    <SelectItem value="Arial, sans-serif">Arial</SelectItem>
                    <SelectItem value="Georgia, serif">Georgia</SelectItem>
                    <SelectItem value="Courier New, monospace">Courier New</SelectItem>
                    <SelectItem value="Impact, sans-serif">Impact</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs">Color</Label>
                <Input
                  type="color"
                  value={(selectedElement as TextElement).color}
                  onChange={(e) => handleUpdate({ color: e.target.value })}
                  className="h-10 mt-1 cursor-pointer"
                  data-testid="input-text-color"
                />
              </div>

              <div>
                <Label className="text-xs">Text Align</Label>
                <Select
                  value={(selectedElement as TextElement).align}
                  onValueChange={(value) => handleUpdate({ align: value as 'left' | 'center' | 'right' })}
                >
                  <SelectTrigger className="h-8 mt-1" data-testid="select-text-align">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={(selectedElement as TextElement).bold ? 'default' : 'outline'}
                  onClick={() => handleUpdate({ bold: !(selectedElement as TextElement).bold })}
                  className="flex-1 gap-2"
                  data-testid="button-text-bold"
                >
                  <Bold className="h-4 w-4" />
                  Bold
                </Button>
                <Button
                  size="sm"
                  variant={(selectedElement as TextElement).italic ? 'default' : 'outline'}
                  onClick={() => handleUpdate({ italic: !(selectedElement as TextElement).italic })}
                  className="flex-1 gap-2"
                  data-testid="button-text-italic"
                >
                  <Italic className="h-4 w-4" />
                  Italic
                </Button>
              </div>
            </>
          )}

          {/* Shape-specific properties */}
          {selectedElement.type === 'shape' && (
            <>
              <div>
                <Label className="text-xs">Fill Color</Label>
                <Input
                  type="color"
                  value={(selectedElement as ShapeElement).fill}
                  onChange={(e) => handleUpdate({ fill: e.target.value })}
                  className="h-10 mt-1 cursor-pointer"
                  data-testid="input-shape-fill"
                />
              </div>

              <div>
                <Label className="text-xs">Stroke Color</Label>
                <Input
                  type="color"
                  value={(selectedElement as ShapeElement).stroke}
                  onChange={(e) => handleUpdate({ stroke: e.target.value })}
                  className="h-10 mt-1 cursor-pointer"
                  data-testid="input-shape-stroke"
                />
              </div>

              <div>
                <Label className="text-xs">Stroke Width</Label>
                <Input
                  type="number"
                  value={(selectedElement as ShapeElement).strokeWidth}
                  onChange={(e) => handleUpdate({ strokeWidth: Number(e.target.value) })}
                  className="h-8 mt-1"
                  min={0}
                  data-testid="input-stroke-width"
                />
              </div>
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
