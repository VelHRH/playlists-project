"use client";

import { X } from "lucide-react";
import { useId, useState, type ReactNode } from "react";
import { cn } from "cn";
import { Button } from "./button";

type ModalProps = {
  title: string;
  trigger: (open: () => void) => ReactNode;
  children: (close: () => void) => ReactNode;
  className?: string;
};

export function Modal({ title, trigger, children, className }: ModalProps) {
  const [dialog, setDialog] = useState<HTMLDialogElement | null>(null);
  const headingId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const close = () => dialog?.close();

  return (
    <>
      {trigger(() => {
        setIsOpen(true);
        dialog?.showModal();
      })}
      <dialog
        ref={setDialog}
        aria-labelledby={headingId}
        onClose={() => setIsOpen(false)}
        className={cn(
          "m-auto w-[calc(100%-2rem)] max-w-lg rounded-2xl border bg-popover p-0 text-popover-foreground shadow-xl open:animate-in open:fade-in-0 open:zoom-in-95 open:duration-200",
          className,
        )}
      >
        {isOpen && (
        <div className="flex max-h-[85dvh] flex-col gap-5 overflow-y-auto p-6">
          <div className="flex items-start justify-between gap-4">
            <h2 id={headingId} className="text-xl font-semibold break-words">
              {title}
            </h2>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Закрити"
              className="-mt-0.5 -mr-2"
              onClick={close}
            >
              <X />
            </Button>
          </div>
          {children(close)}
        </div>
        )}
      </dialog>
    </>
  );
}
