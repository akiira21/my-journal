"use client";

import { Layers, RefreshCcw, X } from "lucide-react";
import ToolTip from "../custom-tooltip";
import {
  useSandpackNavigation,
  UnstyledOpenInCodeSandboxButton,
} from "@codesandbox/sandpack-react";

interface SandpackButtonsProps {
  consoleRef: any;
}

const baseClass =
  "transition-all duration-50 hover:border-[rgba(59,87,246,0.81)] hover:border-2 ease-in-out hover:rounded-lg hover:shadow-[0_0_32px_rgba(59,130,246,0.6)] w-7 h-7 flex items-center justify-center border rounded-md text-foreground bg-white dark:bg-[#090a0f] dark:border-[#1f1f1f] hover:text-neutral-400 dark:border-neutral-700";

const SandpackButtons = ({
  consoleRef,
}: SandpackButtonsProps) => {
  const onClearConsole = () => {
    consoleRef.current?.reset();
  };

  const { refresh } = useSandpackNavigation();
  const buttons = [
    {
      label: "Open in CodeSandbox",
      target: (
        <div className={baseClass}>
          <UnstyledOpenInCodeSandboxButton>
            <Layers size={14} />
          </UnstyledOpenInCodeSandboxButton>
        </div>
      ),
    },
    {
      label: "Refresh pane",
      target: (
        <div onClick={() => refresh()} className={baseClass}>
          <RefreshCcw size={14} />
        </div>
      ),
    },
    {
      label: "Clear console",
      target: (
        <div ref={consoleRef} onClick={onClearConsole} className={baseClass}>
          <X size={14} />
        </div>
      ),
    },
  ];

  return (
    <div className="flex items-center gap-x-1 px-2">
      {buttons.map((button, index) => (
        <ToolTip key={index} target={button.target} content={button.label} />
      ))}
    </div>
  );
};

export default SandpackButtons;
