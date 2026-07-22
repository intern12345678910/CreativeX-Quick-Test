import { useEditorStore } from '@/store/useEditorStore';
import { Eye, EyeOff, Trash2, ArrowUp, ArrowDown, ChevronsUp, ChevronsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function LayersPanel() {
  const elements = useEditorStore((state) => state.elements);
  const selectedId = useEditorStore((state) => state.selectedId);
  const selectElement = useEditorStore((state) => state.selectElement);
  const updateElement = useEditorStore((state) => state.updateElement);
  const deleteElement = useEditorStore((state) => state.deleteElement);
  const moveLayerUp = useEditorStore((state) => state.moveLayerUp);
  const moveLayerDown = useEditorStore((state) => state.moveLayerDown);
  const bringToFront = useEditorStore((state) => state.bringToFront);
  const sendToBack = useEditorStore((state) => state.sendToBack);

  if (elements.length === 0) {
    return (
      <div className="w-64 bg-card border-l border-border p-4">
        <h3 className="text-sm font-semibold text-foreground mb-4">Layers</h3>
        <div className="text-sm text-muted-foreground text-center py-8">
          No layers yet
        </div>
      </div>
    );
  }

  const getElementLabel = (element: typeof elements[0]) => {
    if (element.type === 'text') return `Text: ${element.content.slice(0, 15)}${element.content.length > 15 ? '...' : ''}`;
    if (element.type === 'shape') return `Shape: ${element.shapeType}`;
    if (element.type === 'sticker') return `Sticker: ${element.emoji}`;
    if (element.type === 'image') return 'Image';
    return element.type;
  };

  return (
    <div className="w-64 bg-card border-l border-border flex flex-col">
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Layers</h3>
        <p className="text-xs text-muted-foreground mt-1">
          {elements.length} {elements.length === 1 ? 'layer' : 'layers'}
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {[...elements].reverse().map((element, reverseIndex) => {
            const actualIndex = elements.length - 1 - reverseIndex;
            const isSelected = selectedId === element.id;
            
            return (
              <div
                key={element.id}
                data-testid={`layer-item-${element.id}`}
                className={`
                  group flex items-center gap-2 p-2 rounded-md cursor-pointer
                  transition-colors
                  ${isSelected ? 'bg-primary/20 text-foreground' : 'hover:bg-muted text-muted-foreground'}
                `}
                onClick={() => selectElement(element.id)}
              >
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateElement(element.id, { hidden: !element.hidden });
                  }}
                  data-testid={`button-toggle-visibility-${element.id}`}
                >
                  {element.hidden ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                </Button>

                <span className="flex-1 text-xs truncate" data-testid={`layer-label-${element.id}`}>
                  {getElementLabel(element)}
                </span>

                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      bringToFront(element.id);
                    }}
                    disabled={actualIndex === elements.length - 1}
                    data-testid={`button-bring-front-${element.id}`}
                  >
                    <ChevronsUp className="h-3 w-3" />
                  </Button>

                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      moveLayerUp(element.id);
                    }}
                    disabled={actualIndex === elements.length - 1}
                    data-testid={`button-move-up-${element.id}`}
                  >
                    <ArrowUp className="h-3 w-3" />
                  </Button>

                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      moveLayerDown(element.id);
                    }}
                    disabled={actualIndex === 0}
                    data-testid={`button-move-down-${element.id}`}
                  >
                    <ArrowDown className="h-3 w-3" />
                  </Button>

                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      sendToBack(element.id);
                    }}
                    disabled={actualIndex === 0}
                    data-testid={`button-send-back-${element.id}`}
                  >
                    <ChevronsDown className="h-3 w-3" />
                  </Button>

                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteElement(element.id);
                    }}
                    data-testid={`button-delete-${element.id}`}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
