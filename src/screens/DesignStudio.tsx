import { useEffect, useRef, useState } from 'react';
import type { CanvasData, CanvasElement, Design } from '@/types';
import { TEMPLATES, newElement, type TemplateKey } from '@/lib/templates';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import {
  Type, Square, Circle, Minus, Trash2, Save, Plus, ChevronLeft,
  Bold, AlignLeft, AlignCenter, AlignRight, Download, Layers, Palette,
} from 'lucide-react';

const CANVAS_W = 300;
const CANVAS_H = 450;

const PALETTE = ['#004B23', '#00753D', '#FFD700', '#FFE65A', '#0A0A0A', '#FAF7F0', '#FFFFFF', '#2E8B57'];
const BG_PALETTE = ['#004B23', '#0A0A0A', '#FAF7F0', '#FFFFFF', '#00753D', '#161616'];

type Props = {
  initialDesign?: Design | null;
  onBack: () => void;
};

export default function DesignStudio({ initialDesign, onBack }: Props) {
  const { user } = useAuth();
  const [data, setData] = useState<CanvasData>(() =>
    initialDesign?.canvas_data ?? TEMPLATES.blank.data
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [title, setTitle] = useState(initialDesign?.title ?? 'Untitled Design');
  const [templateKey, setTemplateKey] = useState<TemplateKey>(
    (initialDesign?.template_type as TemplateKey) ?? 'blank'
  );
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [editingText, setEditingText] = useState(false);
  const dragRef = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const selected = data.elements.find((el) => el.id === selectedId) ?? null;

  useEffect(() => {
    if (initialDesign) {
      setData(initialDesign.canvas_data);
      setTitle(initialDesign.title);
    }
  }, [initialDesign]);

  const update = (patch: Partial<CanvasData>) => setData((d) => ({ ...d, ...patch }));

  const updateEl = (id: string, patch: Partial<CanvasElement>) =>
    setData((d) => ({
      ...d,
      elements: d.elements.map((el) => (el.id === id ? { ...el, ...patch } : el)),
    }));

  const addText = () => {
    const el = newElement();
    el.text = 'Double-tap to edit';
    setData((d) => ({ ...d, elements: [...d.elements, el] }));
    setSelectedId(el.id);
  };

  const addShape = (shape: 'rect' | 'circle' | 'line') => {
    const el = newElement();
    el.type = 'shape';
    el.shape = shape;
    el.text = '';
    el.bg = shape === 'line' ? '#FFD700' : '#FFD700';
    el.color = '#FFD700';
    el.width = shape === 'line' ? 200 : 80;
    el.height = shape === 'line' ? 4 : 80;
    el.fontSize = 14;
    setData((d) => ({ ...d, elements: [...d.elements, el] }));
    setSelectedId(el.id);
  };

  const removeEl = (id: string) => {
    setData((d) => ({ ...d, elements: d.elements.filter((el) => el.id !== id) }));
    setSelectedId(null);
  };

  const loadTemplate = (key: TemplateKey) => {
    setTemplateKey(key);
    setData(TEMPLATES[key].data);
    setSelectedId(null);
  };

  const startDrag = (e: React.PointerEvent, el: CanvasElement) => {
    e.stopPropagation();
    setSelectedId(el.id);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const scale = rect.width / CANVAS_W;
    dragRef.current = {
      id: el.id,
      offsetX: (e.clientX - rect.left) / scale - el.x,
      offsetY: (e.clientY - rect.top) / scale - el.y,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onDrag = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const scale = rect.width / CANVAS_W;
    const x = (e.clientX - rect.left) / scale - dragRef.current.offsetX;
    const y = (e.clientY - rect.top) / scale - dragRef.current.offsetY;
    updateEl(dragRef.current.id, {
      x: Math.max(0, Math.min(CANVAS_W - 20, x)),
      y: Math.max(0, Math.min(CANVAS_H - 20, y)),
    });
  };

  const endDrag = () => { dragRef.current = null; };

  const save = async () => {
    if (!user) return;
    setSaving(true);
    setSavedMsg(null);
    try {
      const payload = {
        title,
        template_type: templateKey,
        canvas_data: data,
      };
      if (initialDesign) {
        const { error } = await supabase
          .from('designs')
          .update({ ...payload, updated_at: new Date().toISOString() })
          .eq('id', initialDesign.id);
        if (error) throw error;
        setSavedMsg('Saved');
      } else {
        const { error } = await supabase.from('designs').insert(payload);
        if (error) throw error;
        setSavedMsg('Created');
      }
      setTimeout(() => setSavedMsg(null), 2200);
    } catch {
      setSavedMsg('Save failed');
      setTimeout(() => setSavedMsg(null), 2200);
    } finally {
      setSaving(false);
    }
  };

  const exportPng = () => {
    // Lightweight export: serialize canvas as SVG and trigger download
    const els = data.elements.map((el) => {
      if (el.type === 'shape') {
        if (el.shape === 'circle') {
          return `<circle cx="${el.x + el.width / 2}" cy="${el.y + el.height / 2}" r="${el.width / 2}" fill="${el.bg}" transform="rotate(${el.rotation} ${el.x + el.width / 2} ${el.y + el.height / 2})" />`;
        }
        if (el.shape === 'line') {
          return `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" rx="2" fill="${el.bg}" transform="rotate(${el.rotation} ${el.x} ${el.y})" />`;
        }
        return `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" rx="8" fill="${el.bg}" transform="rotate(${el.rotation} ${el.x} ${el.y})" />`;
      }
      const anchor = el.align === 'center' ? 'middle' : el.align === 'right' ? 'end' : 'start';
      const tx = el.align === 'center' ? el.x + el.width / 2 : el.align === 'right' ? el.x + el.width : el.x;
      const lines = (el.text ?? '').split('\n').map((ln, i) =>
        `<text x="${tx}" y="${el.y + el.fontSize + i * el.fontSize * 1.25}" font-size="${el.fontSize}" font-weight="${el.fontWeight}" fill="${el.color}" text-anchor="${anchor}" font-family="Plus Jakarta Sans, sans-serif">${ln.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</text>`
      ).join('');
      return `<g transform="rotate(${el.rotation} ${tx} ${el.y})">${lines}</g>`;
    }).join('');

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${CANVAS_W * 2}" height="${CANVAS_H * 2}" viewBox="0 0 ${CANVAS_W} ${CANVAS_H}"><rect width="${CANVAS_W}" height="${CANVAS_H}" fill="${data.bg}"/>${els}</svg>`;
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '-').toLowerCase()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-screen bg-onyx safe-top">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-3 glass border-b border-cream/10">
        <button onClick={onBack} className="w-9 h-9 rounded-full glass border border-cream/10 flex items-center justify-center active:scale-95 transition shrink-0">
          <ChevronLeft className="w-5 h-5 text-cream/80" />
        </button>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 bg-transparent text-paper font-display font-bold text-base outline-none min-w-0"
          placeholder="Design name"
        />
        {savedMsg && <span className="text-[11px] text-gold font-semibold animate-fade-in">{savedMsg}</span>}
        <button onClick={save} disabled={saving} className="w-9 h-9 rounded-full bg-gold flex items-center justify-center active:scale-95 transition shrink-0 disabled:opacity-60">
          <Save className="w-4 h-4 text-emerald-deep" strokeWidth={2.5} />
        </button>
      </div>

      {/* Canvas area */}
      <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col items-center px-4 py-4">
        <div
          ref={canvasRef}
          className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/50 ring-1 ring-cream/10"
          style={{ width: '100%', maxWidth: 340, aspectRatio: `${CANVAS_W} / ${CANVAS_H}`, background: data.bg }}
          onPointerDown={() => setSelectedId(null)}
        >
          {data.elements.map((el) => {
            const isSel = el.id === selectedId;
            return (
              <div
                key={el.id}
                onPointerDown={(e) => startDrag(e, el)}
                onPointerMove={onDrag}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                className={`absolute touch-none cursor-move select-none ${isSel ? 'ring-2 ring-gold ring-offset-1 ring-offset-transparent' : ''}`}
                style={{
                  left: `${(el.x / CANVAS_W) * 100}%`,
                  top: `${(el.y / CANVAS_H) * 100}%`,
                  width: `${(el.width / CANVAS_W) * 100}%`,
                  height: `${(el.height / CANVAS_H) * 100}%`,
                  transform: `rotate(${el.rotation}deg)`,
                }}
              >
                {el.type === 'shape' ? (
                  <div
                    className="w-full h-full"
                    style={{
                      background: el.bg,
                      borderRadius: el.shape === 'circle' ? '50%' : el.shape === 'line' ? '2px' : '8px',
                    }}
                  />
                ) : (
                  <div
                    onDoubleClick={() => setEditingText(true)}
                    contentEditable={editingText && isSel}
                    suppressContentEditableWarning
                    onBlur={(e) => {
                      setEditingText(false);
                      updateEl(el.id, { text: e.currentTarget.innerText });
                    }}
                    className="w-full h-full flex items-center outline-none whitespace-pre-wrap"
                    style={{
                      fontSize: `clamp(${el.fontSize * 0.55}px, ${(el.fontSize / CANVAS_W) * 100}cqw, ${el.fontSize}px)`,
                      fontWeight: el.fontWeight,
                      color: el.color,
                      textAlign: el.align,
                      lineHeight: 1.25,
                      background: el.bg === 'transparent' ? 'transparent' : el.bg,
                      borderRadius: 6,
                      padding: el.bg === 'transparent' ? 0 : 4,
                    }}
                  >
                    {el.text ?? ''}
                  </div>
                )}
              </div>
            );
          })}
          {data.elements.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-cream/30 pointer-events-none">
              <Layers className="w-10 h-10 mb-2" />
              <p className="text-sm font-medium">Tap + to add elements</p>
            </div>
          )}
        </div>

        {/* Template chips */}
        <div className="w-full max-w-[340px] mt-4">
          <p className="text-[11px] text-cream/40 font-semibold uppercase tracking-wide mb-2">Templates</p>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {(Object.keys(TEMPLATES) as TemplateKey[]).map((key) => (
              <button
                key={key}
                onClick={() => loadTemplate(key)}
                className={`shrink-0 px-3.5 py-2 rounded-full text-[12px] font-semibold border transition active:scale-95 ${
                  templateKey === key
                    ? 'bg-gold text-emerald-deep border-gold'
                    : 'glass text-cream/70 border-cream/10'
                }`}
              >
                {TEMPLATES[key].label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Add toolbar */}
      <div className="px-4 py-2.5 glass border-t border-cream/10">
        <div className="flex items-center justify-around max-w-[340px] mx-auto">
          {[
            { icon: Type, label: 'Text', fn: addText },
            { icon: Square, label: 'Rect', fn: () => addShape('rect') },
            { icon: Circle, label: 'Circle', fn: () => addShape('circle') },
            { icon: Minus, label: 'Line', fn: () => addShape('line') },
            { icon: Download, label: 'Export', fn: exportPng },
          ].map((b) => {
            const Icon = b.icon;
            return (
              <button
                key={b.label}
                onClick={b.fn}
                className="flex flex-col items-center gap-1 active:scale-90 transition"
              >
                <div className="w-11 h-11 rounded-2xl glass border border-cream/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-gold" />
                </div>
                <span className="text-[10px] text-cream/50 font-medium">{b.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Properties panel */}
      {selected && (
        <div className="glass border-t border-cream/10 px-4 py-3 space-y-3 animate-slide-up safe-bottom">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cream/60 uppercase tracking-wide flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-gold" /> Properties
            </span>
            <button onClick={() => removeEl(selected.id)} className="text-red-300 active:scale-90 transition">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {selected.type === 'text' && (
            <>
              <textarea
                value={selected.text ?? ''}
                onChange={(e) => updateEl(selected.id, { text: e.target.value })}
                rows={2}
                className="w-full glass rounded-xl px-3 py-2 text-[13px] text-paper border border-cream/10 outline-none focus:border-gold/50 resize-none"
                placeholder="Text content"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateEl(selected.id, { fontWeight: selected.fontWeight >= 700 ? 400 : 800 })}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center border transition ${selected.fontWeight >= 700 ? 'bg-gold text-emerald-deep border-gold' : 'glass text-cream/60 border-cream/10'}`}
                >
                  <Bold className="w-4 h-4" />
                </button>
                {(['left', 'center', 'right'] as const).map((a) => {
                  const Icon = a === 'left' ? AlignLeft : a === 'center' ? AlignCenter : AlignRight;
                  return (
                    <button
                      key={a}
                      onClick={() => updateEl(selected.id, { align: a })}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center border transition ${selected.align === a ? 'bg-gold text-emerald-deep border-gold' : 'glass text-cream/60 border-cream/10'}`}
                    >
                      <Icon className="w-4 h-4" />
                    </button>
                  );
                })}
                <div className="flex-1 flex items-center gap-2 ml-1">
                  <span className="text-[10px] text-cream/40">A</span>
                  <input
                    type="range"
                    min={10}
                    max={48}
                    value={selected.fontSize}
                    onChange={(e) => updateEl(selected.id, { fontSize: Number(e.target.value) })}
                    className="flex-1 accent-gold"
                  />
                  <span className="text-[10px] text-cream/40">A</span>
                </div>
              </div>
              <div>
                <p className="text-[10px] text-cream/40 font-semibold mb-1.5">Text Color</p>
                <div className="flex gap-2 flex-wrap">
                  {PALETTE.map((c) => (
                    <button
                      key={c}
                      onClick={() => updateEl(selected.id, { color: c })}
                      className={`w-7 h-7 rounded-full border-2 transition ${selected.color === c ? 'border-gold scale-110' : 'border-cream/20'}`}
                      style={{ background: c }}
                    />
                  ))}
                </div>
              </div>
            </>
          )}

          {selected.type === 'shape' && (
            <div>
              <p className="text-[10px] text-cream/40 font-semibold mb-1.5">Fill Color</p>
              <div className="flex gap-2 flex-wrap">
                {PALETTE.map((c) => (
                  <button
                    key={c}
                    onClick={() => updateEl(selected.id, { bg: c, color: c })}
                    className={`w-7 h-7 rounded-full border-2 transition ${selected.bg === c ? 'border-gold scale-110' : 'border-cream/20'}`}
                    style={{ background: c }}
                  />
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-[10px] text-cream/40 font-semibold mb-1.5">Canvas Background</p>
            <div className="flex gap-2 flex-wrap">
              {BG_PALETTE.map((c) => (
                <button
                  key={c}
                  onClick={() => update({ bg: c })}
                  className={`w-7 h-7 rounded-full border-2 transition ${data.bg === c ? 'border-gold scale-110' : 'border-cream/20'}`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-cream/50 font-medium">Rotation</span>
            <input
              type="range"
              min={-180}
              max={180}
              value={selected.rotation}
              onChange={(e) => updateEl(selected.id, { rotation: Number(e.target.value) })}
              className="flex-1 accent-gold"
            />
            <span className="text-[11px] text-cream/40 w-10 text-right">{selected.rotation}°</span>
          </div>
        </div>
      )}

      {/* Floating add when nothing selected */}
      {!selected && (
        <button
          onClick={addText}
          className="absolute bottom-24 right-5 w-14 h-14 rounded-full bg-gradient-to-br from-gold to-gold-soft flex items-center justify-center shadow-xl shadow-gold/30 active:scale-90 transition z-20"
        >
          <Plus className="w-7 h-7 text-emerald-deep" strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
}
