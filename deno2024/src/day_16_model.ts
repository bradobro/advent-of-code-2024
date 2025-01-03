import { assert } from "@std/assert/assert";
import {
  dim,
  fromXR,
  getXR,
  makeMatrix,
  parseMatrix,
  transformMatrix,
} from "./Matrix.ts";
import { iterCells } from "./Matrix.ts";
import { CellParser } from "./Matrix.ts";
import { XR } from "./Matrix.ts";
import { Matrix } from "./Matrix.ts";
import { okXR } from "./Matrix.ts";
import { aft, Direction, Directions } from "./Direction.ts";
import { PuzzleModel12 } from "../mod.ts";
import { puzzleData } from "./Puzzle.ts";
import { findStrideAndStart } from "./day_13_model.ts";
import { LimitedTransformStream } from "@std/streams/limited-transform-stream";
import { left } from "./Direction.ts";
import { right } from "./Direction.ts";
import { aStar } from "./astarJSuder.ts";
import { assertEquals } from "@std/assert/equals";
import { getFromXR } from "./Matrix.ts";

export const COST16_MOVE = 1;
export const COST16_TURN = 1000;

// location on the map
export interface Loc16 {
  passable: boolean; // false if wall;
  start: boolean;
  finish: boolean;
}

// the world of the map
export interface World16 {
  grid: Matrix<Loc16>;
  start: XR;
  finish: XR;
}

// one step in finding a path on the map
export interface Node16 {
  l: XR;
  d: Direction; // heading
}

export function parse16a(src: string): World16 {
  let start: XR = { x: -1, r: -1 };
  let finish: XR = { x: -1, r: -1 };
  const grid: Matrix<Loc16> = parseMatrix(
    (s: string) => ({
      passable: s !== "#",
      start: s === "S",
      finish: s === "E",
    }),
    src,
  );
  for (const { x, r, value } of iterCells(grid)) {
    if (value.start) start = { x, r };
    if (value.finish) finish = { x, r };
  }
  assert(okXR(grid, start), "start should be on the grid");
  assert(okXR(grid, finish), "finish should be on the grid");
  return { start, finish, grid };
}

export function load16a(): World16 {
  const src = puzzleData(16);
  return parse16a(src);
}

// could memoize
function estimateTaxi(w: World16, from: XR): number {
  const costx = Math.abs(w.finish.x - from.x);
  const costy = Math.abs(w.finish.r - from.r);
  // could add turn cost if both aren't 0
  return costx + costy;
}

export function leastCost16a(w: World16): number {
  // const solver = new solver16a(w);
  // const path = solver.findPath();
  // if (path) {
  //   console.debug("found path", path);
  //   return solver.cost(path);
  // } else {
  //   console.debug("no path found");
  return Infinity;
  // }
}

// This A* looked right, but hangs
export class solver16aHangs {
  readonly estimates: number[][];
  neighbors: Matrix<null | Node16[]>;

  constructor(readonly w: World16) {
    this.estimates = transformMatrix(
      (_: Loc16, xr: XR) => estimateTaxi(w, xr),
      w.grid,
    );
    this.neighbors = makeMatrix(dim(w.grid), null);
  }

  estimateFromNodeToGoal(n: Node16): number {
    return getXR(this.estimates, n.l);
  }

  neighborsAdjacentToNode(n: Node16): Node16[] {
    // return cached result if available
    // const cachedResult = getXR(this.neighbors, n.l);
    // if (cachedResult) return cachedResult;

    const result: Node16[] = [];
    const g = this.w.grid;

    // NOTE: we don't look behind us because that costs 2 turns!
    for (const d of [left(n.d), n.d, right(n.d)]) {
      const l = fromXR(g, n.l, d);
      if (!l) continue;
      const n2 = getXR(g, l);
      if (n2.passable) {
        if (d === n.d) result.push({ ...n, l }); // same direction, can move
        else result.push({ ...n, d }); // different direction, must turn
      }
    }

    return result;
  }

  actualCostToMove(
    /** A map from a node to the node before it in the path. This can be used to provide cost based on the shape of paths. */
    _: Map<Node16, Node16>,
    /** We are moving from this node. */
    from: Node16,
    /** To this node. */
    to: Node16,
  ): number {
    // ASSUMPTION: we're only moving one space
    const { finish } = this.w;
    // Rotating on the finish square is free
    if (from.l === finish && to.l === finish) return 0;
    // moving ahead is cheap
    if (from.d === to.d) return COST16_MOVE;
    // otherwise we pay the turn cost
    return COST16_TURN;
  }

