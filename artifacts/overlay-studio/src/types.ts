export type ElementType = 'text' | 'shape' | 'sticker' | 'image';

export interface BaseElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  hidden: boolean;
}

export interface TextElement extends BaseElement {
  type: 'text';
  content: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  bold: boolean;
  italic: boolean;
  align: 'left' | 'center' | 'right';
}

export interface ShapeElement extends BaseElement {
  type: 'shape';
  shapeType: 'rectangle' | 'ellipse';
  fill: string;
  stroke: string;
  strokeWidth: number;
}

export interface StickerElement extends BaseElement {
  type: 'sticker';
  emoji: string;
}

export interface ImageElement extends BaseElement {
  type: 'image';
  src: string; // Object URL
}

export type EditorElement = TextElement | ShapeElement | StickerElement | ImageElement;

export interface BaseMedia {
  type: 'image' | 'video';
  src: string;
  width: number;
  height: number;
  file?: File;
}
