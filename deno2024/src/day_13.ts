import { assertEquals } from "@std/assert";
import { fileLines } from "./lib.ts";
import { Puzzle, Results } from "./Puzzle.ts";
import { Optimizer1, puzzle1Machine, solveMachine } from "./day_13_model.ts";

export class Day13 extends Puzzle<Results> {
  constructor() {
    super(13);
  }

  async load() {
    return Promise.resolve(puzzle1Machine());
  }

  async solve1() {
    const clawgame = await this.load();
    // const stats = Optimizer1.machineStats(data);
    // return stats;
    const totalCost1 = solveMachine(clawgame);
    const winnable1 = clawgame.solutions.reduce(
      (acc, s) => acc + s.cost > 0 ? 1 : 0,
      0,
    );
    assertEquals(clawgame.solutions.length, clawgame.games.length);
    // could audit solutions 35574
    return { totalCost1, total1: clawgame.solutions.length, winnable1 };
  }

  async solve2() {
    const adjustment = 10000000000000;
    const clawgame = await this.load();
    for (const game of clawgame.games) {
      const [px, py] = game.prize;
      const newPos: XY = [px + adjustment, py + adjustment];
      game.prize = newPos;
    }

    const totalCost2 = solveMachine(clawgame);
    const winnable2 = clawgame.solutions.reduce(
      (acc, s) => acc + s.cost > 0 ? 1 : 0,
      0,
    );
    assertEquals(clawgame.solutions.length, clawgame.games.length);
    // could audit solutions 35574
    return { totalCost2, total2: clawgame.solutions.length, winnable2 };
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
