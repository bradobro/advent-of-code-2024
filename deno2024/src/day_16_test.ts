import { describe, it } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { leastCost16a, load16a, parse16a } from "./day_16_model.ts";
import { dim, getXR } from "./Matrix.ts";

const src1 = `
###############
#.......#....E#
#.#.###.#.###.#
#.....#.#...#.#
#.###.#####.#.#
#.#.#.......#.#
#.#.#####.###.#
#...........#.#
###.#.#####.#.#
#...#.....#.#.#
#.#.#.###.#.#.#
#.....#...#.#.#
#.###.#.#.#.#.#
#S..#.....#...#
###############
`;

describe("day16a", () => {
  it("parses example 1", () => {
    const w = parse16a(src1);
    expect(w.start).toEqual({ x: 1, r: 13 });
    expect(w.finish).toEqual({ x: 13, r: 1 });
    expect(getXR(w.grid, { x: 0, r: 13 }).passable).toBeFalsy();
    expect(getXR(w.grid, { x: 1, r: 13 }).passable).toBeTruthy();
    expect(getXR(w.grid, { x: 2, r: 13 }).passable).toBeTruthy();
    expect(getXR(w.grid, { x: 3, r: 13 }).passable).toBeTruthy();
    expect(getXR(w.grid, { x: 4, r: 13 }).passable).toBeFalsy();
    expect(getXR(w.grid, { x: 13, r: 13 }).passable).toBeTruthy();
    expect(getXR(w.grid, { x: 14, r: 13 }).passable).toEqual(false); // not undefined
  });
  it.skip("solves example 1", () => {
    const w = parse16a(src1);
    const cheapest = leastCost16a(w);
    expect(cheapest).toEqual(7036);
  });
  it("reads the first puzzle's data", () => {
    const w = load16a();
    expect(dim(w.grid)).toEqual({ w: 141, h: 141 });
    expect(w.start).toEqual({ x: 1, r: 139 });
    expect(w.finish).toEqual({ x: 139, r: 1 });
  });
});
