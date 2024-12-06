import React from "react";
import { Info, AlertCircle } from "lucide-react";

type CalloutVariant = "info" | "danger";

interface BaseCalloutProps {
  children: React.ReactNode;
  className?: string;
}

interface InfoCalloutProps extends BaseCalloutProps {
  variant: "info";
  actionText?: string;
}

interface DangerCalloutProps extends BaseCalloutProps {
  variant: "danger";
  actionText?: string;
}

type CalloutProps = InfoCalloutProps | DangerCalloutProps;

const variantStyles = {
  info: {
    container: "bg-blue-50",
    icon: "text-blue-600",
    action: "bg-blue-600 text-white cursor-default",
  },
  danger: {
    container: "bg-red-50",
    icon: "text-red-600",
    action: "bg-red-600 text-white",
  },
};

export const Callout: React.FC<CalloutProps> = ({
  variant,
  children,
  className = "",
  actionText,
}) => {
  const styles = variantStyles[variant];
  const Icon = variant === "info" ? Info : AlertCircle;

  return (
    <div
      className={`relative rounded-lg p-4 my-2 border ${styles.container} ${className}`}
    >
      <div className="flex">
        {!actionText && (
          <div className="flex-shrink-0">
            <Icon className={`h-5 w-5 ${styles.icon}`} />
          </div>
        )}
        <div className="ml-3">
          <div className="text-sm">{children}</div>
        </div>
      </div>
      {actionText && (
        <div className="absolute -right-2 -top-2">
          <p className={`rounded-md p-2 text-sm font-medium ${styles.action}`}>
            {actionText}
          </p>
        </div>
      )}
    </div>
  );
};

export const InfoCallout: React.FC<Omit<InfoCalloutProps, "variant">> = (
  props
) => <Callout variant="info" {...props} />;

export const DangerCallout: React.FC<Omit<DangerCalloutProps, "variant">> = (
  props
) => <Callout variant="danger" {...props} />;
