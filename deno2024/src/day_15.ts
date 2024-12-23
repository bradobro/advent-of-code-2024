import { assertEquals } from "@std/assert";
import { fileLines } from "./lib.ts";
import { Puzzle, Results } from "./Puzzle.ts";
import {
  doublesize,
  findRobot,
  moveBot1,
  moveBot2,
  parseWarehouse,
  tally,
} from "./day_15_model.ts";

export class Day15 extends Puzzle<Results> {
  constructor() {
    super(15);
  }

  async load() {
    const src = await Deno.readTextFile(this.dataFilePath);
    return parseWarehouse(src);
  }

  async solve1() {
    console.debug("running 1");
    const { wh, inst } = await this.load();
    inst.reduce((loc, d) => moveBot1(wh, loc, d), findRobot(wh));
    const gpsTally1 = tally(wh);
    return { gpsTally1 };
  }

  async solve2() {
    console.debug("running 2");
    const { wh, inst } = await this.load();
    const whd = doublesize(wh);
    let state = { wh: whd, bot: findRobot(whd) };
    for (const d of inst) state = moveBot2(state, d);
    const gpsTally2 = tally(state.wh);
    return { gpsTally2 };
  }

  override async solve(): Promise<Results> {
    const which = 3;
    const _results1 = which & 1 ? await this.solve1() : { puz1Skip: 1 };
    const _results2 = which & 2 ? await this.solve2() : { puz2Skip: 1 };
    console.debug({ _results1, _results2 });
    const results = {};
    return { day: this.dayNumber, hash: await this.hash(results), results };
  }
}
