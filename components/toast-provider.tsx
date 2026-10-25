"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { CheckCircle2, CircleAlert, X } from "lucide-react";

type Toast = {
  id: number;
  tone: "success" | "error";
  message: string;
  action?: { label: string; href: string };
};

type ToastContextValue = {
  showToast: (toast: Omit<Toast, "id">) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);
const TOAST_DURATION_MS = 4000;

/** Site-wide notifications. A single polite live region so screen readers announce each message once. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);
  const nextId = useRef(0);
  const timer = useRef<number | undefined>(undefined);

  const dismiss = useCallback(() => {
    window.clearTimeout(timer.current);
    setToast(null);
  }, []);

  const showToast = useCallback((next: Omit<Toast, "id">) => {
    window.clearTimeout(timer.current);
    nextId.current += 1;
    setToast({ ...next, id: nextId.current });
    timer.current = window.setTimeout(() => setToast(null), TOAST_DURATION_MS);
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-region" role="status" aria-live="polite" aria-atomic="true">
        {toast && (
          <div className={`toast toast-${toast.tone}`} key={toast.id}>
            {toast.tone === "success" ? <CheckCircle2 aria-hidden="true" /> : <CircleAlert aria-hidden="true" />}
            <p>{toast.message}</p>
            {toast.action && <Link className="toast-action" href={toast.action.href} onClick={dismiss}>{toast.action.label}</Link>}
            <button className="toast-close" type="button" aria-label="Dismiss notification" onClick={dismiss}><X aria-hidden="true" /></button>
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within a ToastProvider.");
  return context;
}
