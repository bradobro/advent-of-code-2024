import { assertEquals } from "@std/assert";
import { fileLines } from "./lib.ts";
import { Puzzle, Results } from "./Puzzle.ts";
import { findRobot, moveBot1, parseWarehouse, tally } from "./day_15_model.ts";

export class Day15 extends Puzzle<Results> {
  constructor() {
    super(15);
  }

  async load() {
    const src = await Deno.readTextFile(this.dataFilePath);
    return parseWarehouse(src);
  }

  async solve1() {
    const { wh, inst } = await this.load();
    inst.reduce((loc, d) => moveBot1(wh, loc, d), findRobot(wh));
    const gpsTally1 = tally(wh);
    return { gpsTally1 };
  }

  async solve2() {
    const data = await this.load();
    return { data };
  }

  override async solve(): Promise<Results> {
    const which = 1;
    const _results1 = which & 1 ? await this.solve1() : { puz1Skip: 1 };
    const _results2 = which & 2 ? await this.solve2() : { puz2Skip: 1 };
    console.debug({ _results1, _results2 });
    const results = {};
    return { day: this.dayNumber, hash: await this.hash(results), results };
  }
}
