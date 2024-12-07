import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  header?: React.ReactNode;
  title?: string;
}

// Base Card Component
export const BaseCard = ({ children, className }: CardProps) => {
  return (
    <div
      className={`rounded-lg max-w-2xl bg-[#f6f9fe] p-4 border ${className}`}
    >
      {children}
    </div>
  );
};

// Title Card Component
export const TitleCard = ({ title, children, className }: CardProps) => {
  return (
    <div
      className={`rounded-lg max-w-2xl bg-[#f6f9fe] py-2 border ${className}`}
    >
      <p className="text-sm font-medium font-mono px-4">{title}</p>
      <hr className="my-2" />
      <div className="px-4 py-2">{children}</div>
    </div>
  );
};

// Custom Header Card Component
export const HeaderCard = ({ header, children, className }: CardProps) => {
  return (
    <div className={`rounded-lg max-w-2xl bg-[#f6f9fe] border ${className}`}>
      <div className="border-b border-gray-200 px-4 py-3">{header}</div>
      <div className="p-4">{children}</div>
    </div>
  );
};

// Depth Card Component
export const DepthCard = ({
  children,
  depth = 0,
  className,
}: CardProps & { depth?: 0 | 1 | 2 | 3 }) => {
  const depthClasses = {
    0: "border border-gray-200",
    1: "shadow-md",
    2: "shadow-lg",
    3: "shadow-xl",
  };

  return (
    <div
      className={`rounded-lg max-w-2xl bg-[#f6f9fe] px-4 py-5 border ${depthClasses[depth]} ${className}`}
    >
      {children}
    </div>
  );
};
