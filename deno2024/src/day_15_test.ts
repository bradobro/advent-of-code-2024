import { describe, it } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { findRobot, parseWarehouse } from "./day_15_model.ts";
import { Direction } from "./cartesianMatrix.ts";
import { formatMatrix } from "./Matrix.ts";

const src1 = `

########
#..O.O.#
##@.O..#
#...O..#
#.#.O..#
#...O..#
#......#
########

<^^>>>vv<v>>v<<

`;

describe("day 15", () => {
  const { wh, inst } = parseWarehouse(src1);
  expect(wh.length).toEqual(8);
  expect(wh[0].length).toEqual(8);
  expect(inst).toEqual([
    Direction.W,
    Direction.N,
    Direction.N,
    Direction.E,
    Direction.E,
    Direction.E,
    Direction.S,
    Direction.S,
    Direction.W,
    Direction.S,
    Direction.E,
    Direction.E,
    Direction.S,
    Direction.W,
    Direction.W,
  ]);
  // console.debug(formatMatrix((c) => c, wh));
  expect(findRobot(wh)).toEqual({ x: 2, r: 2 });
});
