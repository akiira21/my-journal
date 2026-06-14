"use client";

import { useState, useEffect, useMemo } from "react";
import {
  SandpackProvider,
  SandpackPreview,
} from "@codesandbox/sandpack-react";

const sandpackTheme = {
  colors: {
    surface1: "#0d1117",
    surface2: "#161b22",
    surface3: "#21262d",
    clickable: "#30363d",
    base: "#e6edf3",
    disabled: "#484f58",
    hover: "#58a6ff",
    accent: "#58a6ff",
    error: "#f85149",
    errorSurface: "#3c0e0e",
    warning: "#f0883e",
    warningSurface: "#2c1a0e",
  },
  syntax: {
    plain: "#e6edf3",
    comment: "#8b949e",
    keyword: "#ff7b72",
    tag: "#7ee787",
    punctuation: "#79c0ff",
    definition: "#d2a8ff",
    property: "#79c0ff",
    static: "#e6edf3",
    string: "#a5d6ff",
  },
  font: {
    body: 'var(--font-geist-mono), "Fira Mono", "DejaVu Sans Mono", Menlo, Consolas, "Liberation Mono", Monaco, "Lucida Console", monospace',
    mono: 'var(--font-geist-mono), "Fira Mono", "DejaVu Sans Mono", Menlo, Consolas, "Liberation Mono", Monaco, "Lucida Console", monospace',
    size: "14px",
    lineHeight: "22px",
  },
};

type SandpackCanvasProps = {
  files: Record<string, string>;
  template?: "react" | "react-ts" | "vanilla" | "vanilla-ts";
  activeFile?: string;
};

function PreviewLoader() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-foreground" />
        <span className="font-mono text-[11px] text-muted-foreground">Loading preview...</span>
      </div>
    </div>
  );
}

export function SandpackCanvas({
  files,
  template = "react-ts",
  activeFile = "/App.tsx",
}: SandpackCanvasProps) {
  // Memoize files so Sandpack doesn't recompile when parent re-renders
  const memoFiles = useMemo(() => files, [files]);

  return (
    <SandpackProvider
      template={template}
      files={memoFiles}
      options={{
        activeFile,
        visibleFiles: Object.keys(memoFiles),
        recompileMode: "delayed",
        recompileDelay: 300,
      }}
      theme={sandpackTheme}
      style={{ height: "100%", width: "100%" }}
    >
      <div className="relative" style={{ height: "100%", width: "100%" }}>
        <PreviewLoader />
        <SandpackPreview
          showNavigator={false}
          showOpenInCodeSandbox={false}
          style={{
            height: "100%",
            width: "100%",
            minHeight: "100%",
            border: "none",
            background: "transparent",
            margin: 0,
            padding: 0,
          }}
        />
      </div>
    </SandpackProvider>
  );
}

export default SandpackCanvas;
