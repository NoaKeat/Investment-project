"use client";

import { PopupModal } from "react-calendly";
import { useState, useEffect } from "react";

import data from "@/data/calendly.json";

interface CalendlyButtonProps {
  className?: string;
}

export default function CalendlyButton({
  className,
}: CalendlyButtonProps) {
  const [open, setOpen] = useState(false);
  const [root, setRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setRoot(document.body);
  }, []);

  return (
    <>
      <button
        className={className}
        onClick={() => setOpen(true)}
      >
        {data.buttonText}
      </button>

      {root && (
        <PopupModal
          url={data.url}
          open={open}
          onModalClose={() => setOpen(false)}
          rootElement={root}
        />
      )}
    </>
  );
}