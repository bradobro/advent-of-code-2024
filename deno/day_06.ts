import { assertEquals } from "@std/assert";
import { fileLines, readXyMatrix, xyMatrixLines } from "./lib.ts";
import { Puzzle, Results } from "./Puzzle.ts";

export class Day06 extends Puzzle<Results> {
  constructor() {
    super(6);
  }

  async load() {
    const lab = await readXyMatrix(this.dataFilePath);
    return { lab, nX: lab.length, nY: lab[0].length };
  }

  override async solve(): Promise<Results> {
    const { lab, nX, nY } = await this.load();
    for (const line of xyMatrixLines(lab)) console.debug(line.join(""));
    const results = { nX, nY };
    return { day: 5, hash: await this.hash(results), results };
  }
}
