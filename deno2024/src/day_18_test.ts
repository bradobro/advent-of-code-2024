import { describe, it } from "jsr:@std/testing/bdd";
import { Day18, parseDropCoords } from "./day_18.ts";
import { expect } from "jsr:@std/expect/expect";
import { formatMatrix } from "./Matrix.ts";
import { DijkstrasPathfinder } from "./pathfinders.ts";

const src1 = `
5,4
4,2
4,5
3,0
2,1
6,3
2,4
1,5
0,6
3,3
2,6
5,1
1,2
5,5
2,5
6,5
1,4
0,4
6,4
1,1
6,1
1,0
0,5
1,6
2,0
`;

const resultMap1 = `
...#...
..#..#.
....#..
...#..#
..#..#.
.#..#..
#.#....
`;

describe("first example", () => {
  it("can parse the drops", () => {
    const drops = parseDropCoords(src1);
    expect(drops[0]).toEqual({ x: 5, r: 4 });
    expect(drops.length).toEqual(25);
  });
  it("can generate the map", () => {
    const map = new Day18(src1, { w: 7, h: 7 }, { x: 0, r: 0 }, { x: 6, r: 6 });
    expect([map.start, map.finish]).toEqual([0, 48]);
    // console.debug(map.grid);
    map.dropN(12);
    const resultMap = formatMatrix(
      (c) => (c.tClobbered < 0 ? "." : "#"),
      map.grid,
    );
    expect(resultMap).toEqual(resultMap1.trim());
  });
  it("can find the path", () => {
    const map = new Day18(src1, { w: 7, h: 7 }, { x: 0, r: 0 }, { x: 6, r: 6 });
    map.dropN(12);
    const pf = new DijkstrasPathfinder(map);
    pf.exploreAll(0);
    expect(map.endCost()).toEqual(22);
    // deno-fmt-ignore
    expect(new Set(pf.reportAllPaths(map.start, map.finish))).toEqual(new Set([
      [ 0, 1,  8, 15, 16, 17, 10, 11, 4, 5, 6, 13, 20, 19, 26, 25, 32, 31, 38, 45, 46, 47, 48 ],
      [ 0, 7,  8, 15, 16, 17, 10, 11, 4, 5, 6, 13, 20, 19, 26, 25, 32, 31, 38, 45, 46, 47, 48 ],
      [ 0, 7, 14, 15, 16, 17, 10, 11, 4, 5, 6, 13, 20, 19, 26, 25, 32, 31, 38, 45, 46, 47, 48 ],
    ]));
    // 0  012#456
    // 7  ..#..#.
    // 14 ....#..
    // 21 ...#..#
    // 28 ..#..#.
    // 35 .#..#..
    // 42 #.#....
  });
  it("detects when there is no path", () => {
    const map = new Day18(src1, { w: 7, h: 7 }, { x: 0, r: 0 }, { x: 6, r: 6 });
    const pf = new DijkstrasPathfinder(map);
    // map.dropN(20);  // still okay
    map.dropN(21); // path blocked
    pf.exploreAll(0);
    expect(map.endCost()).toBeGreaterThan(100000000000000);
    console.debug(pf.reportAllPaths(map.start, map.finish));
    console.debug(pf.reportPath(map.start, map.finish));
  });
});