  findPath() {
    const start = { l: this.w.start, d: Direction.E };
    const goal = { l: this.w.finish, d: Direction.E }; // final direction doesn't matter, just location
    return aStar({
      start,
      goal,
      estimateFromNodeToGoal: this.estimateFromNodeToGoal.bind(this),
      neighborsAdjacentToNode: this.neighborsAdjacentToNode.bind(this),
      actualCostToMove: this.actualCostToMove.bind(this),
    });
  }

  cost(path: Node16[]): number {
    let result = 0;
    let d = path[0].d;
    for (const n of path) {
      if (n.l === this.w.finish) break;
      if (n.d === d) {
        //  assert "distance should be exactly 1"
        result += COST16_MOVE;
      } else {
        // assert loc should be the same
        result += COST16_TURN;
        d = n.d;
      }
    }
    return result;
  }
}

type Distance = number;

// following along with Stuxf's Dijkstra solution to part 1
export class solver16aStuxf {
  readonly w: number;
  readonly h: number;

  constructor(readonly world: World16) {
    const { w, h } = dim(world.grid);
    [this.w, this.h] = [w, h];
  }

  hash(loc: XR, dir: Direction) {
    return `${loc.x},${loc.r},${dir}`;
  }

  // following stuxf, thanks for sharing the example
  dijkstra(
    startDirection: Direction,
  ): Map<string, number> {
    const costs = new Map<string, Distance>();
    // position queue
    const pq: [Distance, XR, Direction][] = [[
      0,
      this.world.start,
      startDirection,
    ]];
    costs.set(this.hash(this.world.start, startDirection), 0);

    // dijkstra loop
    while (pq.length > 0) {
      pq.sort((a, b) => a[0] - b[0]);
      const [cost1, loc1, dir1] = pq.shift()!;
      // if we haven't found a shorter cost, don't bother
      if (cost1 > (costs.get(this.hash(loc1, dir1)) ?? Infinity)) continue;
      // if we can move ahead, mark it
      const loc2 = fromXR(this.world.grid, loc1, dir1);
      if (loc2 && getXR(this.world.grid, loc2).passable) {
        const cost2 = cost1 + COST16_MOVE;
        const key = this.hash(loc2, dir1);
        if (cost2 < (costs.get(key) ?? Infinity)) {
          costs.set(key, cost2);
          pq.push([cost2, loc2, dir1]);
        }
      }

      // if we can turn, mark it
      const cost3 = cost1 + COST16_TURN;
      for (const dir3 of [left(dir1), right(dir1)]) {
        const key = this.hash(loc1, dir3);
        if (cost3 < (costs.get(key) ?? Infinity)) {
          costs.set(key, cost3);
          pq.push([cost3, loc1, dir3]);
        }
      }
    }

    return costs;
  }

  solveA() {
    const costs = this.dijkstra(Direction.E);
    const minFinishA = Math.min(...Directions.map(
      (dir) => (costs.get(this.hash(this.world.finish, dir)) ?? Infinity),
    ));
    // console.log({ minFinishA });
    return minFinishA;
  }

  solveB() {
    const costs = this.dijkstra(Direction.E);
    const minCost = Math.min(...Directions.map(
      (dir) => (costs.get(this.hash(this.world.finish, dir)) ?? Infinity),
    ));

    const path_positions = new Set<string>();
    const stack: [XR, Direction, Distance][] = [];
    const hash = (l: XR) => `${l.x},${l.r}`;

    for (const dir of Directions) {
      const cost = costs.get(this.hash(this.world.finish, dir)) ?? Infinity;

      if (cost === minCost) {
        stack.push([this.world.finish, dir, minCost]);
      }
    }

    while (stack.length) {
      const [loc1, dir1, cost] = stack.pop()!;
      path_positions.add(hash(loc1));

      const loc0 = fromXR(this.world.grid, loc1, aft(dir1));
      if (loc0) {
        const cost0 = costs.get(this.hash(loc0, dir1));
        if (cost0 && cost0 + COST16_MOVE === cost) {
          stack.push([loc0, dir1, cost0]);
        }
      }

      for (const dir3 of [left(dir1), right(dir1)]) {
        const key = this.hash(loc1, dir3);
        const cost3 = costs.get(key);
        if (cost3 && cost3 + COST16_TURN === cost) {
          stack.push([loc1, dir3, cost3]);
        }
      }
    }

    return path_positions.size;
  }
}
