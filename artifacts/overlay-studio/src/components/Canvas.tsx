import { useRef, useState, useEffect } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { EditorElement } from '@/types';
import ResizableElement from './ResizableElement';

export default function Canvas() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const baseMedia = useEditorStore((state) => state.baseMedia);
  const elements = useEditorStore((state) => state.elements);
  const selectElement = useEditorStore((state) => state.selectElement);
  const selectedId = useEditorStore((state) => state.selectedId);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      selectElement(null);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        selectElement(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectElement]);

  if (!baseMedia) return null;

  const canvasWidth = 1280;
  const canvasHeight = 720;

  return (
    <div className="flex-1 flex items-center justify-center p-8 overflow-auto bg-background">
      <div
        ref={canvasRef}
        id="export-canvas"
        data-testid="canvas-area"
        className="relative bg-black shadow-2xl"
        style={{
          width: canvasWidth,
          height: canvasHeight,
        }}
        onClick={handleCanvasClick}
      >
        {/* Base media layer */}
        {baseMedia.type === 'image' ? (
          <img
            src={baseMedia.src}
            alt="Base media"
            className="absolute inset-0 w-full h-full object-contain"
            draggable={false}
            data-testid="base-image"
          />
        ) : (
          <video
            src={baseMedia.src}
            autoPlay
            muted
            loop
            className="absolute inset-0 w-full h-full object-contain"
            data-testid="base-video"
          />
        )}

        {/* Overlay elements */}
        {elements.map((element) => (
          <ResizableElement
            key={element.id}
            element={element}
            isSelected={selectedId === element.id}
          />
        ))}
      </div>
    </div>
  );
}
