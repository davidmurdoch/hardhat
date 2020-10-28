import { assert, expect } from "chai";

import { complete } from "../../../src/internal/cli/autocomplete";
import { useEnvironment } from "../../helpers/environment";
import { useFixtureProject } from "../../helpers/project";

const coreTasks = [
          "check",
          "clean",
          "compile",
          "console",
          "flatten",
          "help",
          "node",
          "run",
          "test",
]

const coreParams = [
        "--network",
        "--show-stack-traces",
        "--version",
        "--help",
        "--emoji",
        "--config",
        "--verbose",
        "--max-memory",
        "--tsconfig",
]

describe.only("autocomplete", () => {
  describe("basic project", () => {
    useFixtureProject("autocomplete/basic-project");
    
    it("should suggest all task names and global params", async () => {
      const suggestions = await complete({
        line: "hh ",
        words: 1,
        last: "",
        prev: "hh"
      });

      expect(suggestions).same.members([
        ...coreTasks,
        ...coreParams,
      ]);
    });

    it("should suggest all task names and global params when given a partial param", async () => {
      const suggestions = await complete({
        line: "hh --",
        words: 1,
        last: "--",
        prev: "hh"
      });

      expect(suggestions).same.members([
        ...coreTasks,
        ...coreParams,
      ]);
    });

    it("shouldn't suggest an already used flag", async () => {
      const suggestions = await complete({
        line: "hh --verbose ",
        words: 2,
        last: "",
        prev: "--verbose"
      });

      const coreParamsWithoutVerbose = coreParams.filter(x => x!== "--verbose")

      expect(suggestions).same.members([
        ...coreTasks,
        ...coreParamsWithoutVerbose,
      ]);
    });

    it("should suggest task flags", async () => {
      const suggestions = await complete({
        line: "hh compile ",
        words: 2,
        last: "",
        prev: "compile"
      });

      expect(suggestions).same.members([
        ...coreParams,
        "--force",
        "--quiet",
      ]);
    });

    it("should ignore already used flags", async () => {
      const suggestions = await complete({
        line: "hh --verbose compile --quiet ",
        words: 4,
        last: "",
        prev: "--quiet"
      });

      const coreParamsWithoutVerbose = coreParams.filter(x => x!== "--verbose")

      expect(suggestions).same.members([
        ...coreParamsWithoutVerbose,
        "--force",
      ]);
    });

    it("should suggest a network", async () => {
      const suggestions = await complete({
        line: "hh --network ",
        words: 2,
        last: "",
        prev: "--network"
      });

      expect(suggestions).same.members([
        "hardhat",
        "localhost"
      ]);
    });

    it("should suggest task names after global param", async () => {
      const suggestions = await complete({
        line: "hh --network localhost ",
        words: 3,
        last: "",
        prev: "localhost"
      });

      const coreParamsWithoutNetwork = coreParams.filter(x => x!== "--network")

      expect(suggestions).same.members([
        ...coreTasks,
        ...coreParamsWithoutNetwork
      ]);
    });
  });
});
