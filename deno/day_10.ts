import { assertEquals } from "@std/assert";
import { fileLines } from "./lib.ts";
import { Puzzle, Results } from "./Puzzle.ts";

export class Day10 extends Puzzle<Results> {
  constructor() {
    super(10);
  }

  async load() {
    let lineCount = 0;
    const lines: string[] = [];
    for await (const line of fileLines(this.dataFilePath)) {
      lines.push(line);
      lineCount++;
    }
    assertEquals(lineCount, lines.length);
    return { lines, lineCount };
  }

  override async solve(): Promise<Results> {
    const { lineCount, lines } = await this.load();
    const results = { lineCount, lines: lines.length };
    return { day: this.dayNumber, hash: await this.hash(results), results };
  }
}
