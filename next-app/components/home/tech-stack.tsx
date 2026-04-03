"use client";

import Image from "next/image";

import dockerIcon from "@/assets/icons/docker.svg";
import gitIcon from "@/assets/icons/icons8-git-96.svg";
import githubIcon from "@/assets/icons/icons8-github-96.png";
import javascriptIcon from "@/assets/icons/icons8-javascript-96.svg";
import nextjsIcon from "@/assets/icons/icons8-nextjs-96.svg";
import nodejsIcon from "@/assets/icons/icons8-nodejs-96.svg";
import pythonIcon from "@/assets/icons/icons8-python-96.svg";
import reactIcon from "@/assets/icons/icons8-react-native-96.svg";
import tailwindIcon from "@/assets/icons/icons8-tailwind-css-96.svg";
import typescriptIcon from "@/assets/icons/icons8-typescript-96.svg";
import archLinuxIcon from "@/assets/icons/arch-linux.svg";
import fastapiIcon from "@/assets/icons/fastapi.svg";
import goIcon from "@/assets/icons/go.svg";
import jupyterIcon from "@/assets/icons/jupyter.svg";
import linuxIcon from "@/assets/icons/linux.svg";
import mongodbIcon from "@/assets/icons/mongodb.svg";
import mysqlIcon from "@/assets/icons/mysql.svg";
import numpyIcon from "@/assets/icons/numpy.svg";
import postgresqlIcon from "@/assets/icons/postgresql.svg";
import postmanIcon from "@/assets/icons/postman.svg";
import pytorchIcon from "@/assets/icons/pytorch.svg";
import redisIcon from "@/assets/icons/redis.svg";
import vimIcon from "@/assets/icons/vim.svg";
import vscodeIcon from "@/assets/icons/vscode.svg";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import { TECH_STACK } from "./data/tech-stack";
import { Panel, PanelContent, PanelHeader, PanelTitle } from "./panel";

const LOCAL_ICON_MAP = {
  typescript: typescriptIcon,
  js: javascriptIcon,
  python: pythonIcon,
  nodejs: nodejsIcon,
  react: reactIcon,
  nextjs2: nextjsIcon,
  tailwindcss: tailwindIcon,
  git: gitIcon,
  github: githubIcon,
  docker: dockerIcon,
  mysql: mysqlIcon,
  mongodb: mongodbIcon,
  postgresql: postgresqlIcon,
  redis: redisIcon,
  go: goIcon,
  linux: linuxIcon,
  archlinux: archLinuxIcon,
  vim: vimIcon,
  vscode: vscodeIcon,
  numpy: numpyIcon,
  jupyter: jupyterIcon,
  pytorch: pytorchIcon,
  postman: postmanIcon,
  fastapi: fastapiIcon,
};

export function TechStack() {
  return (
    <Panel id="stack">
      <PanelHeader>
        <PanelTitle>Stack</PanelTitle>
      </PanelHeader>

      <PanelContent className="p-0">
        <div className="border-y border-line p-4">
          <ul className="flex flex-wrap gap-4 select-none">
            {TECH_STACK.map((tech) => {
              const icon = LOCAL_ICON_MAP[tech.key as keyof typeof LOCAL_ICON_MAP];

              return (
                <li key={tech.key} className="flex">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a href={tech.href} target="_blank" rel="noopener" aria-label={tech.title}>
                        <Image
                          src={icon}
                          alt={`${tech.title} icon`}
                          width={32}
                          height={32}
                          className="h-8 w-8"
                          unoptimized
                        />
                      </a>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{tech.title}</p>
                    </TooltipContent>
                  </Tooltip>
                </li>
              );
            })}
          </ul>
        </div>
      </PanelContent>
    </Panel>
  );
}
