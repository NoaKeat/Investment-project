"use client";

import { PopupModal } from "react-calendly";
import { useState, useEffect } from "react";
import styles from "./CalendlyButton.module.css";

import data from "@/data/calendly.json";

export default function CalendlyButton() {
  const [open, setOpen] = useState(false);
  const [root, setRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setRoot(document.body);
  }, []);

  return (
    <>
      <button className={styles.button} onClick={() => setOpen(true)}>
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