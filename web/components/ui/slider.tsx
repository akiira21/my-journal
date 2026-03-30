"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => {
  const { disabled } = props;

  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20">
        <SliderPrimitive.Range
          className={cn(
            "absolute h-full bg-[#3E69F4]",
            disabled && "bg-neutral-400",
          )}
        />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        className={cn(
          "block h-5 w-5 rounded-full border shadow-lg hover:shadow-[0_0_32px_rgba(59,130,246,1.0)] hover:border-[#3E69F4] bg-[#f6f9fe] transition-all duration-300 ease-in-out focus-visible:outline-none",
          disabled &&
            "cursor-not-allowed hover:border-neutral-200 hover:shadow-md",
        )}
      />
    </SliderPrimitive.Root>
  );
});
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
