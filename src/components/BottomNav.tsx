import { Home, Layers, Settings, Wand2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export type Tab = 'home' | 'design' | 'workspace' | 'settings';

const TABS: { id: Tab; labelKey: string; icon: LucideIcon }[] = [
  { id: 'home', labelKey: 'nav.home', icon: Home },
  { id: 'design', labelKey: 'nav.studio', icon: Wand2 },
  { id: 'workspace', labelKey: 'nav.workspace', icon: Layers },
  { id: 'settings', labelKey: 'nav.settings', icon: Settings },
];

type Props = {
  active: Tab;
  onChange: (tab: Tab) => void;
};

export default function BottomNav({ active, onChange }: Props) {
  const { t } = useI18n();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 glass border-t border-cream/10 safe-bottom">
      <div className="flex items-center justify-around max-w-md mx-auto px-2 py-1.5">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className="flex flex-col items-center gap-1 py-2 px-3 active:scale-90 transition relative"
            >
              {isActive && (
                <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-gold" />
              )}
              <Icon
                className={`w-5.5 h-5.5 transition ${isActive ? 'text-gold' : 'text-cream/45'}`}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className={`text-[10px] font-semibold transition ${isActive ? 'text-gold' : 'text-cream/40'}`}>
                {t(tab.labelKey)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
