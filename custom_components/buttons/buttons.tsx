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
  <div className="relative group inline-block">
    <div className="absolute -inset-0.5 bg-gradient-to-r from-fuchsia-300 to-blue-400 rounded-lg blur opacity-0 group-hover:opacity-50 transition duration-300 group-hover:duration-200"></div>
    <button
      className={cn(
        "relative text-sm py-2 px-4 bg-white rounded-md text-[#3E69F4] font-medium",
        "transition-all duration-300 ease-in-out",
        className
      )}
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
