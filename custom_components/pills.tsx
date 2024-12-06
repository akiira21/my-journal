import React from "react";

interface PillProps {
  children: React.ReactNode;
  variant?: "info" | "success" | "warning" | "danger";
  className?: string;
}

// Base Pill Component
const Pill = ({ children, variant = "info", className }: PillProps) => {
  const variants = {
    info: "bg-blue-50 text-blue-600",
    success: "bg-green-50 text-green-600",
    warning: "bg-orange-50 text-orange-600",
    danger: "bg-red-50 text-red-600",
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
