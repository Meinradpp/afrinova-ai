import type { CanvasData, CanvasElement } from '@/types';

export type TemplateKey = 'blank' | 'flyer' | 'story' | 'post' | 'card';

let counter = 0;
export function newElement(): CanvasElement {
  counter += 1;
  return {
    id: `el-${Date.now()}-${counter}`,
    type: 'text',
    text: '',
    bg: 'transparent',
    color: '#FAF7F0',
    x: 40,
    y: 40,
    width: 200,
    height: 40,
    rotation: 0,
    fontSize: 20,
    fontWeight: 400,
    align: 'left',
  };
}

export const TEMPLATES: Record<TemplateKey, { label: string; data: CanvasData }> = {
  blank: { label: 'Blank', data: { bg: '#004B23', elements: [] } },
  flyer: { label: 'Flyer', data: { bg: '#0A0A0A', elements: [] } },
  story: { label: 'Story', data: { bg: '#00753D', elements: [] } },
  post: { label: 'Post', data: { bg: '#FFD700', elements: [] } },
  card: { label: 'Card', data: { bg: '#FAF7F0', elements: [] } },
};
