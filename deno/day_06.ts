import { assertEquals } from "@std/assert";
import { fileLines } from "./lib.ts";
import { Puzzle, Results } from "./Puzzle.ts";

export class Day06 extends Puzzle<Results> {
  constructor() {
    super(1);
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
    return { day: 5, hash: await this.hash(results), results };
  }
}
