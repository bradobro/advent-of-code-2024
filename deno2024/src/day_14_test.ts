import { describe, it } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import {
  formatMatrix,
  iterGrids,
  move,
  moveAll,
  Mover,
  parseMovers,
  parseTerrain,
  quadrantCounts,
  XR,
} from "./day_14_model.ts";

const src1 = `
p=0,4 v=3,-3
p=6,3 v=-1,-3
p=10,3 v=-1,2
p=2,0 v=2,-1
p=0,0 v=1,3
p=3,0 v=-2,-2
p=7,6 v=-1,-3
p=3,0 v=-1,-2
p=9,3 v=2,3
p=7,3 v=-1,2
p=2,4 v=2,-3
p=9,5 v=-3,-3
`;

describe("day14", () => {
  it("parses bunnies", () => {
    const bnys = parseMovers(src1);
    expect(bnys[0]).toEqual({ loc: { x: 0, r: 4 }, dx: 3, dr: -3 });
    expect(bnys[11]).toEqual({ loc: { x: 9, r: 5 }, dx: -3, dr: -3 });
  });
  it("moves a bunny", () => {
    const area: XR = { x: 11, r: 7 };
    const bunny: Mover = { loc: { x: 2, r: 4 }, dx: 2, dr: -3 };
    expect(move(0, area, bunny)).toEqual(bunny.loc);
    expect(move(1, area, bunny)).toEqual({ x: 4, r: 1 });
    expect(move(2, area, bunny)).toEqual({ x: 6, r: 5 });
    expect(move(3, area, bunny)).toEqual({ x: 8, r: 2 });
    expect(move(4, area, bunny)).toEqual({ x: 10, r: 6 });
    expect(move(5, area, bunny)).toEqual({ x: 1, r: 3 });
    // expect(move(6, area, bunny)).toEqual({ x: 4, r: 1 });
  });
  it("moves many bunnies", () => {
    const bhq0 = parseTerrain(11, 7, src1);
    // IWB to print the map, but let's go fast first
    const bhq100 = moveAll(100, bhq0);
    console.debug(bhq100);
    console.debug(quadrantCounts(bhq100.size, bhq100.movers));
  });
  it("shows successive maps", () => {
    for (const bhq of iterGrids(parseTerrain(11, 7, src1))) {
      if (bhq.generation >= 5) break;
      console.debug(`========== GENERATION ${bhq.generation} ==========`);
      console.debug(formatMatrix(bhq.grid), "\n\n");
    }
  });
});
