import { Plus, Type, Square, Smile, Image as ImageIcon, Download, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEditorStore } from '@/store/useEditorStore';
import { TextElement, ShapeElement, StickerElement } from '@/types';
import { useState, useRef } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toPng } from 'html-to-image';
import { useToast } from '@/hooks/use-toast';

export default function Toolbar() {
  const addElement = useEditorStore((state) => state.addElement);
  const clearAll = useEditorStore((state) => state.clearAll);
  const baseMedia = useEditorStore((state) => state.baseMedia);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const addText = () => {
    const newText: Omit<TextElement, 'id'> = {
      type: 'text',
      content: 'Double-click to edit',
      x: 400,
      y: 300,
      width: 300,
      height: 60,
      rotation: 0,
      opacity: 1,
      hidden: false,
      fontSize: 32,
      fontFamily: 'Inter, sans-serif',
      color: '#ffffff',
      bold: false,
      italic: false,
      align: 'left',
    };
    addElement(newText);
  };

  const addShape = (shapeType: 'rectangle' | 'ellipse') => {
    const newShape: Omit<ShapeElement, 'id'> = {
      type: 'shape',
      shapeType,
      x: 500,
      y: 300,
      width: 200,
      height: 200,
      rotation: 0,
      opacity: 1,
      hidden: false,
      fill: 'rgba(59, 130, 246, 0.5)',
      stroke: '#3b82f6',
      strokeWidth: 2,
    };
    addElement(newShape);
  };

  const addSticker = (emoji: string) => {
    const newSticker: Omit<StickerElement, 'id'> = {
      type: 'sticker',
      emoji,
      x: 550,
      y: 300,
      width: 80,
      height: 80,
      rotation: 0,
      opacity: 1,
      hidden: false,
    };
    addElement(newSticker);
  };

  const handleImageOverlayUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid file', description: 'Please upload an image file', variant: 'destructive' });
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      addElement({
        type: 'image',
        src: objectUrl,
        x: 400,
        y: 250,
        width: Math.min(300, img.naturalWidth),
        height: Math.min(300, img.naturalHeight),
        rotation: 0,
        opacity: 1,
        hidden: false,
      });
    };
    img.src = objectUrl;

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleExport = async () => {
    const canvas = document.getElementById('export-canvas');
    if (!canvas) return;

    try {
      const dataUrl = await toPng(canvas, { 
        quality: 1.0,
        pixelRatio: 2,
      });
      
      const link = document.createElement('a');
      link.download = `overlay-studio-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();

      toast({ title: 'Exported successfully', description: 'Your composition has been downloaded' });
    } catch (error) {
      console.error('Export failed:', error);
      toast({ title: 'Export failed', description: 'Something went wrong', variant: 'destructive' });
    }
  };

  const stickers = ['⭐', '🔥', '💎', '✨', '🎯', '🏆', '❤️', '🎉', '👑', '⚡', '🌟', '💫', '🎨', '🚀', '💪', '🎵', '🌈', '☀️', '🌙', '💡'];

  return (
    <div className="h-16 bg-card border-b border-border flex items-center justify-between px-6 gap-4">
      <div className="flex items-center gap-2">
        <h1 className="text-lg font-semibold text-foreground">Overlay Studio</h1>
      </div>

      <div className="flex items-center gap-2">
        <Button
          onClick={addText}
          size="sm"
          variant="secondary"
          className="gap-2"
          data-testid="button-add-text"
        >
          <Type className="w-4 h-4" />
          Text
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="secondary" className="gap-2" data-testid="button-add-shape">
              <Square className="w-4 h-4" />
              Shape
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => addShape('rectangle')} data-testid="shape-rectangle">
              Rectangle
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => addShape('ellipse')} data-testid="shape-ellipse">
              Ellipse
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="secondary" className="gap-2" data-testid="button-add-sticker">
              <Smile className="w-4 h-4" />
              Sticker
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64">
            <div className="grid grid-cols-5 gap-2 p-2">
              {stickers.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => addSticker(emoji)}
                  className="text-2xl hover:bg-muted rounded p-2 transition-colors"
                  data-testid={`sticker-option-${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          onClick={() => fileInputRef.current?.click()}
          size="sm"
          variant="secondary"
          className="gap-2"
          data-testid="button-add-image"
        >
          <ImageIcon className="w-4 h-4" />
          Image
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageOverlayUpload}
          data-testid="image-overlay-input"
        />
      </div>

      <div className="flex items-center gap-2">
        <Button
          onClick={clearAll}
          size="sm"
          variant="ghost"
          className="gap-2"
          data-testid="button-new"
        >
          <RotateCcw className="w-4 h-4" />
          New
        </Button>

        <Button
          onClick={handleExport}
          size="sm"
          className="gap-2"
          disabled={!baseMedia}
          data-testid="button-export"
        >
          <Download className="w-4 h-4" />
          Export
        </Button>
      </div>
    </div>
  );
}
