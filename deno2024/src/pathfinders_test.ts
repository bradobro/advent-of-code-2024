import { describe, it } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { dim, fromXR, getXR, Matrix, valid, WH, XR } from "./Matrix.ts";
import { parseMatrix } from "./Matrix.ts";
import { assert } from "@std/assert/assert";
import { Dijkstrable, DijkstrasPathfinder } from "./pathfinders.ts";
import { i2xy, numeratorsAndDenominators, xy2i } from "./FlatMatrix.ts";
import { Directions } from "./Direction.ts";

interface Node {
  open: boolean;
  explored: boolean;
  cost: number;
  froms: Set<number>;
}

function parseMap(src: string): Matrix<Node> {
  const map = parseMatrix((s) => ({
    open: s !== "#",
    explored: false,
    cost: Infinity,
    froms: new Set<number>(),
  }), src);
  assert(valid(map), "lines should be the same length");
  return map;
}

class DijkMap implements Dijkstrable<number> {
  world: Matrix<Node>;
  wh: WH;
  nums: number[];
  divs: number[];
  pqueue: number[] = [];
  finish: number;

  constructor(src: string, readonly finishCoords: XR) {
    this.world = parseMap(src);
    this.wh = dim(this.world);
    [this.nums, this.divs] = numeratorsAndDenominators([this.wh.w, this.wh.h]);
    this.finish = this.xr2i(finishCoords);
  }

  isDone(_: number): boolean {
    return this.pqueue.length < 1;
  }

  i2xr(id: number): XR {
    const [x, r] = i2xy(id, this.divs);
    return { x, r };
  }

  xr2i({ x, r }: XR): number {
    return xy2i([x, r], this.nums);
  }

  getId(id: number): Node {
    return getXR(this.world, this.i2xr(id));
  }

  statNode(id: number): [number, boolean, boolean, froms: Iterable<number>] {
    const xr = this.i2xr(id);
    const { cost, explored, open, froms } = getXR(this.world, xr);
    return [cost, explored, open, froms];
  }

  push(id: number, from: number, cost: number) {
    const node = this.getId(id);
    if (cost < node.cost) {
      node.cost = cost;
      node.froms.clear();
      node.froms.add(from);
    } else if (cost === node.cost) {
      node.froms.add(from);
    }
    if (!this.pqueue.includes(id)) { // check out deno pqueue?
      this.pqueue.push(id);
      this.pqueue.sort((a, b) =>
        getXR(this.world, this.i2xr(a)).cost -
        getXR(this.world, this.i2xr(b)).cost
      );
    }
  }

  // Implements Iterable
  [Symbol.iterator]() {
    return this;
  }

  next(): IteratorResult<number, undefined> {
    const value = this.pqueue.shift();
    if (value !== undefined) return { value };
    return { done: true, value: undefined };
  }

  mark(id: number): void {
    this.getId(id).explored = true;
  }

  cost(n: number) {
    return this.getId(n).cost;
  }

  costFrom(_from: number, _to: number): number {
    // presume corredt
    return 1;
  }

  neighbors(n: number): number[] {
    const result: number[] = [];
    const here = this.i2xr(n);
    for (const d of Directions) {
      const there = fromXR(this.world, here, d);
      if (!there) continue;
      const node = getXR(this.world, there);
      if (node.open && !node.explored) result.push(this.xr2i(there));
    }
    return result;
  }
}

/*
 0  1  2  3  4  5  6
 7  8  9 10 11 12 13
14 15 16 17 18 19 20
21 22 23 24 25 26 27
*/
const src1 = `
.######
.######
.######
.......
`;
const src2 = `
.......
.#####.
.#####.
.......
`;

describe("pathfinder with single path", () => {
  it("parser seems to work", () => {
    const map = parseMap(src1);
    const { w, h } = dim(map);
    expect({ w, h }).toEqual({ w: 7, h: 4 });
  });
  it("exercises the pieces", () => {
    const dm = new DijkMap(src1, { x: 6, r: 3 });
    expect(dm.finish).toEqual(27);
    expect(new Set(dm.neighbors(0))).toEqual(new Set([7]));

    // cell 7 has a neighbor above and below
    expect(new Set(dm.neighbors(7))).toEqual(new Set([0, 14]));
    // ... but if the above neighbor has been explored, don't count it
    dm.mark(0);
    expect(new Set(dm.neighbors(7))).toEqual(new Set([14]));

    // corner neibhors
    expect(new Set(dm.neighbors(21))).toEqual(new Set([14, 22]));

    // pqueue sorts, and empty means done
    expect(dm.isDone(27)).toBeTruthy();
    dm.push(7, 0, 1);
    dm.push(0, 0, 0);
    expect(dm.isDone(27)).toBeFalsy();
    expect(dm.pqueue).toEqual([0, 7]);
    expect(dm.next()).toEqual({ value: 0 }); // should pop the lowest cost item
    // expect(dm.isDone(27)).toBeFalsy();
    // expect(dm.next()).toEqual({ value: 7 }); // should pop the lowest cost item
    // expect(dm.isDone(27)).toBeTruthy();
  });
  it("finds the path", () => {
    const dm = new DijkMap(src1, { x: 6, r: 3 });
    const finder = new DijkstrasPathfinder(dm);
    finder.exploreAll(0);
    const path = finder.reportPath(0, 27);
    expect(path).toEqual([0, 7, 14, 21, 22, 23, 24, 25, 26, 27]);
    const cost = dm.statNode(27)[0];
    expect(cost).toEqual(9);
  });
});

