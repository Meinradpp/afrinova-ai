import { useState } from 'react';
import { AuthProvider, useAuth } from '@/lib/auth';
import { I18nProvider, useI18n } from '@/lib/i18n';
import LanguageScreen from '@/screens/LanguageScreen';
import AuthScreen from '@/screens/AuthScreen';
import HomeScreen, { type Category } from '@/screens/HomeScreen';
import DesignStudio from '@/screens/DesignStudio';
import WorkspaceScreen from '@/screens/WorkspaceScreen';
import SettingsScreen from '@/screens/SettingsScreen';
import AIAssistant from '@/screens/AIAssistant';
import BottomNav, { type Tab } from '@/components/BottomNav';
import type { Design } from '@/types';
import { Sparkles } from 'lucide-react';

function AppShell() {
  const { user, loading, error } = useAuth();
  const { hasChosen, t } = useI18n();
  const [tab, setTab] = useState<Tab>('home');
  const [editingDesign, setEditingDesign] = useState<Design | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-onyx flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-gold to-gold-soft flex items-center justify-center animate-pulse">
          <Sparkles className="w-8 h-8 text-emerald-deep" strokeWidth={2.5} />
        </div>
        <p className="text-cream/50 text-sm font-medium">{t('loading')}</p>
      </div>
    );
  }

  if (!hasChosen) return <LanguageScreen />;

  if (!user) return <AuthScreen />;

  const openCategory = (cat: Category) => {
    if (cat.id === 'ai-design' || cat.id === 'premium' || cat.id === 'ai-images') {
      setEditingDesign(null);
      setTab('design');
    } else {
      setTab('home');
    }
  };

  const openDesign = (d: Design) => {
    setEditingDesign(d);
    setTab('design');
  };

  const newDesign = () => {
    setEditingDesign(null);
    setTab('design');
  };

  const inStudio = tab === 'design';

  return (
    <div className="min-h-screen bg-onyx text-cream relative">
      {tab === 'home' && <HomeScreen onOpenCategory={openCategory} userName={user.email} />}
      {tab === 'design' && (
        <DesignStudio initialDesign={editingDesign} onBack={() => setTab('workspace')} />
      )}
      {tab === 'workspace' && <WorkspaceScreen onOpenDesign={openDesign} onNewDesign={newDesign} />}
      {tab === 'settings' && <SettingsScreen onUpgrade={() => setTab('home')} />}

      {!inStudio && <BottomNav active={tab} onChange={setTab} />}
      {!inStudio && <AIAssistant />}
    </div>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </I18nProvider>
  );
}
