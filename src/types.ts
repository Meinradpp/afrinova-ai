export type ElementType = 'text' | 'shape';
export type ShapeType = 'rect' | 'circle' | 'line';
export type TextAlign = 'left' | 'center' | 'right';

export type CanvasElement = {
  id: string;
  type: ElementType;
  shape?: ShapeType;
  text?: string;
  bg: string;
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  fontSize: number;
  fontWeight: number;
  align: TextAlign;
};

export type CanvasData = {
  bg: string;
  elements: CanvasElement[];
};

export type Design = {
  id: string;
  user_id?: string;
  title: string;
  template_type: string;
  canvas_data: CanvasData;
  created_at?: string;
  updated_at?: string;
};
export type ChatMessage = {
  id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
};
