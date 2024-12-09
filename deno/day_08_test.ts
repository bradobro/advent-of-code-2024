import { describe, it } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { assertThrows } from "@std/assert/throws";
import { antinodes } from "./day_08.ts";
import { XY } from "./matrix.ts";

describe("antinodes of", () => {
  const a: XY = [1, 1]; // slash
  const b: XY = [3, 3]; // norm
  const c: XY = [5, 1]; // backslash
  const d: XY = [3, 5]; // vertical
  const e: XY = [5, 3]; // horizontal
  const f: XY = [10, 4];
  const g: XY = [10, 1];

  it("does the math right", () => {
    // LL to UR
    expect(antinodes(a, b)).toEqual([[-1, -1], [5, 5]]);
    expect(antinodes(b, a)).toEqual([[5, 5], [-1, -1]]);
    // LR to UL
    expect(antinodes(b, c)).toEqual([[1, 5], [7, -1]]);
    expect(antinodes(c, b)).toEqual([[7, -1], [1, 5]]);
    // vertical
    expect(antinodes(b, d)).toEqual([[3, 1], [3, 7]]);
    expect(antinodes(d, b)).toEqual([[3, 7], [3, 1]]);
    // horizontal
    expect(antinodes(b, e)).toEqual([[1, 3], [7, 3]]);
    expect(antinodes(e, b)).toEqual([[7, 3], [1, 3]]);
    // different slopes
    expect(antinodes(b, f)).toEqual([[-4, 2], [17, 5]]);
    expect(antinodes(f, b)).toEqual([[17, 5], [-4, 2]]);
    expect(antinodes(b, g)).toEqual([[-4, 5], [17, -1]]);
    expect(antinodes(g, b)).toEqual([[17, -1], [-4, 5]]);
  });
});
