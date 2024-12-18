import { assertEquals } from "@std/assert";
import { fileLines } from "./lib.ts";
import { Puzzle, Results } from "./Puzzle.ts";
import {
  optimize2,
  optimize3,
  optimize4,
  Optimizer1,
  puzzle1Machine,
  solveMachine,
  supersizeMachine,
} from "./day_13_model.ts";
import { XY } from "./matrix.ts";

export class Day13 extends Puzzle<Results> {
  constructor() {
    super(13);
  }

  async load() {
    return await Promise.resolve(puzzle1Machine());
  }

  async solve1() {
    const clawgame = await this.load();
    const { tCost, nWinnable } = solveMachine(clawgame, optimize4, false);

    assertEquals(clawgame.solutions.length, clawgame.games.length);
    // assertEquals(tCost, 35574);
    return {
      nGames: clawgame.solutions.length,
      winnable1: nWinnable,
      totalCost1: tCost,
    };
  }

  async solve2() {
    const originalMachine = await this.load();
    const clawMachine = supersizeMachine(originalMachine);

    const { nWinnable: winnable2, tCost: totalCost2 } = solveMachine(
      clawMachine,
      optimize4,
      true,
    );

    return { totalCost2, total2: clawMachine.solutions.length, winnable2 };
  }

  override async solve(): Promise<Results> {
    const which = 3;
    const results1 = which & 1 ? await this.solve1() : { puz1Skip: 1 };
    const results2 = which & 2 ? await this.solve2() : { puz2Skip: 1 };
    // console.debug({ results1, results2 });
    const results = { ...results1, ...results2 };
    return { day: this.dayNumber, hash: await this.hash(results), results };
  }
}
