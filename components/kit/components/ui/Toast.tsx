import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { CheckCircle, X } from "lucide-react";
const ToastContext = createContext<(message: string) => void>(() => undefined);
export const useToast = () => useContext(ToastContext);
export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const show = useCallback((text: string) => {
    setMessage(text);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setMessage(""), 5000);
  }, []);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="toast-host" role="status" aria-live="polite">
        {message && (
          <div className="toast">
            <CheckCircle size={20} />
            <span>{message}</span>
            <button
              onClick={() => setMessage("")}
              aria-label="Cerrar notificación"
            >
              <X size={18} />
            </button>
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}
