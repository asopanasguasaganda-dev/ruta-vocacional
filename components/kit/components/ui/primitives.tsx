import {StyledSelect} from './StyledSelect';
import { useId } from "react";
import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { ArrowRight, Check, Info, LoaderCircle } from "lucide-react";
import type { Tone } from "../../types";
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
  loading?: boolean;
  icon?: ReactNode;
}
export function Button({
  variant = "primary",
  size = "md",
  loading,
  icon,
  children,
  className = "",
  disabled,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={
        "button button--" + variant + " button--" + size + " " + className
      }
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <LoaderCircle size={18} className="spin" aria-hidden="true" />
      ) : (
        icon
      )}
      {children}
    </button>
  );
}
export function IconButton({
  label,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      type="button"
      {...props}
      className={"icon-button " + (props.className || "")}
      aria-label={label}
      title={label}
    >
      {children}
    </button>
  );
}
export function Card({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={"card " + className} {...props} />;
}
export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: Tone;
}) {
  return <span className={"badge badge--" + tone}>{children}</span>;
}
export function Avatar({ name, small }: { name: string; small?: boolean }) {
  return (
    <span
      className={"avatar " + (small ? "avatar--sm" : "")}
      aria-hidden="true"
    >
      {name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")}
    </span>
  );
}
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="page-header">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 tabIndex={-1}>{title}</h1>
        {description && <p className="muted">{description}</p>}
      </div>
      {actions && <div className="actions">{actions}</div>}
    </header>
  );
}
type FieldMeta = { label: string; error?: string; hint?: string };
export function Field({
  label,
  error,
  hint,
  id,
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement> & FieldMeta) {
  const auto = useId();
  const key = id || auto;
  const desc = error || hint;
  return (
    <div className={"field " + className}>
      <label htmlFor={key}>{label}</label>
      <input
        id={key}
        aria-invalid={!!error}
        aria-describedby={desc ? key + "-hint" : undefined}
        {...props}
      />
      {desc && (
        <small id={key + "-hint"} className={error ? "error-text" : "muted"}>
          {desc}
        </small>
      )}
    </div>
  );
}
export function SelectField({
  label,
  error,
  hint,
  id,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & FieldMeta) {
  const auto = useId();
  const key = id || auto;
  return (
    <div className="field">
      <label htmlFor={key}>{label}</label>
      <StyledSelect
        id={key}
        aria-invalid={!!error}
        aria-describedby={error || hint ? key + "-hint" : undefined}
        {...props}
      >
        {children}
      </StyledSelect>
      {(error || hint) && (
        <small id={key + "-hint"} className={error ? "error-text" : "muted"}>
          {error || hint}
        </small>
      )}
    </div>
  );
}
export function TextareaField({
  label,
  id,
  error,
  hint,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & FieldMeta) {
  const auto = useId();
  const key = id || auto;
  return (
    <div className="field">
      <label htmlFor={key}>{label}</label>
      <textarea
        id={key}
        aria-describedby={error || hint ? key + "-hint" : undefined}
        aria-invalid={!!error}
        {...props}
      />
      {(error || hint) && (
        <small id={key + "-hint"} className={error ? "error-text" : "muted"}>
          {error || hint}
        </small>
      )}
    </div>
  );
}
export function Checkbox({
  label,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: ReactNode }) {
  return (
    <label className="checkbox">
      <input {...props} type="checkbox" />
      <span>{label}</span>
    </label>
  );
}
export function Progress({
  value,
  total = 100,
  label,
  showValue = true,
}: {
  value: number;
  total?: number;
  label: string;
  showValue?: boolean;
}) {
  const pct =
    total > 0
      ? Math.min(100, Math.max(0, Math.round((value / total) * 100)))
      : 0;
  return (
    <div className="progress">
      <div className="progress-label">
        <span>{label}</span>
        {showValue && <b>{pct}%</b>}
      </div>
      <div
        className="progress-track"
        role="progressbar"
        aria-label={label}
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <span style={{ width: pct + "%" }} />
      </div>
    </div>
  );
}
export function Notice({
  children,
  tone = "primary",
}: {
  children: ReactNode;
  tone?: Tone;
}) {
  return (
    <div className={"notice notice--" + tone}>
      <Info size={20} aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <Card className="empty-state">
      <span className="icon-tile">
        <Info />
      </span>
      <h2>{title}</h2>
      {description && <p className="muted">{description}</p>}
      {action}
    </Card>
  );
}
export function MetricCard({
  label,
  value,
  note,
  icon,
}: {
  label: string;
  value: ReactNode;
  note?: string;
  icon?: ReactNode;
}) {
  return (
    <Card className="metric-card">
      <span className="icon-tile">{icon}</span>
      <div>
        <p className="muted small">{label}</p>
        <strong className="metric-value">{value}</strong>
        {note && <p className="small muted">{note}</p>}
      </div>
    </Card>
  );
}
export function Tabs({
  items,
  value,
  onChange,
  label = "Secciones",
}: {
  items: { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
  label?: string;
}) {
  return (
    <div className="tabs" aria-label={label}>
      {items.map((item) => (
        <button
          key={item.id}
          className={value === item.id ? "active" : ""}
          aria-pressed={value === item.id}
          onClick={() => onChange(item.id)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
export function SectionTitle({
  title,
  action,
}: {
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="section-title">
      <h2>{title}</h2>
      {action}
    </div>
  );
}
export function Stepper({
  labels,
  current,
}: {
  labels: string[];
  current: number;
}) {
  return (
    <ol className="stepper">
      {labels.map((label, i) => (
        <li
          key={label}
          className={i === current ? "current" : i < current ? "done" : ""}
          aria-current={i === current ? "step" : undefined}
        >
          <span>{i < current ? <Check size={15} /> : i + 1}</span>
          <b>{label}</b>
        </li>
      ))}
    </ol>
  );
}
export function ActionLink({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button className="text-link" onClick={onClick}>
      {children}
      <ArrowRight size={16} aria-hidden="true" />
    </button>
  );
}
