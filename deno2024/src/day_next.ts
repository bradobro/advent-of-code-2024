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

  async solve1() {
    const data = await this.load();
    return { data };
  }

  async solve2() {
    const data = await this.load();
    return { data };
  }

  override async solve(): Promise<Results> {
    const which = 1;
    const results1 = which & 1 ? await this.solve1() : { puz1Skip: 1 };
    const results2 = which & 2 ? await this.solve2() : { puz2Skip: 1 };
    console.debug({ results1, results2 });
    const results = {};
    return { day: this.dayNumber, hash: await this.hash(results), results };
  }
}
