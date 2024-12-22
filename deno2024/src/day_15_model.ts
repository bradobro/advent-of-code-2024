/* Puzzle 15

*/

import { assert } from "@std/assert/assert";
import { Direction } from "./cartesianMatrix.ts";
import { dim, Matrix, XR } from "./Matrix.ts";

const BLANK = ".";
const BARRIER = "#";
const BOX = "O";
const BOT = "@";

export type Occupant = typeof BLANK | typeof BARRIER | typeof BOX | typeof BOT;

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

export function findRobot(wh: Warehouse): XR {
  const { h, w } = dim(wh);
  for (let r = 0; r < h; r++) {
    for (let x = 0; x < w; x++) {
      if (wh[r][x] === BOT) return { x, r };
    }
  }
  assert(false, `no bot found`);
}
