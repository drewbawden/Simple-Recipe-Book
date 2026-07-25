import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

type ContextMenuContextType = {
  open: boolean;
  toggle: () => void;
  close: () => void;
};

const ContextMenuContext = createContext<ContextMenuContextType | null>(null);

export const ContextMenu = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  return (
    <ContextMenuContext.Provider
      value={{
        open,
        toggle: () => setOpen((current) => !current),
        close: () => setOpen(false),
      }}
    >
      <div ref={rootRef} className="relative inline-block text-left">
        {children}
      </div>
    </ContextMenuContext.Provider>
  );
};

export const ContextMenuTrigger = ({
  children,
  className = "bg-gray-400 text-white text-sm font-bold p-1 rounded active:bg-gray-500",
}: {
  children: ReactNode;
  className?: string;
}) => {
  const context = useContext(ContextMenuContext);

  if (!context) {
    throw new Error("ContextMenuTrigger must be used inside a ContextMenu.");
  }

  return (
    <button
      type="button"
      className={className}
      onClick={context.toggle}
      aria-haspopup="menu"
      aria-expanded={context.open}
    >
      {children}
    </button>
  );
};

export const ContextMenuContent = ({
  align = "left",
  children,
  className = "",
}: {
  align?: "left" | "right";
  children: ReactNode;
  className?: string;
}) => {
  const context = useContext(ContextMenuContext);

  if (!context) {
    throw new Error("ContextMenuContent must be used inside a ContextMenu.");
  }

  if (!context.open) {
    return null;
  }

  const alignmentClass = align === "right" ? "right-0 left-auto" : "left-0";

  return (
    <div
      className={`absolute top-full mt-2 w-40 rounded-md border bg-white shadow-lg ${alignmentClass} ${className}`}
      role="menu"
    >
      {children}
    </div>
  );
};

export const ContextMenuItem = ({
  children,
  onSelect,
  className = "",
  ...props
}: {
  children: ReactNode;
  onSelect?: () => void;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const context = useContext(ContextMenuContext);

  if (!context) {
    throw new Error("ContextMenuItem must be used inside a ContextMenu.");
  }

  return (
    <button
      type="button"
      role="menuitem"
      className={`block w-full px-4 py-2 text-left hover:bg-gray-100 active:bg-gray-200 ${className}`}
      onClick={() => {
        onSelect?.();
        context.close();
      }}
      {...props}
    >
      {children}
    </button>
  );
};
