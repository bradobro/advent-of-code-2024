import { assert } from "@std/assert/assert";
import { Puzzle, Results } from "./Puzzle.ts";
import { Direction, Matrix, readMatrix } from "./matrix.ts";

interface Location {
  visited: boolean;
  obstacle: boolean;
  guard: boolean;
}

enum MoveType {
  start, // used to start iterations
  turn, // x,y is same location
  move, // x,y is new location
  leave, // x,y is the (old) location left
}

type Lab = Matrix<Location>;

interface Move {
  kind: MoveType;
  facing: Direction;
  x: number;
  y: number;
}

class Guard {
  facing = Direction.N;

  constructor(
    public x: number,
    public y: number,
  ) {}

  visit(lab: Lab) {
    lab.getXY(this.x, this.y).visited = true;
  }

  iterMoves(lab: Lab) {
    let move: Move = {
      kind: MoveType.start,
      x: this.x,
      y: this.y,
      facing: Direction.N,
    };
    while (move.kind !== MoveType.leave) {
      const loc1 = lab.getXY(move.x, move.y);
      loc1.visited = true;
      let loc2 = lab.look;
    }
  }
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
    console.debug("results1=", results1);
    const results = {
      nX,
      nY,
      guards,
      obstacles,
      spaces,
      guardX,
      guardY,
    };
    return { day: 5, hash: await this.hash(results), results };
  }

  solvePuzzle1(lab: Matrix<Location>, guardX: number, guardY: number) {
    const guard = new Guard(guardX, guardY);
    guard.visit(lab);
    for (move of guard.iterMoves(lab)) {
      console.debug(move);
    }
    return { guard };
  }
}
