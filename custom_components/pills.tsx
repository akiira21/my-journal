import React from "react";

interface PillProps {
  children: React.ReactNode;
  variant?: "info" | "success" | "warning" | "danger";
  className?: string;
}

// Base Pill Component
const Pill = ({ children, variant = "info", className }: PillProps) => {
  const variants = {
    info: "bg-blue-50 text-blue-600 dark:bg-[#0e121f] dark:text-[#5982ec]",
    success: "bg-green-50 text-green-600 dark:text-[#00f5bf] dark:bg-[#090a0f]",
    warning:
      "bg-orange-50 text-orange-600 dark:text-[#b66206] dark:bg-[#20160e]",
    danger: "bg-red-50 text-red-600 dark:bg-[#201015] dark:text-[#df414b]",
  };

  return (
    <span
      className={`inline-flex items-center py-1 px-2 rounded text-sm font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

// Specific Pill Components
export const InfoPill = ({ children, className }: PillProps) => (
  <Pill variant="info" className={className}>
    {children}
  </Pill>
);

export const SuccessPill = ({ children, className }: PillProps) => (
  <Pill variant="success" className={className}>
    {children}
  </Pill>
);

export const WarningPill = ({ children, className }: PillProps) => (
  <Pill variant="warning" className={className}>
    {children}
  </Pill>
);

export const DangerPill = ({ children, className }: PillProps) => (
  <Pill variant="danger" className={className}>
    {children}
  </Pill>
);
