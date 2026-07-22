import { useRef, useState } from 'react';
import { useDrag } from '@use-gesture/react';
import { EditorElement, TextElement, ShapeElement, StickerElement, ImageElement } from '@/types';
import { useEditorStore } from '@/store/useEditorStore';

interface ResizableElementProps {
  element: EditorElement;
  isSelected: boolean;
}

export default function ResizableElement({ element, isSelected }: ResizableElementProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const updateElement = useEditorStore((state) => state.updateElement);
  const selectElement = useEditorStore((state) => state.selectElement);
  const deleteElement = useEditorStore((state) => state.deleteElement);

  const [isEditing, setIsEditing] = useState(false);

  const bind = useDrag(
    ({ offset: [x, y], first, memo }) => {
      if (first) {
        selectElement(element.id);
        return { startX: element.x, startY: element.y };
      }
      
      const deltaX = x - (memo?.startX || 0);
      const deltaY = y - (memo?.startY || 0);
      
      updateElement(element.id, {
        x: memo.startX + deltaX,
        y: memo.startY + deltaY,
      });
      
      return memo;
    },
    {
      from: () => [element.x, element.y],
    }
  );

  const handleResizeStart = (corner: 'tl' | 'tr' | 'bl' | 'br') => (e: React.MouseEvent) => {
    e.stopPropagation();
    selectElement(element.id);

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = element.width;
    const startHeight = element.height;
    const startPosX = element.x;
    const startPosY = element.y;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;

      let newWidth = startWidth;
      let newHeight = startHeight;
      let newX = startPosX;
      let newY = startPosY;

      if (corner === 'br') {
        newWidth = Math.max(20, startWidth + dx);
        newHeight = Math.max(20, startHeight + dy);
      } else if (corner === 'bl') {
        newWidth = Math.max(20, startWidth - dx);
        newHeight = Math.max(20, startHeight + dy);
        newX = startPosX + (startWidth - newWidth);
      } else if (corner === 'tr') {
        newWidth = Math.max(20, startWidth + dx);
        newHeight = Math.max(20, startHeight - dy);
        newY = startPosY + (startHeight - newHeight);
      } else if (corner === 'tl') {
        newWidth = Math.max(20, startWidth - dx);
        newHeight = Math.max(20, startHeight - dy);
        newX = startPosX + (startWidth - newWidth);
        newY = startPosY + (startHeight - newHeight);
      }

      updateElement(element.id, { width: newWidth, height: newHeight, x: newX, y: newY });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleDoubleClick = () => {
    if (element.type === 'text') {
      setIsEditing(true);
    }
  };

  const handleTextBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    setIsEditing(false);
    const newContent = e.currentTarget.textContent || '';
    updateElement(element.id, { content: newContent });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Delete' && isSelected && !isEditing) {
      deleteElement(element.id);
    }
    if (e.key === 'Enter' && isEditing) {
      e.preventDefault();
      (e.target as HTMLDivElement).blur();
    }
  };

  if (element.hidden) return null;

  return (
    <div
      ref={elementRef}
      {...(isEditing ? {} : bind())}
      data-testid={`element-${element.type}-${element.id}`}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
      className={`absolute cursor-move ${isSelected ? 'ring-2 ring-primary' : ''}`}
      style={{
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        transform: `rotate(${element.rotation}deg)`,
        opacity: element.opacity,
        touchAction: 'none',
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (!isSelected) selectElement(element.id);
      }}
    >
      {/* Render element content */}
      {element.type === 'text' && (
        <div
          contentEditable={isEditing}
          suppressContentEditableWarning
          onBlur={handleTextBlur}
          data-testid={`text-content-${element.id}`}
          className="w-full h-full outline-none overflow-hidden"
          style={{
            fontSize: (element as TextElement).fontSize,
            fontFamily: (element as TextElement).fontFamily,
            color: (element as TextElement).color,
            fontWeight: (element as TextElement).bold ? 'bold' : 'normal',
            fontStyle: (element as TextElement).italic ? 'italic' : 'normal',
            textAlign: (element as TextElement).align,
            cursor: isEditing ? 'text' : 'move',
          }}
        >
          {(element as TextElement).content}
        </div>
      )}

      {element.type === 'shape' && (
        <div
          className="w-full h-full"
          style={{
            backgroundColor: (element as ShapeElement).fill,
            border: `${(element as ShapeElement).strokeWidth}px solid ${(element as ShapeElement).stroke}`,
            borderRadius: (element as ShapeElement).shapeType === 'ellipse' ? '50%' : '0',
          }}
          data-testid={`shape-${(element as ShapeElement).shapeType}-${element.id}`}
        />
      )}

      {element.type === 'sticker' && (
        <div
          className="w-full h-full flex items-center justify-center select-none"
          style={{ fontSize: element.height * 0.8 }}
          data-testid={`sticker-${element.id}`}
        >
          {(element as StickerElement).emoji}
        </div>
      )}

      {element.type === 'image' && (
        <img
          src={(element as ImageElement).src}
          alt="Overlay"
          className="w-full h-full object-contain pointer-events-none"
          draggable={false}
          data-testid={`image-overlay-${element.id}`}
        />
      )}

      {/* Resize handles */}
      {isSelected && !isEditing && (
        <>
          <div
            className="absolute w-3 h-3 bg-primary rounded-full -top-1.5 -left-1.5 cursor-nwse-resize"
            onMouseDown={handleResizeStart('tl')}
            data-testid="resize-handle-tl"
          />
          <div
            className="absolute w-3 h-3 bg-primary rounded-full -top-1.5 -right-1.5 cursor-nesw-resize"
            onMouseDown={handleResizeStart('tr')}
            data-testid="resize-handle-tr"
          />
          <div
            className="absolute w-3 h-3 bg-primary rounded-full -bottom-1.5 -left-1.5 cursor-nesw-resize"
            onMouseDown={handleResizeStart('bl')}
            data-testid="resize-handle-bl"
          />
          <div
            className="absolute w-3 h-3 bg-primary rounded-full -bottom-1.5 -right-1.5 cursor-nwse-resize"
            onMouseDown={handleResizeStart('br')}
            data-testid="resize-handle-br"
          />
        </>
      )}
    </div>
  );
}
