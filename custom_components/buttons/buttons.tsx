import { cn } from "@/lib/utils";

interface ButtonProps {
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}

const SimpleButton = ({
  className,
  children,
  disabled,
  onClick,
}: ButtonProps) => (
  <button
    disabled={disabled}
    className={cn(
      "px-4 py-2 rounded-md text-sm",
      !disabled
        ? "bg-[#3579F6] text-white transition-all duration-300 ease-in-out hover:shadow-[0_0_32px_rgba(59,130,246,0.6)]"
        : "opacity-50 cursor-not-allowed border",
      className
    )}
    onClick={onClick}
  >
    {children}
  </button>
);

const GradientButton = ({ className, children, onClick }: ButtonProps) => (
  <div
    className={cn(
      "relative group text-sm py-2 px-4 rounded-md bg-[#F0F5FE] text-[#3E69F4] font-medium",
      className
    )}
  >
    <div className="absolute inset-0 transition-all duration-50 opacity-0 group-hover:opacity-100 -z-10">
      <div className="absolute inset-0 blur-md rounded-lg bg-gradient-to-r from-fuchsia-300 to-blue-400"></div>
    </div>
    <button
      className="relative transition-all duration-300 ease-in-out"
      onClick={onClick}
    >
      {children}
    </button>
  </div>
);

const IconButton = ({
  className,
  children,
  disabled,
  onClick,
}: ButtonProps) => (
  <button
    disabled={disabled}
    className={cn(
      "p-2 w-9 h-9 flex items-center justify-center border rounded-lg",
      !disabled
        ? "transition-all duration-50 hover:border-[rgba(59,87,246,0.81)] hover:border-2 hover:text-[rgba(59,87,246,0.81)] ease-in-out hover:rounded-xl hover:shadow-[0_0_32px_rgba(59,130,246,0.6)]"
        : "opacity-50 cursor-not-allowed",
      className
    )}
    onClick={onClick}
  >
    {children}
  </button>
);

export { SimpleButton, IconButton, GradientButton };
