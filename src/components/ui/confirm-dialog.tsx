import { useState, useCallback, createContext, useContext, ReactNode } from "react";

interface ConfirmOptions {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "default";
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | null>(null);

export const useConfirmDialog = () => {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirmDialog must be inside ConfirmDialogProvider");
  return ctx.confirm;
};

export const ConfirmDialogProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<{
    open: boolean;
    options: ConfirmOptions;
    resolve: ((v: boolean) => void) | null;
  }>({ open: false, options: { title: "", description: "" }, resolve: null });

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({ open: true, options, resolve });
    });
  }, []);

  const handleClose = (result: boolean) => {
    state.resolve?.(result);
    setState((s) => ({ ...s, open: false, resolve: null }));
  };

  const variantStyles = {
    danger: {
      confirmBtn: "bg-red-600 hover:bg-red-700 text-white",
      icon: "text-red-600",
      border: "border-red-200",
    },
    warning: {
      confirmBtn: "bg-amber-600 hover:bg-amber-700 text-white",
      icon: "text-amber-600",
      border: "border-amber-200",
    },
    default: {
      confirmBtn: "bg-primary hover:bg-primary/90 text-primary-foreground",
      icon: "text-primary",
      border: "border-border",
    },
  };

  const v = variantStyles[state.options.variant || "default"];

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {state.open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => handleClose(false)} />
          <div className={`relative bg-card rounded-xl shadow-xl border ${v.border} p-6 w-full max-w-md mx-4 animate-in fade-in zoom-in-95 duration-200`}>
            <h3 className="text-lg font-semibold text-foreground mb-2">{state.options.title}</h3>
            <p className="text-sm text-muted-foreground mb-6">{state.options.description}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => handleClose(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-border bg-card text-foreground hover:bg-muted transition-colors"
              >
                {state.options.cancelLabel || "Cancelar"}
              </button>
              <button
                onClick={() => handleClose(true)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${v.confirmBtn}`}
              >
                {state.options.confirmLabel || "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};
