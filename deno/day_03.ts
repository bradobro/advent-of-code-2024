import { assert } from "@std/assert/assert";
import { fileLines } from "./lib.ts";
import { Puzzle } from "./Puzzle.ts";

const instructionRE = /mul\((\d{1,3}),(\d{1,3})\)/g;

const conditionalRE = /mul\((\d{1,3}),(\d{1,3})\)|(do)\(\)|(don't)\(\)/g;

export class Day03 extends Puzzle {
  enabled = true;

  constructor() {
    super(5, "day_03.txt");
  }

  unconditionallyProcessLine(line: string) {
    // const matches = instructionRE.exec(line);
    let sum = 0;
    let matchCount = 0;
    for (const match of line.matchAll(instructionRE)) {
      matchCount++;
      const a = parseInt(match[1]);
      const b = parseInt(match[2]);
      assert(!isNaN(a));
      assert(!isNaN(b));
      sum += a * b;
      // console.debug(match);
    }
    return [matchCount, sum];
  }

  conditionallyProcessLine(line: string) {
    let total = 0;
    for (const match of line.matchAll(conditionalRE)) {
      console.debug(match[0]);
      const instr = match[0];
      if (instr.startsWith("mul(")) {
        if (this.enabled) {
          const a = parseInt(match[1]);
          const b = parseInt(match[2]);
          assert(!isNaN(a));
          assert(!isNaN(b));
          total += a * b;
        }
      } else if (instr.startsWith("do(")) {
        this.enabled = true;
      } else if (instr.startsWith("don't(")) {
        this.enabled = false;
      } else {
        throw new Error("unexpected instruction " + instr);
      }
    }
    return total;
  }

  async processLines() {
    let lines = 0;
    let matches = 0;
    let total = 0;
    let enabledTotal = 0;
    for await (const line of fileLines(this.dataFilePath)) {
      const [matchCount, sum] = this.unconditionallyProcessLine(line);
      matches += matchCount;
      total += sum;
      lines += 1;
      enabledTotal += this.conditionallyProcessLine(line);
      // break;
    }
    return { lines, matches, total, enabledTotal };
  }

  override async solve(): Promise<void> {
    const result = await this.processLines();
    console.log(result);
  }
}
