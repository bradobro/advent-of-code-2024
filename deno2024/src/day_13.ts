import { assertEquals } from "@std/assert";
import { fileLines } from "./lib.ts";
import { Puzzle, Results } from "./Puzzle.ts";
import { Optimizer1, puzzle1Machine } from "./day_13_model.ts";

export class Day13 extends Puzzle<Results> {
  constructor() {
    super(13);
  }

  async load() {
    return Promise.resolve(puzzle1Machine());
  }

  async solve1() {
    const data = await this.load();
    const stats = Optimizer1.machineStats(data);
    return stats;
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
