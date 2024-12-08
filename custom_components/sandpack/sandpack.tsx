"use client";

import {
  SandpackProvider,
  SandpackPreview,
  SandpackCodeEditor,
  SandpackLayout,
  SandpackPredefinedTemplate,
  SandpackConsole,
} from "@codesandbox/sandpack-react";

import React from "react";
import setupFiles from "./sandpack-setup-files";
import { useTheme } from "next-themes";
import { IconButton } from "../buttons/buttons";
import { Layers } from "lucide-react";
import SandpackTabs from "./sandpack-tabs";
import ToolTip from "../custom-tooltip";
import SandpackButtons from "./sandpack-buttons";

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
  const { template, files, dependencies, autorun = true, options } = props;
  const { theme } = useTheme();

  const [activeTab, setActiveTab] = React.useState<SandpackTabsType>("preview");

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
      <SandpackLayout className="h-full">
        <div className="flex flex-1">
          <div className="flex flex-col w-full">
            <div className="flex items-center dark:bg-[#0f1117] bg-background justify-between h-[40px]">
              <SandpackTabs activeTab={activeTab} setActiveTab={setActiveTab} />

              <SandpackButtons />
            </div>
            {activeTab === "preview" ? (
              <SandpackPreview
                showNavigator={false}
                showRefreshButton={false}
                showOpenInCodeSandbox={false}
                style={{ height: defaultEditorOptions.editorheight - 40 }}
              />
            ) : (
              <SandpackConsole
                showResetConsoleButton={false}
                style={{
                  height: defaultEditorOptions.editorheight - 40,
                  width: "100%",
                }}
              />
            )}
          </div>
          <SandpackCodeEditor
            {...defaultEditorOptions}
            showRunButton={false}
            style={{
              height: defaultEditorOptions.editorheight,
              borderLeft: "1px solid #e5e7eb",
            }}
            wrapContent
          />
        </div>
      </SandpackLayout>
    </SandpackProvider>
  );
};

export default Sandpack;
