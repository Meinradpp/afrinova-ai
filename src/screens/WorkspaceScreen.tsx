import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import type { Design } from '@/types';
import { Plus, FileText, Clock, Trash2, Layers } from 'lucide-react';

type Props = {
  onOpenDesign: (d: Design) => void;
  onNewDesign: () => void;
};

export default function WorkspaceScreen({ onOpenDesign, onNewDesign }: Props) {
  const { user } = useAuth();
  const { t, lang } = useI18n();
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('designs')
        .select('*')
        .order('updated_at', { ascending: false });
      if (!error && data) setDesigns(data as Design[]);
      setLoading(false);
    })();
  }, [user]);

  const del = async (id: string) => {
    setDesigns((d) => d.filter((x) => x.id !== id));
    await supabase.from('designs').delete().eq('id', id);
  };

  const localeMap: Record<string, string> = {
    fr: 'fr-FR', en: 'en-US', de: 'de-DE', es: 'es-ES', zh: 'zh-CN',
    'en-US': 'en-US', 'en-GB': 'en-GB', pt: 'pt-PT',
  };

  const fmtDate = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = (now.getTime() - d.getTime()) / 1000;
    if (diff < 60) return t('workspace.just_now');
    if (diff < 3600) return `${Math.floor(diff / 60)}${t('workspace.m_ago')}`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}${t('workspace.h_ago')}`;
    return d.toLocaleDateString(localeMap[lang] ?? 'en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="px-5 pt-14 pb-28 max-w-md mx-auto safe-top">
      <div className="flex items-center justify-between mb-5 animate-fade-in">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-paper">{t('workspace.title')}</h1>
          <p className="text-xs text-cream/50 font-medium mt-0.5">{designs.length} {t('workspace.saved')}</p>
        </div>
        <button
          onClick={onNewDesign}
          className="bg-gold text-emerald-deep font-bold text-sm px-4 py-2.5 rounded-full flex items-center gap-1.5 active:scale-95 transition shadow-lg shadow-gold/20"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} /> {t('workspace.new')}
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-2xl glass border border-cream/10 shimmer" />
          ))}
        </div>
      ) : designs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
          <div className="w-20 h-20 rounded-3xl bg-emerald-deep/30 border border-gold/20 flex items-center justify-center mb-4">
            <Layers className="w-9 h-9 text-gold" />
          </div>
          <h3 className="font-display text-lg font-bold text-paper">{t('workspace.empty_title')}</h3>
          <p className="text-sm text-cream/50 mt-1 text-center max-w-[240px]">
            {t('workspace.empty_sub')}
          </p>
          <button
            onClick={onNewDesign}
            className="mt-5 bg-gradient-to-r from-gold to-gold-soft text-emerald-deep font-bold text-sm px-6 py-3 rounded-full active:scale-95 transition"
          >
            {t('workspace.start')}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {designs.map((d, i) => (
            <div
              key={d.id}
              className="group rounded-2xl glass border border-cream/10 p-3.5 flex items-center gap-3 active:scale-[0.98] transition animate-float-in cursor-pointer"
              style={{ animationDelay: `${i * 0.04}s` }}
              onClick={() => onOpenDesign(d)}
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 border border-cream/10"
                style={{ background: d.canvas_data?.bg ?? '#004B23' }}
              >
                <FileText className="w-6 h-6 text-gold" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-[14px] font-bold text-paper truncate">{d.title}</h4>
                <p className="text-[11px] text-cream/45 capitalize mt-0.5">
                  {d.template_type.replace('_', ' ')} · {d.canvas_data?.elements?.length ?? 0} {t('workspace.layers')}
                </p>
                <p className="text-[10px] text-cream/30 flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3" /> {fmtDate(d.updated_at)}
                </p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); del(d.id); }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-cream/30 hover:text-red-300 active:scale-90 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
