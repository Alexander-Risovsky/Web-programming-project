import React, { useEffect } from "react";
import { createPortal } from "react-dom";

export default function ImagePreviewModal({ src, alt, onClose }) {
  useEffect(() => {
    if (!src) return undefined;

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [src, onClose]);

  if (!src) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 w-screen h-screen"
      onClick={onClose}
    >
      <div
        className="relative max-w-[95vw] max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-3 -right-3 flex items-center justify-center w-10 h-10 rounded-full bg-white text-slate-700 shadow-lg hover:bg-slate-100 transition"
          aria-label="Закрыть"
          title="Закрыть"
        >
          ✕
        </button>
        <img
          src={src}
          alt={alt || "Изображение"}
          className="block max-w-[95vw] max-h-[95vh] object-contain rounded-xl shadow-2xl bg-black/20"
        />
      </div>
    </div>,
    document.body
  );
}

