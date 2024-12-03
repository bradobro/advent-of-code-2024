import { assert } from "@std/assert/assert";
import { fileLines } from "./lib.ts";
import { Puzzle } from "./Puzzle.ts";

export class Day04 extends Puzzle {
  constructor() {
    super(7, "day_04.txt");
  }

  async processLines() {
    let lines = 0;
    for await (const line of fileLines(this.dataFilePath)) {
      console.debug(line);
      lines++;
    }
    return { lines };
  }

  override async solve(): Promise<void> {
    const result = await this.processLines();
    console.log({ day: 4, ...result });
  }
}
