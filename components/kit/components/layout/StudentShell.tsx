import { useState, type ReactNode } from "react";
import Link from "next/link";
import { ChevronRight, Menu } from "lucide-react";
import { AccountMenu } from "./AccountHeader";
import { Dialog } from "../ui/Dialog";
import { studentNav } from "../../data/navigation";
import { routes } from "../../routes";
import type { View } from "../../types";
import "../../styles/student-workspace.css";
import "../../styles/workspace-theme.css";

export function StudentShell({
  children,
  view,
  action,
  focus = false,
}: {
  children: ReactNode;
  view: View;
  action?: ReactNode;
  focus?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const navigation = (
    <nav className="sw-navigation" aria-label="Módulos del estudiante">
      {studentNav.map(({ id, label, icon: Icon }) => (
        <Link
          key={id}
          href={routes[id]}
          aria-current={view === id ? "page" : undefined}
          onClick={() => setOpen(false)}
        >
          <Icon size={21} />
          <span>{label}</span>
          {view === id && <ChevronRight size={16} />}
        </Link>
      ))}
    </nav>
  );
  return (
    <div
      className={
        "compact-app student-workspace workspace-unified" +
        (focus ? " sw-focus compact-assessment" : "")
      }
    >
      <aside className="sw-sidebar">
        <Link className="sw-brand" href="/mi-ruta">
          <img src="/media/brain-book-icon.png" alt="" />
          <span>
            Ruta Vocacional <b>360°</b>
            <small>ESTUDIANTES</small>
          </span>
        </Link>
        {navigation}
        <span className="sw-side-footer">
          Orientación para tu siguiente paso
        </span>
      </aside>
      <div className="sw-workspace">
        <header className="sw-topbar">
          <button
            className="sw-menu-button"
            onClick={() => setOpen(true)}
            aria-label="Abrir módulos"
            aria-expanded={open}
          >
            <Menu size={22} />
          </button>
          <div className="sw-breadcrumb">
            <span>PLATAFORMA · ECUADOR</span>
            <strong>Ruta Vocacional 360°</strong>
          </div>
          <div className="sw-topbar-right">
            {action}
            <AccountMenu view={view} />
          </div>
        </header>
        <main
          id="contenido"
          className={
            focus ? "sw-content focus-main" : "sw-content compact-content"
          }
          key={view}
        >
          {children}
        </main>
        <footer className="sw-footer">
          <span>Ruta Vocacional 360°</span>Un espacio para descubrir, decidir y
          avanzar.
        </footer>
      </div>
      <Dialog open={open} title="Mi espacio" onClose={() => setOpen(false)}>
        <div className="sw-mobile-navigation">
          {navigation}
        </div>
      </Dialog>
    </div>
  );
}
