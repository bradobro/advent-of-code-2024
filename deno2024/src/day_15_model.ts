/* Puzzle 15

*/

import { assert } from "@std/assert/assert";
import { Direction } from "./Direction.ts";
import { atXR, dim, iterCells, Matrix, rows, XR } from "./Matrix.ts";
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

export function moveBot(wh: Warehouse, bot: XR, dir: Direction): XR {
  // if (!) return loc;
  const wh2 = push(wh, bot, dir);
  if (!wh2) return bot;
  const loc2 = atXR(wh, bot, dir);
  if (loc2) return loc2;
  assert(false, `should not be able to successfully push off board`);
}

export interface BotInWarehouse {
  wh: Warehouse;
  bot: XR;
}
export function moveBot2(
  { wh, bot }: BotInWarehouse,
  move: Direction,
): BotInWarehouse {
  const wh2 = push(wh, bot, move);
  if (!wh2) return { wh, bot }; // couldn't move, no change

  // success
  const bot2 = atXR(wh, bot, move);
  assertExists(bot2); // perimeter should keep us on the board
  return { wh: wh2, bot: bot2 };
}

export function push(wh: Warehouse, loc: XR, dir: Direction): Warehouse | null {
  const entity = wh[loc.r][loc.x];
  if (entity === BLANK) return wh;
  if (entity === BARRIER) return null;

  // single box or boxl boxr horizontal
  const neighbor = atXR(wh, loc, dir);
  assertExists(neighbor); // perimeter fence should guarantee
  if (neighbor && push(wh, neighbor, dir)) {
    wh[neighbor.r][neighbor.x] = wh[loc.r][loc.x];
    wh[loc.r][loc.x] = BLANK;
    return wh;
  }
  return null;
}

export function tally(wh: Warehouse): number {
  return iterCells(wh).reduce(
    (acc, { x, r, value }) => value === BOX ? r * 100 + x + acc : acc,
    0,
  );
}
