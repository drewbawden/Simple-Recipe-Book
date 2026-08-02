import React, { useEffect } from "react";
import { useState } from "react";
import Image, { ImageProps } from "next/image";

type ModalSize = "xs" | "sm" | "md" | "lg" | "xl" | "xxl" | "xxxl";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: ModalSize;
  hideCross?: boolean;
}

export const Modal = ({
  isOpen,
  onClose,
  children,
  size = "lg",
  hideCross,
}: ModalProps) => {
  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    xs: "max-w-xs",
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    xxl: "max-w-2xl",
    xxxl: "max-w-3xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>

      <div
        className={`
          relative w-full ${sizes[size]} 
          h-[92dvh] sm:h-auto sm:max-h-[90vh] 
          overflow-y-auto bg-white

          rounded-t-2xl

          sm:rounded-lg sm:border-3 sm:border-gray-800
        `}
      >
        {hideCross ?? (
          <button
            type="button"
            onClick={onClose}
            className="z-10 absolute top-0 right-0 text-gray-600 hover:text-gray-500 active:text-gray-400 p-2 focus:outline-none"
          >
            <svg
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        <div className="m-3 flex-1 overscroll-contain pb-1 sm:pb-0">
          {children}
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
              alt={props.alt}
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
