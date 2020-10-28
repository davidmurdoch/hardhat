import { CLIOptionalParamDefinition } from "../../types";
import { HARDHAT_PARAM_DEFINITIONS } from "../core/params/hardhat-params";
import type hardhat from "../lib/hardhat-lib";

import { ArgumentsParser } from "./ArgumentsParser";

interface CompletionEnv {
  line: string;
  words: number;
  last: string;
  prev: string;
}

export async function complete(env: CompletionEnv): Promise<string[]> {
  let hre: typeof hardhat;
  try {
    hre = require("../lib/hardhat-lib");
  } catch (e) {
    return [];
  }

  const words = env.line.split(/\s+/).slice(0, -1)

  const coreFlags = Object.values(HARDHAT_PARAM_DEFINITIONS)
    .map((x) => x.name)
    .map(ArgumentsParser.paramNameToCLA)
    .filter((x) => !words.includes(x));

  let task: string | undefined
  let index = 1
  while (index < words.length) {
    if (isGlobalFlag(words[index])) {
      index += 1
    }
    else if (isGlobalParam(words[index])) {
      index += 2
    } else {
      task = words[index]
      break
    }
  }

  if (env.prev === "--network") {
    return Object.keys(hre.config.networks)
  }

  if (env.prev.startsWith("--")) {
    const flagName = ArgumentsParser.cLAToParamName(env.prev)

    const globalParam: any = (HARDHAT_PARAM_DEFINITIONS as any)[flagName]
    if (globalParam !== undefined && !globalParam.isFlag) {
      return [];
    }
  }

  if (task === undefined) {
    const tasks = Object.values(hre.tasks)
      .map((x: any) => x.name)
      .filter((x: string) => !x.includes(":"));
    return [...tasks, ...coreFlags];
  }

  const taskFlags = Object.values(hre.tasks[task].paramDefinitions)
    .map((x) => x.name)
    .map(ArgumentsParser.paramNameToCLA)
    .filter((x) => !words.includes(x));

  return [...taskFlags, ...coreFlags];
}

function isGlobalFlag(flag: string): boolean {
  const flagName = ArgumentsParser.cLAToParamName(flag)
  return (HARDHAT_PARAM_DEFINITIONS as any)[flagName]?.isFlag === true
}

function isGlobalParam(flag: string): boolean {
  const flagName = ArgumentsParser.cLAToParamName(flag)
  return (HARDHAT_PARAM_DEFINITIONS as any)[flagName]?.isFlag === false
}