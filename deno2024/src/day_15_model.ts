/* Puzzle 15

*/

import { assert } from "@std/assert/assert";
import { Direction } from "./Direction.ts";
import { atXR, dim, iterCells, Matrix, rows, XR } from "./Matrix.ts";

const BLANK = ".";
const BARRIER = "#";
const BOX = "O";
const BOXL = "[";
const BOXR = "]";
const BOT = "@";

export type Occupant =
  | typeof BLANK
  | typeof BARRIER
  | typeof BOX
  | typeof BOXL
  | typeof BOXR
  | typeof BOT;

export type Warehouse = Matrix<Occupant>;

export type Instructions = Direction[];

export function parseWarehouse(
  src: string,
): { wh: Warehouse; inst: Instructions } {
  // const wh: Warehouse = [];
  const [rawwh, rawinst] = src.trim().split("\n\n");
  const wh: Warehouse = rawwh.trim().split("\n").map((row) =>
    row.split("").map((c) => c as Occupant)
  );
  const inst: Instructions = rawinst.trim().split("\n").join("").split("").map(
    (c) => {
      switch (c) {
        case "^":
          return Direction.N;
        case ">":
          return Direction.E;
        case "v":
          return Direction.S;
        case "<":
          return Direction.W;
        default:
          assert(false, `unrecognized direction "${c}"`);
      }
    },
  );

  return { wh, inst };
}

export function doublesize(wh: Warehouse): Warehouse {
  const result: Warehouse = [];
  const trans: Record<string, [Occupant, Occupant]> = {
    BLANK: [BLANK, BLANK],
    BARRIER: [BARRIER, BARRIER],
    BOX: [BOXL, BOXR],
    BOT: [BOT, BLANK],
  };
  // return Array.from(rows(wh).map((r) => r.flatMap((c) => trans[c])));
  for (const r of rows(wh)) {
    const r2: Occupant[] = r.flatMap((c) => {
      if (c === BLANK) return [BLANK, BLANK];
      if (c === BOT) return [BOT, BLANK];
      if (c === BARRIER) return [BARRIER, BARRIER];
      return [BOXL, BOXR];
    });
    result.push(r2);
  }
  return result;
}

export function findRobot(wh: Warehouse): XR {
  const { h, w } = dim(wh);
  for (let r = 0; r < h; r++) {
    for (let x = 0; x < w; x++) {
      if (wh[r][x] === BOT) return { x, r };
    }
  }
  assert(false, `no bot found`);
}

export function moveBot(wh: Warehouse, loc: XR, dir: Direction): XR {
  if (!push(wh, loc, dir)) return loc;
  const loc2 = atXR(wh, loc, dir);
  if (loc2) return loc2;
  assert(false, `should not be able to successfully push off board`);
}

export function push(wh: Warehouse, loc: XR, dir: Direction): boolean {
  const entity = wh[loc.r][loc.x];
  if (entity === BLANK) return true;
  if (entity === BARRIER) return false;
  // BOXL
  if ([Direction.N, Direction.S].includes(dir)) {
    // if BOXL, push its BOXR as well
    // if BOXR, push its BOXL as well
  }

  // single box or boxl boxr horizontal
  const neighbor = atXR(wh, loc, dir);
  if (neighbor && push(wh, neighbor, dir)) {
    wh[neighbor.r][neighbor.x] = wh[loc.r][loc.x];
    wh[loc.r][loc.x] = BLANK;
    return true;
  }
  return false;
}

export function tally(wh: Warehouse): number {
  return iterCells(wh).reduce(
    (acc, { x, r, value }) => value === BOX ? r * 100 + x + acc : acc,
    0,
  );
}
