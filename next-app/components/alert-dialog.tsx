"use client";

import { useState } from "react";

interface AlertDialogProps {
  title?: string;
  message?: string;
  onConfirm?: () => void;
}

export function AlertDialog({ title = "Alert", message = "", onConfirm }: AlertDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const open = () => setIsOpen(true);
  const close = () => {
    setIsOpen(false);
    onConfirm?.();
  };

  const AlertDialogComponent = isOpen ? (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" onClick={close} />
      
      {/* Dialog */}
      <div className="relative z-10 mx-4 w-full max-w-[400px] overflow-hidden rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{title}</h3>
        </div>
        
        {/* Body */}
        <div className="px-6 py-4">
          <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">{message}</p>
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
          <button
            onClick={close}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return { open, close, isOpen, AlertDialogComponent };
}

// Simple hook version for easy usage
export function useAlertDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("Alert");
  const [message, setMessage] = useState("");
  const [onConfirmCallback, setOnConfirmCallback] = useState<(() => void) | undefined>(undefined);

  const open = (newTitle: string, newMessage: string, callback?: () => void) => {
    setTitle(newTitle);
    setMessage(newMessage);
    setOnConfirmCallback(() => callback);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    onConfirmCallback?.();
  };

  const AlertDialogComponent = isOpen ? (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" onClick={close} />
      
      {/* Dialog */}
      <div className="relative z-10 mx-4 w-full max-w-[400px] overflow-hidden rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{title}</h3>
        </div>
        
        {/* Body */}
        <div className="px-6 py-4">
          <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">{message}</p>
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
          <button
            onClick={close}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return { open, close, isOpen, AlertDialogComponent };
}
