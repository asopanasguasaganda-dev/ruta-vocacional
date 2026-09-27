import { useEffect, useId, useRef } from "react";
import type { ReactNode } from "react";
import { X } from "lucide-react";
import { IconButton } from "./primitives";
export function Dialog({
  open,
  title,
  children,
  onClose,
  wide = false,
  side = false,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
  side?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
    return () => {
      if (el.open) el.close();
    };
  }, [open]);
  return (
    <dialog
      ref={ref}
      className={"dialog " + (wide ? "dialog--wide " : "")+(side?'dialog--side':'')}
      aria-labelledby={id}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="dialog-inner">
        <header className="section-title">
          <h2 id={id}>{title}</h2>
          <IconButton label="Cerrar ventana" onClick={onClose}>
            <X size={20} />
          </IconButton>
        </header>
        {children}
      </div>
    </dialog>
  );
}
