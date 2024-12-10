import { assertEquals } from "@std/assert";
import { fileLines } from "./lib.ts";
import { Puzzle, Results } from "./Puzzle.ts";

export class DayNext extends Puzzle<Results> {
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
    const _data = await this.load();
    // console.debug(_data);
    const results = {};
    return { day: this.dayNumber, hash: await this.hash(results), results };
  }
}
