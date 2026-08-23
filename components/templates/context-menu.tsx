import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

type ContextMenuContextType = {
  open: boolean;
  toggle: () => void;
  close: () => void;
  triggerRect: DOMRect | null;
  setTriggerRect: (rect: DOMRect | null) => void;
  menuElement: HTMLDivElement | null;
  setMenuElement: (node: HTMLDivElement | null) => void;
};

const ContextMenuContext = createContext<ContextMenuContextType | null>(null);

export const ContextMenu = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);
  const [menuElement, setMenuElement] = useState<HTMLDivElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      const insideRoot = rootRef.current?.contains(target);
      const insideMenu = menuElement?.contains(target);

      if (!insideRoot && !insideMenu) {
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
  }, [menuElement]);

  return (
    <ContextMenuContext.Provider
      value={{
        open,
        toggle: () => setOpen((current) => !current),
        close: () => setOpen(false),
        triggerRect,
        setTriggerRect,
        menuElement,
        setMenuElement,
      }}
    >
      <div ref={rootRef} className="inline-block text-left">
        {children}
      </div>
    </ContextMenuContext.Provider>
  );
};

export const ContextMenuTrigger = ({
  children,
  className = "bg-gray-400 text-white text-sm font-bold p-1 rounded hover:bg-gray-500 active:bg-gray-600",
}: {
  children: ReactNode;
  className?: string;
}) => {
  const context = useContext(ContextMenuContext);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  if (!context) {
    throw new Error("ContextMenuTrigger must be used inside a ContextMenu.");
  }

  const handleClick = () => {
    if (triggerRef.current) {
      context.setTriggerRect(triggerRef.current.getBoundingClientRect());
    }
    context.toggle();
  };

  return (
    <button
      ref={triggerRef}
      type="button"
      className={className}
      onClick={handleClick}
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
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  if (!context) {
    throw new Error("ContextMenuContent must be used inside a ContextMenu.");
  }

  useEffect(() => {
    context.setMenuElement(contentRef.current);
    return () => {
      context.setMenuElement(null);
    };
  }, [context]);

  useLayoutEffect(() => {
    if (!context.open || !context.triggerRect || !contentRef.current) {
      return;
    }

    const offset = 8;
    const menuRect = contentRef.current.getBoundingClientRect();
    const top = Math.min(
      Math.max(context.triggerRect.bottom + offset, offset),
      window.innerHeight - menuRect.height - offset,
    );

    let left =
      align === "right"
        ? context.triggerRect.right - menuRect.width
        : context.triggerRect.left;

    left = Math.max(
      offset,
      Math.min(left, window.innerWidth - menuRect.width - offset),
    );

    setPosition({ top, left });
  }, [context.open, context.triggerRect, align, children]);

  if (!context.open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      ref={contentRef}
      style={{
        position: "fixed",
        top: position.top,
        left: position.left,
        zIndex: 9999,
      }}
      className={`w-40 max-w-[calc(100vw-2rem)] rounded-md border bg-white shadow-lg ${className}`}
      role="menu"
    >
      {children}
    </div>,
    document.body,
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
