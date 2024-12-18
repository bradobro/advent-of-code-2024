import { describe, it } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { XY } from "./cartesianMatrix.ts";
import { LavaMap } from "./day_10.ts";

const example5 = `
89010123
78121874
87430965
96549874
45678903
32019012
01329801
10456732

`;

describe("loading the topo map of the lava factory", () => {
  it("loads the raw string ", () => {
    // const _mat = Matrix.parse(example5);
    // mat.print((s) => s);
    const _map = LavaMap.parse(example5);
    expect(_map.grid.sizeXY()).toEqual([8, 8]);
    // _map.grid.print((c: Location) => c.el.toString());
    // checking itercells
    // const output: string[] = [];
    // let prevY = 0;
    // for (const [c, [x, y]] of map.iterCellsC()) {
    //   if (y !== prevY) {
    //     prevY = y;
    //     output.push("\n");
    //   }
    //   output.push(`${c}[${x + y}]`);
    // }
    // console.log(output.join(""));
  });
  it("calculates trailheads", () => {
    const map = LavaMap.parse(example5);
    expect(map.trailheads).toEqual(
      new Set<XY>([
        [1, 0],
        [0, 1],
        [6, 1],
        [2, 2],
        [5, 2],
        [6, 3],
        [4, 5],
        [2, 7],
        [4, 7],
      ]),
    );
  });
  it("calculates summits", () => {
    const map = LavaMap.parse(example5);
    expect(map.summits).toEqual(
      new Set<XY>([
        [4, 1],
        [4, 2],
        [5, 3],
        [0, 4],
        [4, 4],
        [5, 5],
        [1, 7],
      ]),
    );
  });
  it("calculates nexts options", () => {
    const map = LavaMap.parse(example5);
    const nxts = (xy: XY) => map.grid.getXY(xy).nexts;
    expect(nxts([0, 0])).toEqual([]);
    expect(nxts([1, 0])).toEqual([[1, 1], [0, 0]]);
    expect(nxts([5, 4])).toEqual([[5, 5], [5, 3], [4, 4]]);
    const nextCounts = Array.from(map.grid.iterCellsC()).map(([c, _]) =>
      c.nexts.length
    );
    expect(nextCounts.slice(56, 64)).toEqual([1, 0, 2, 1, 3, 1, 1, 1]); // y = 7
    expect(nextCounts.slice(48, 56)).toEqual([3, 1, 1, 1, 1, 1, 1, 1]); // y = 6
    expect(nextCounts.slice(40, 48)).toEqual([1, 2, 1, 2, 1, 0, 2, 1]); // y = 5
    expect(nextCounts.slice(32, 40)).toEqual([0, 1, 2, 1, 0, 3, 1, 1]); // y = 4
    expect(nextCounts.slice(24, 32)).toEqual([1, 2, 1, 1, 3, 0, 1, 1]); // y = 3
    expect(nextCounts.slice(16, 24)).toEqual([1, 1, 1, 1, 0, 1, 1, 1]); // y = 2
    expect(nextCounts.slice(8, 16)).toEqual([2, 1, 1, 1, 0, 1, 2, 2]); // y = 1
    expect(nextCounts.slice(0, 8)).toEqual([0, 2, 1, 1, 1, 1, 0, 1]); // y = 0
  });
});
