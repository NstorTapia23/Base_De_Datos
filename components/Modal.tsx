"use client";

interface ModalProps {
  open: boolean;
  variant: "alert" | "confirm";
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export function Modal({
  open,
  variant,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
}: ModalProps) {
  if (!open) return null;

  function handleBackdropClick() {
    if (variant === "alert") onCancel?.();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={handleBackdropClick}
    >
      <div
        className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-base font-semibold text-zinc-800">{title}</h2>
        <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-600">
          {message}
        </p>
        <div className="mt-6 flex justify-end gap-2">
          {variant === "confirm" && (
            <button
              onClick={onCancel}
              className="rounded border border-zinc-300 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50"
            >
              {cancelText ?? "Cancelar"}
            </button>
          )}
          <button
            onClick={variant === "confirm" ? onConfirm : onCancel}
            className={
              "rounded px-4 py-2 text-sm text-white " +
              (variant === "confirm"
                ? "bg-red-600 hover:bg-red-700"
                : "bg-zinc-800 hover:bg-zinc-700")
            }
          >
            {variant === "confirm" ? confirmText ?? "Eliminar" : "Aceptar"}
          </button>
        </div>
      </div>
    </div>
  );
}
