"use client";

import {
  SandpackProvider,
  SandpackPreview,
  SandpackCodeEditor,
  SandpackLayout,
  SandpackPredefinedTemplate,
  SandpackConsole,
  useSandpack,
} from "@codesandbox/sandpack-react";

import React from "react";
import setupFiles from "./sandpack-setup-files";
import { useTheme } from "next-themes";
import SandpackButtons from "./sandpack-buttons";
import { useSandpackTabsHook } from "./useSandpackTabsHook";

type SandpackTabsType = "preview" | "console";

interface SandpackOptions {
  editorWidthPercentage: number;
  editorHeight: number;
}

interface SandpackProps {
  template: SandpackPredefinedTemplate;
  options?: SandpackOptions;
  files: Record<string, any>;
  dependencies?: Record<string, string>;
  autorun?: boolean;
  defaultTab?: SandpackTabsType;
}

const defaultEditorOptions = {
  showInlineErrors: true,
  showLineNumbers: true,
  editorheight: 520,
};

const defaultFilesByTemplate: Record<SandpackPredefinedTemplate, any> = {
  react: setupFiles,
  "react-ts": "",
  vanilla: "",
  "vanilla-ts": "",
  angular: "",
  static: "",
  solid: "",
  svelte: "",
  "test-ts": "",
  vue: "",
  "vue-ts": "",
  node: "",
  nextjs: "",
  vite: "",
  "vite-react": "",
  "vite-react-ts": "",
  "vite-vue": "",
  "vite-vue-ts": "",
  astro: "",
  "vite-preact": "",
  "vite-preact-ts": "",
  "vite-svelte": "",
  "vite-svelte-ts": "",
};

const Sandpack = (props: SandpackProps) => {
  const {
    template,
    files,
    dependencies,
    autorun = true,
    options,
    defaultTab,
  } = props;
  const { theme } = useTheme();

  return (
    <SandpackProvider
      template={template}
      theme={theme === "dark" ? "dark" : "light"}
      files={{
        ...defaultFilesByTemplate[template],
        ...files,
      }}
      customSetup={{
        dependencies: dependencies || {},
      }}
      options={{
        autorun,
      }}
    >
      <SandpackLayout className="flex">
        <SandpackTabs />
        <div className="w-1/2 flex flex-col flex-1">
          <SandpackFilesTab />
          <SandpackCodeEditor
            {...defaultEditorOptions}
            showInlineErrors
            closableTabs
            showRunButton={false}
            showTabs={false}
            style={{
              height: defaultEditorOptions.editorheight - 40,
            }}
            className="border-l"
            wrapContent
          />
        </div>
      </SandpackLayout>
    </SandpackProvider>
  );
};

const SandpackTabs = () => {
  const consoleRef = React.useRef(null);
  const { SandpackTabs, activeTab } = useSandpackTabsHook();

  return (
    <div className="flex flex-col flex-1">
      <div className="flex items-center dark:bg-[#0f1117] bg-background justify-between h-[40px]">
        <SandpackTabs />

        <SandpackButtons consoleRef={consoleRef} />
      </div>
      <SandpackPreview
        showNavigator={false}
        showRefreshButton={false}
        showOpenInCodeSandbox={false}
        style={{
          height: defaultEditorOptions.editorheight - 40,
          display: activeTab === "preview" ? "flex" : "none",
        }}
      />
      <SandpackConsole
        showResetConsoleButton={false}
        ref={consoleRef}
        style={{
          height: defaultEditorOptions.editorheight - 40,
          width: "100%",
          display: activeTab === "console" ? "flex" : "none",
        }}
      />
    </div>
  );
};

const SandpackFilesTab = () => {
  const { sandpack } = useSandpack();

  const handleOpenFile = (file: string) => {
    sandpack.openFile(file);
  };

  return (
    <div className="flex gap-4 h-[40px] bg-background dark:bg-[#0f1117] border px-4">
      {Object.keys(sandpack.files).map((filename) => (
        <button
          key={filename}
          onClick={() => handleOpenFile(filename)}
          className={`text-sm font-medium ${
            sandpack.activeFile === filename
              ? "text-[#3579F6]"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {filename.split("/").pop()}
        </button>
      ))}
    </div>
  );
};

export default Sandpack;
