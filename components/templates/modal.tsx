import React, { useEffect, useRef, useState } from "react";
import Image, { ImageProps } from "next/image";
import { CheckIcon, ChevronLeftIcon, XIcon } from "lucide-react";

type ModalSize = "xs" | "sm" | "md" | "lg" | "xl" | "xxl" | "xxxl";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: ModalSize;
  hideCross?: boolean;
  showTick?: boolean;
  modalTitle: string;
  handleTick?: () => void;
  isChild: boolean;
}

export const Modal = ({
  isOpen,
  onClose,
  children,
  size = "lg",
  hideCross,
  showTick,
  modalTitle,
  handleTick,
  isChild,
}: ModalProps) => {
  const [mounted, setMounted] = useState(isOpen);
  const [visible, setVisible] = useState(isOpen);
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const modalRef = useRef<HTMLDivElement | null>(null);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const dragDelta = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!isOpen) return;

    setMounted(true);
    setDragOffset({ x: 0, y: 0 });

    const frame = requestAnimationFrame(() => {
      setVisible(true);
    });

    return () => cancelAnimationFrame(frame);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) return;

    setVisible(false);
    setDragging(false);
    setDragOffset({ x: 0, y: 0 });
    dragStart.current = null;
    dragDelta.current = { x: 0, y: 0 };

    const timer = window.setTimeout(() => {
      setMounted(false);
    }, 220);

    return () => window.clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  const requestClose = () => {
    onClose();
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    if (!isChild) {
      const modalEl = modalRef.current;

      if (!modalEl || modalEl.scrollTop > 0) {
        return;
      }
    }

    dragStart.current = {
      x: event.clientX,
      y: event.clientY,
    };

    dragDelta.current = { x: 0, y: 0 };
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStart.current) return;

    const deltaX = event.clientX - dragStart.current.x;
    const deltaY = event.clientY - dragStart.current.y;

    if (isChild) {
      if (deltaX >= 0 || Math.abs(deltaX) < Math.abs(deltaY)) {
        return;
      }

      const nextOffset = { x: deltaX, y: 0 };
      dragDelta.current = nextOffset;
      setDragOffset(nextOffset);
      return;
    }

    if (deltaY <= 0 || Math.abs(deltaY) < Math.abs(deltaX)) {
      return;
    }

    const nextOffset = { x: 0, y: deltaY };
    dragDelta.current = nextOffset;
    setDragOffset(nextOffset);
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStart.current) return;

    const delta = dragDelta.current;
    const shouldClose = isChild ? delta.x < -100 : delta.y > 100;

    dragStart.current = null;

    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // no-op
    }

    if (shouldClose) {
      setDragging(false);
      setDragOffset({ x: 0, y: 0 });
      requestClose();
      return;
    }

    setDragging(false);
    setDragOffset({ x: 0, y: 0 });
  };

  const handlePointerCancel = (event: React.PointerEvent<HTMLDivElement>) => {
    dragStart.current = null;
    dragDelta.current = { x: 0, y: 0 };
    setDragging(false);
    setDragOffset({ x: 0, y: 0 });

    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // no-op
    }
  };

  if (!mounted) return null;

  const sizeClasses = {
    xs: "max-w-xs",
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    xxl: "max-w-2xl",
    xxxl: "max-w-3xl",
  };

  const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 0;
  const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 0;
  const baseOffset = visible ? 0 : isChild ? viewportWidth : viewportHeight;
  const transform = isChild
    ? `translate3d(${baseOffset + dragOffset.x}px, 0, 0)`
    : `translate3d(0, ${baseOffset + dragOffset.y}px, 0)`;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className={`absolute inset-0 ${!isChild ? "bg-black/50" : ""}`}
        onClick={requestClose}
      />

      <div className="absolute inset-0 flex items-end justify-center p-0 sm:items-center sm:p-4">
        <div
          className={`relative w-full ${sizeClasses[size]}`}
          style={{
            transform,
            transition: dragging ? "none" : "transform 220ms ease-out",
            willChange: "transform",
          }}
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          <div
            ref={modalRef}
            className="
              relative
              w-full
              h-[98dvh]
              sm:h-auto
              sm:max-h-[90vh]
              overflow-y-auto
              bg-white
              rounded-t-2xl
              sm:rounded-lg
              sm:border-3
              sm:border-gray-800
              overscroll-contain
            "
          >
            <div
              className="
                text-gray-900
                shadow-sm
                p-3
                flex
                flex-row
                justify-between
                sticky
                top-0
                bg-white
                rounded-b
                z-20
              "
              onPointerDown={!isChild ? handlePointerDown : undefined}
              onPointerMove={!isChild ? handlePointerMove : undefined}
              onPointerUp={!isChild ? handlePointerUp : undefined}
              onPointerCancel={!isChild ? handlePointerCancel : undefined}
              style={{
                touchAction: !isChild ? "none" : undefined,
              }}
            >
              {!hideCross ? (
                <button
                  type="button"
                  className={`rounded-4xl p-1 ${
                    isChild
                      ? "bg-gray-300 hover:bg-gray-400 active:bg-gray-500"
                      : "bg-red-300 hover:bg-red-400 active:bg-red-500"
                  }`}
                  onPointerDown={(event) => {
                    event.stopPropagation();
                  }}
                  onClick={(event) => {
                    event.stopPropagation();
                    requestClose();
                  }}
                >
                  {isChild ? <ChevronLeftIcon /> : <XIcon />}
                </button>
              ) : (
                <div className="p-4" />
              )}

              <h1 className="font-bold text-lg">{modalTitle}</h1>

              {showTick ? (
                <button
                  type="button"
                  className="
                    bg-green-300
                    rounded-4xl
                    p-1
                    hover:bg-green-400
                    active:bg-green-500
                  "
                  onPointerDown={(event) => {
                    event.stopPropagation();
                  }}
                  onClick={(event) => {
                    event.stopPropagation();
                    handleTick?.();
                  }}
                >
                  <CheckIcon />
                </button>
              ) : (
                <div className="p-4" />
              )}
            </div>

            <div
              className="
                m-3
                flex-1
                overscroll-contain
                pb-1
                sm:pb-0
              "
              onPointerDown={isChild ? handlePointerDown : undefined}
              onPointerMove={isChild ? handlePointerMove : undefined}
              onPointerUp={isChild ? handlePointerUp : undefined}
              onPointerCancel={isChild ? handlePointerCancel : undefined}
              style={{
                touchAction: isChild ? "pan-y" : "auto",
              }}
            >
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

type ImageModalProps = ImageProps & {
  overlayClassName?: string;
};

export const ImageModal = ({
  overlayClassName = "",
  className = "",
  ...props
}: ImageModalProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Image
        {...props}
        alt={props.alt ?? ""}
        unoptimized
        onClick={() => setOpen(true)}
        className={`cursor-pointer ${className}`}
      />

      {open && (
        <div
          onClick={() => setOpen(false)}
          className={`
            fixed inset-0 z-50
            flex items-center justify-center
            bg-black/80 p-8
            ${overlayClassName}
          `}
        >
          <div className="relative h-[90vh] w-[90vw]">
            <Image
              src={props.src}
              alt={props.alt ?? ""}
              fill
              sizes="90vw"
              className="object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
};
