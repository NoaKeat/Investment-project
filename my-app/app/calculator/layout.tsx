import Header from '@/components/Header/Header';

export default function CalculatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}
