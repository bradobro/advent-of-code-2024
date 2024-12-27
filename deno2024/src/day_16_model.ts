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
import { Direction, Directions } from "./Direction.ts";
import { PuzzleModel12 } from "../mod.ts";
import { puzzleData } from "./Puzzle.ts";
import { findStrideAndStart } from "./day_13_model.ts";
import { LimitedTransformStream } from "@std/streams/limited-transform-stream";
import { left } from "./Direction.ts";
import { right } from "./Direction.ts";
import { aStar } from "./astarJSuder.ts";
import { assertEquals } from "@std/assert/equals";

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
  const solver = new solver16a(w);
  const path = solver.findPath();
  if (path) {
    console.debug("found path", path);
    return solver.cost(path);
  } else {
    console.debug("no path found");
    return Infinity;
  }
}

export class solver16a {
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
