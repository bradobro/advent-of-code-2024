/* Puzzle 15

*/

import { assert } from "@std/assert/assert";
import { Direction } from "./Direction.ts";
import {
  atXR,
  cloneMatrix,
  dim,
  formatMatrix,
  iterCells,
  Matrix,
  okXR,
  rows,
  XR,
} from "./Matrix.ts";
import { assertExists } from "@std/assert/exists";

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

export function formatWarehouse(wh: Warehouse): string {
  return formatMatrix((c) => c, wh);
}

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

export function parseWideWarehouse(
  src: string,
): { wh: Warehouse; inst: Instructions } {
  const { wh, inst } = parseWarehouse(src);
  return { wh: doublesize(wh), inst };
}

export function doublesize(wh: Warehouse): Warehouse {
  const result: Warehouse = [];

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

export function moveBot1(wh: Warehouse, bot: XR, dir: Direction): XR {
  // if (!) return loc;
  const wh2 = push1(wh, bot, dir);
  if (!wh2) return bot;
  const loc2 = atXR(wh, bot, dir);
  if (loc2) return loc2;
  assert(false, `should not be able to successfully push off board`);
}

export function push1(
  wh: Warehouse,
  loc: XR,
  dir: Direction,
): Warehouse | null {
  const entity = wh[loc.r][loc.x];
  if (entity === BLANK) return wh;
  if (entity === BARRIER) return null;

  // single box or boxl boxr horizontal
  const neighbor = atXR(wh, loc, dir);
  assertExists(neighbor); // perimeter fence should guarantee
  if (neighbor && push1(wh, neighbor, dir)) {
    wh[neighbor.r][neighbor.x] = wh[loc.r][loc.x];
    wh[loc.r][loc.x] = BLANK;
    return wh;
  }
  return null;
}

export interface BotInWarehouse {
  wh: Warehouse;
  bot: XR;
}
export function moveBot2(
  { wh, bot }: BotInWarehouse,
  move: Direction,
): BotInWarehouse {
  const wh2 = push2(wh, bot, move);
  if (!wh2) return { wh, bot }; // couldn't move, no change

  // success
  const bot2 = atXR(wh2, bot, move);
  assertExists(bot2); // perimeter should keep us on the board
  return { wh: wh2, bot: bot2 };
}

export function push2(
  wh: Warehouse,
  loc: XR,
  dir: Direction,
  wide = true,
): Warehouse | null {
  const entity = wh[loc.r][loc.x];
  if (entity === BLANK) return cloneMatrix(wh);
  if (entity === BARRIER) return null;

  // single box or boxl boxr horizontal
  const neighbor = atXR(wh, loc, dir);
  assertExists(neighbor); // perimeter fence should guarantee

  let wh2 = wh;
  // if pushing part of a wide box vertically and widely (we haven't already done it's counterpart)
  if ([BOXL, BOXR].includes(entity) && (dir % 2 === 0) && wide) {
    // try to push it's counterpart
    const counterpartLoc = entity === BOXL
      ? { x: loc.x + 1, r: loc.r }
      : { x: loc.x - 1, r: loc.r };
    assert(
      okXR(wh, counterpartLoc),
      `unless map in put wrong, we should find the counterpart within bounds`,
    );

    // push NARROWLY so we don't create a loop (each side trying to push the other)
    const whCounterpart = push2(wh, counterpartLoc, dir, false);
    if (!whCounterpart) return null; // couldn't push the counterpart, so don't continue
    wh2 = whCounterpart; // wharehouse AFTER moving the counterpart
  }

  const wh3 = push2(wh2, neighbor, dir); // SHOULD be a clone if there were any successful pushes
  if (wh3) {
    wh3[neighbor.r][neighbor.x] = wh3[loc.r][loc.x];
    wh3[loc.r][loc.x] = BLANK;
    return wh3;
  }
  return null;
}

export function tally(wh: Warehouse): number {
  return iterCells(wh).reduce(
    (acc, { x, r, value }) =>
      [BOX, BOXL].includes(value) ? r * 100 + x + acc : acc,
    0,
  );
}
