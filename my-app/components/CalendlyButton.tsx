'use client';

import { useState } from 'react';
import { PopupModal } from 'react-calendly';
import calendlyData from '@/data/calendly.json';

interface CalendlyButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export default function CalendlyButton({ className, children }: CalendlyButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>
        {children ?? calendlyData.buttonText}
      </button>

      {open && (
        <PopupModal
          url={calendlyData.url}
          rootElement={document.body}
          onModalClose={() => setOpen(false)}
          open={open}
        />
      )}
    </>
  );
}
