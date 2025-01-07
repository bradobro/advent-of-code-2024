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
    from: -1,
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

  // from(destination: number): number | null {
  //   const [_cost, _explored, _open, froms] = this.statNode(destination);
  //   if (froms.size < 1) return null;
  //   const { done, value } = froms.values().next();
  //   if (done) return null;
  //   return value;
  // }

  // froms(destination: number): Iterable<number> {
  //   const [_cost, _explored, _open, froms] = this.statNode(destination);
  //   return froms;
  // }

  // /**
  //  * @deprecated
  //  * @returns
  //  */
  // more(): boolean {
  //   return this.pqueue.length > 0;
  // }

  // /**
  //  * @returns @deprecated
  //  */
  // pop(): number {
  //   return this.pqueue.shift() ?? -1;
  // }

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
  it("finds the single path as a list of one paths", () => {
    const world = new DijkMap(src1, { x: 6, r: 3 });
    const finder = new DijkstrasPathfinder(world);
    finder.exploreAll(0);
    const paths = Array.from(finder.iterAllPaths(0, 27));
    expect(paths).toEqual([[0, 7, 14, 21, 22, 23, 24, 25, 26, 27]]);
  });
  it.skip("finds the two best paths", () => {
    const world = new DijkMap(src2, { x: 6, r: 3 });
    const finder = new DijkstrasPathfinder(world);
    finder.exploreAll(0);
    const paths = Array.from(finder.iterAllPaths(0, 27));
    expect(new Set(paths)).toEqual(
      new Set([
        [0, 7, 14, 21, 22, 23, 24, 25, 26, 27],
        [0, 1, 2, 3, 4, 5, 6, 13, 20, 27],
      ]),
    );
  });
});
