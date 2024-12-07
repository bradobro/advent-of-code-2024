import { assert } from "@std/assert/assert";
import { Puzzle, Results } from "./Puzzle.ts";
import { Matrix, readMatrix } from "./matrix.ts";

interface Location {
  visited: boolean;
  obstacle: boolean;
  guard: boolean;
}

enum Facing {
  N = 0,
  S,
  E,
  W,
}

class Guard {
  facing = Facing.N;

  constructor(
    private lab: Matrix<Location>,
    public x: number,
    public y: number,
  ) {}
}

export class Day06 extends Puzzle<Results> {
  constructor() {
    super(6);
  }

  async load() {
    const raw = await readMatrix(this.dataFilePath);
    let spaces = 0;
    let guards = 0;
    let obstacles = 0;
    let guardX = -1;
    let guardY = -1;
    const lab = raw.mapCells((s, x, y) => {
      const cell = { visited: false, obstacle: s === "#", guard: s === "^" };
      if (cell.obstacle) obstacles++;
      else if (s === ".") spaces++;
      else if (cell.guard) {
        guards++;
        guardX = x;
        guardY = y;
      } else throw new Error(`unrecognized cell character: "${s}"`);
      return cell;
    });
    const [nX, nY] = lab.sizeXY();
    return { lab, nX, nY, spaces, guards, obstacles, guardX, guardY };
  }

  override async solve(): Promise<Results> {
    const { lab, nX, nY, guards, obstacles, spaces, guardX, guardY } =
      await this.load();
    assert(lab.getXY(guardX, guardY).guard, "We should have the guard here");
    const results1 = this.solvePuzzle1(lab, guardX, guardY);
    const results = { nX, nY, guards, obstacles, spaces, guardX, guardY };
    return { day: 5, hash: await this.hash(results), results };
  }

  solvePuzzle1(lab: Matrix<Location>, guardX: number, guardY: number) {
    return { guardX, guardY };
  }
}
