import { assert } from "@std/assert/assert";
import { fileLines } from "./lib.ts";
import { Puzzle } from "./Puzzle.ts";

const instructionRE = /mul\((\d{1,3}),(\d{1,3})\)/g;

export class Day03 extends Puzzle {
  constructor() {
    super(5, "day_03.txt");
  }

  processLine(line: string) {
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

  async processLines() {
    let lines = 0;
    let matches = 0;
    let total = 0;
    for await (const line of fileLines(this.dataFilePath)) {
      const [matchCount, sum] = this.processLine(line);
      matches += matchCount;
      total += sum;
      lines += 1;
      // break;
    }
    return { lines, matches, total };
  }

  override async solve(): Promise<void> {
    const result = await this.processLines();
    console.log(result);
  }
}