describe("pathfinder with multiple paths", () => {
  it.skip("finds the single path as a list of one paths", () => {
    // works with...
    // const path: NodeId[] = this.reportPath(start, finish); // dummy
    // yield path;
    const world = new DijkMap(src1, { x: 6, r: 3 });
    const finder = new DijkstrasPathfinder(world);
    finder.exploreAll(0);
    const paths = Array.from(finder.iterAllPaths(0, 27, []));
    expect(paths).toEqual([[0, 7, 14, 21, 22, 23, 24, 25, 26, 27]]);
  });
  it.skip("finds the two best paths", () => {
    const world = new DijkMap(src2, { x: 6, r: 3 });
    const finder = new DijkstrasPathfinder(world);
    finder.exploreAll(0);
    const paths = Array.from(finder.iterAllPaths(0, 27, []));
    expect(new Set(paths)).toEqual(
      new Set([
        [0, 7, 14, 21, 22, 23, 24, 25, 26, 27],
        [0, 1, 2, 3, 4, 5, 6, 13, 20, 27],
      ]),
    );
  });
});

describe("single cell has one path", () => {
  const src = ".";
  // function setup():  {
  //   const finder = new DijkstrasPathfinder(world);
  //   return [world, finder];
  // }
  it("sets up the one cell map", () => {
    const world = new DijkMap(src, { x: 0, r: 0 });
    const wh = dim(world.world);
    expect(wh).toEqual({ w: 1, h: 1 });
    expect(world.finish).toEqual(0);
    expect(world.divs).toEqual([1, 1]);
    expect(world.nums).toEqual([1, 1]);
    expect(world.neighbors(0)).toEqual([]);
  });
  it("handles a single cell", () => {
    const world = new DijkMap(src, { x: 0, r: 0 });
    const finder = new DijkstrasPathfinder(world);

    // Initiate the search
    world.push(0, 0, 0);
    const iter = finder.iterExplore();

    // Manually iterate the path discovery
    let { value, done } = iter.next();
    expect(value).toEqual(0);
    expect(done).toBeFalsy();
    ({ value, done } = iter.next());
    expect(value).toEqual(undefined);
    expect(done).toBeTruthy();
    const node = world.world[0][0];
    expect(node.cost).toEqual(0);
    expect(node.froms.size).toEqual(1);

    // Check the paths report
    // console.debug(finder.reportAllPaths(0, 0));
    const expected = [[0]];
    expect(new Set(finder.reportAllPaths(0, 0))).toEqual(new Set(expected));
  });
});

describe("4-cell with 2 paths", () => {
  const src = `
  ..
  ..
  `;

  it("two cell", () => {
    const world = new DijkMap(src, { x: 0, r: 0 });
    expect(dim(world.world)).toEqual({ w: 2, h: 2 });
    const finder = new DijkstrasPathfinder(world);
    finder.exploreAll(0);
    expect(new Set(finder.reportAllPaths(0, 3))).toEqual(
      new Set([[0, 1, 3], [0, 2, 3]]),
    );
  });
});

describe("more multipaths", () => {
  function _allPathsOf(src: string, finish: XR): Set<number[]> {
    const dm = new DijkMap(src, finish);
    const pf = new DijkstrasPathfinder(dm);
    pf.exploreAll(0);
    const paths = pf.reportAllPaths(0, dm.xr2i(finish));
    // console.debug("path lengths", paths.map((p) => p.length));
    return new Set(paths);
  }

  it("works with 2x3", () => {
    const paths = _allPathsOf(
      `
  ...
  ...
  `,
      { x: 2, r: 1 },
    );
    expect(paths).toEqual(
      new Set([
        [0, 1, 2, 5],
        [0, 3, 4, 5],
        [0, 1, 4, 5],
      ]),
    );
  });

  it("works with a bunch of examples", () => {
    // deno-fmt-ignore
    const examples: [string, XR, number[][]][] = [
      [`
.###
....
.##.
....`, { x: 3, r: 3 }, [
          [0, 4, 5, 6, 7, 11, 15],
          [0, 4, 8, 12, 13, 14, 15],
        ],
      ],
      // BUG: the finder can't seem to find the E-first path
      [ `
S..#..#...
.#......#.
.#####.#..
.......#.#
####.#.#..
.....#..#.
##.######.
.....###..
.#####F..#
.......### `, { x: 6, r: 8 },
        [
          // deno-lint no format
            [
               0,  1,  2, 12, 13, 14, 15, 16,
              17,  7,  8,  9, 19, 29, 28, 38,
              48, 49, 59, 69, 79, 78, 88, 87,
              86
            ],
            [
               0, 10, 20, 30, 31, 32, 33, 34,
              44, 54, 53, 52, 62, 72, 71, 70,
              80, 90, 91, 92, 93, 94, 95, 96,
              86
            ]
        ],
      ],
    ];
    for (const [src, finish, paths] of examples) {
      expect(_allPathsOf(src, finish)).toEqual(new Set(paths));
    }
  });
});
