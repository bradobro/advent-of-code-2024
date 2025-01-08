import { describe, it } from "jsr:@std/testing/bdd";
import { Day18, parseDropCoords } from "./day_18.ts";
import { expect } from "jsr:@std/expect/expect";
import { formatMatrix } from "./Matrix.ts";

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
    // TODO: prep for finder by making map Dijkstrable
  });
});
