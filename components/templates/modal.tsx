import React from "react";
import { useState } from "react";
import Image, { ImageProps } from "next/image";

export const Modal = ({ isOpen, onClose, children, size = "md" }) => {
  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>

      <div
        className={`
      relative w-full ${sizes[size]} 
      max-h-[92vh] sm:max-h-[90vh] 
      overflow-y-auto bg-white p-6 shadow-xl transition-all

      rounded-t-2xl border-x-0 border-b-0 border-gray-900

      sm:rounded-lg sm:border-4
    `}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-500 active:text-gray-400 p-2 focus:outline-none"
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

        <div className="mt-2 pb-20 sm:pb-0">{children}</div>
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
