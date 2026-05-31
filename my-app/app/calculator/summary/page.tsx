'use client';

import { useLocalStorageSync } from '@/components/calculator/hooks/useLocalStorageSync';
import ProgressBar from '@/components/calculator/components/ProgressBar';
import SidePanel from '@/components/calculator/components/SidePanel';

export default function SummaryPage() {
  const hydrated = useLocalStorageSync();
  if (!hydrated) return null;

  return (
    <main style={{ padding: '32px', maxWidth: '1100px', margin: '0 auto' }}>
      <ProgressBar currentStep="summary" />
      <div style={{ display: 'flex', gap: '32px', marginTop: '24px' }}>
        <section style={{ flex: 1 }}>
          <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>
            סיכום — ניתוח השקעה
          </h1>
          <p style={{ color: '#6b7280' }}>בפיתוח...</p>
        </section>
        <SidePanel />
      </div>
    </main>
  );
}
