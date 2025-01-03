import { assert } from "@std/assert/assert";
import { Puzzle, Results } from "./Puzzle.ts";
import { CartesianMatrix, readMatrix, XY, xyEqual } from "./cartesianMatrix.ts";
import { Direction } from "./Direction.ts";
import { assertEquals } from "@std/assert/equals";

interface Location {
  visited: boolean;
  // lastFacing?: Direction; // needs to be redone
  facings: Set<Direction>;
  obstacle: boolean;
  guard: boolean;
}

enum MoveType {
  start, // used to start iterations
  turn, // x,y is same location
  move, // x,y is new location
  looping,
  leave, // x,y is the (old) location left
}

type Lab = CartesianMatrix<Location>;

interface Move {
  kind: MoveType;
  facing: Direction;
  xy: XY;
}

class Guard {
  facing = Direction.N;
  moves = 0;
  turns = 0;

  constructor(public xy: XY) {}

  visit(lab: Lab) {
    lab.getXY(this.xy).visited = true;
  }

  *iterMoves(lab: Lab, startAt: XY, startFacing: Direction): Generator<Move> {
    const move: Move = {
      kind: MoveType.start,
      xy: startAt,
      facing: startFacing,
    };
    this.xy = startAt;
    this.facing = startFacing;
    this.moves = 0;
    this.turns = 0;
    while (true) {
      const loc1 = lab.getXY(move.xy);
      loc1.visited = true;

      // EXIT if we're looping
      // if we've already been here, facing this way, we're looping
      if (loc1.facings.has(move.facing)) {
        move.kind = MoveType.looping;
        yield { ...move };
        break; // EXIT
      }
      loc1.facings.add(move.facing);

      // EXIT if we're leaving the map
      const xy2 = lab.look(move.xy, move.facing);
      if (xy2 === null) { //leaving map
        this.xy = [-1, -1]; // off map
        move.kind = MoveType.leave;
        yield { ...move };
        break; //EXIT
      }

      const loc2 = lab.getXY(xy2);
      if (loc2.obstacle) { // blocked
        move.kind = MoveType.turn;
        this.turns++;
        move.facing = (move.facing + 1) % 4; // rotate right 90 degrees
        this.facing = move.facing;
        // } else if (loc2.visited && loc2.lastFacing === move.facing) { // we're looping
        //   move.kind = MoveType.looping;
        //   yield { ...move };
        //   break; // EXITING because loop detected
      } else { //simple move in direction facing
        move.kind = MoveType.move;
        this.moves++;
        loc1.guard = false;
        loc2.guard = true;
        move.xy = xy2;
        this.xy = xy2;
      }
      yield { ...move };
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
      const cell: Location = {
        visited: false,
        obstacle: s === "#",
        guard: s === "^",
        facings: new Set<Direction>(),
        // addedObstacleCausesLoop: false,
      };
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
    assert(lab.getXY([guardX, guardY]).guard, "We should have the guard here");
    const results1 = this.solvePuzzle1(lab, [guardX, guardY]);
    const results2 = this.solvePuzzle2(lab, [guardX, guardY]);
    const results = {
      nX,
      nY,
      guards,
      obstacles,
      spaces,
      guardX,
      guardY,
      ...results1,
      ...results2,
    };
    return { day: 6, hash: await this.hash(results), results };
  }

  solvePuzzle1(lab: CartesianMatrix<Location>, startXY: XY) {
    const guard = new Guard(startXY);
    let exitAt: XY = [-1, -1];
    // console.debug("Guard starting at ", startXY);
    for (const move of guard.iterMoves(lab, startXY, Direction.N)) {
      // console.debug(move);
      if (move.kind === MoveType.leave) {
        // console.debug("exiting map", move, guard);
        exitAt = move.xy;
      }
    }
    const [exitX, exitY] = exitAt;
    let visited = 0;
    lab.mapCells((cell) => cell.visited ? visited++ : 0);
    return { visited, exitX, exitY };
  }

  addedObstacleCausesLoop(lab: Lab, startXY: XY, obstacle: XY): boolean {
    // TODO: should clone lab
    if (xyEqual(startXY, obstacle)) return false; //can't place ON start
    const newObstacle = lab.getXY(obstacle);
    if (newObstacle.obstacle) return false; // already got an obstacle there
    try {
      newObstacle.obstacle = true;
      const guard = new Guard(startXY);
      for (const move of guard.iterMoves(lab, startXY, Direction.N)) {
        if (move.kind === MoveType.looping) {
          // console.debug("looping", { obstacle, move });
          newObstacle.obstacle = false;
          return true;
        }
        if (move.kind === MoveType.leave) {
          newObstacle.obstacle = false;
          return false;
        }
      }
      assert(false, "should never get here");
    } finally {
      newObstacle.obstacle = false; // does this work?
    }
  }

  solvePuzzle2(lab: Lab, startXY: XY) {
    let runNumber = 0;
    let loopOpportunities = 0;
    const [nX, nY] = lab.sizeXY();
    for (let x = 0; x < nX; x++) {
      for (let y = 0; y < nY; y++) {
        const hadObstacle = lab.getXY([x, y]).obstacle;
        runNumber++;
        if (this.addedObstacleCausesLoop(lab, startXY, [x, y])) {
          loopOpportunities++;
          // console.debug({ runNumber, loopOpportunities });
        }
        // Quick and dirty fix didn't work
        // It hangs at: looping { obstacle: [ 17, 88 ], move: { kind: 3, xy: [ 33, 69 ], facing: 1 } }
        // { runNumber: 2299, loopOpportunities: 98 }
        // probably a loop our detection method didn't catch
        // clear ephemeral data; better design would have put this in the guard
        lab.mapCells((cell) => {
          cell.visited = false;
          cell.facings = new Set<Direction>();
        });
        assertEquals(
          lab.getXY([x, y]).obstacle,
          hadObstacle,
          "temp obstacle stayed",
        );
      }
    }
    return { loopOpportunities };
  }
}
