import { assertEquals } from "@std/assert/equals";
import { i2xy, numeratorsAndDenominators, xy2i } from "./FlatMatrix.ts";
import { fromXR, getXR, iterCells, WH, XR } from "./Matrix.ts";
import { Dijkstrable, DijkstrasPathfinder } from "./pathfinders.ts";
import { Directions } from "./Direction.ts";
import { assertGreaterOrEqual } from "@std/assert/greater-or-equal";

interface Loc18 {
  // open: boolean; tClobbered < 0
  tClobbered: number;
  explored: boolean;
  cost: number;
  froms: Set<number>;
}

export function parseDropCoords(src: string): XR[] {
  return src.trim().split("\n").map((row) => {
    const [x, r] = row.trim().split(",").map((n) => parseInt(n.trim()));
    return { x, r };
  });
}

export class Day18 implements Dijkstrable<number> {
  grid: Loc18[][] = [];
  readonly drops: XR[];
  readonly nums: number[];
  readonly divs: number[];
  readonly start: number;
  readonly finish: number;
  pqueue: number[] = [];
  tNS = 0;

  constructor(src: string, readonly size: WH, start: XR, finish: XR) {
    this.drops = parseDropCoords(src);
    for (let i = 0; i < size.h; i++) {
      const row: Loc18[] = [];
      for (let j = 0; j < size.w; j++) {
        row.push(
          {
            tClobbered: -1,
            explored: false,
            cost: Number.MAX_SAFE_INTEGER,
            froms: new Set<number>(),
          },
        );
      }
      this.grid.push(row);
    }
    [this.nums, this.divs] = numeratorsAndDenominators([size.w, size.h]);
    this.start = this.xr2i(start);
    this.finish = this.xr2i(finish);
  }

  // part b

  runAtT(numberofdrops: number): XR {
    this.resetPaths();
    this.dropN(numberofdrops);
    return this.drops[numberofdrops - 1];
  }

  resetPaths() {
    for (const { value: c } of iterCells(this.grid)) {
      c.cost = Number.MAX_SAFE_INTEGER;
      c.explored = false;
      c.tClobbered = -1;
      c.froms.clear();
    }
  }

  // helpers

  xr2i({ x, r }: XR): number {
    return xy2i([x, r], this.nums);
  }

  i2xr(id: number): XR {
    const [x, r] = i2xy(id, this.divs);
    return { x, r };
  }

  getId(id: number): Loc18 {
    return getXR(this.grid, this.i2xr(id));
  }

  endCost(): number {
    return this.getId(this.finish).cost;
  }

  dropAll() {
    for (const [_t, _loc] of this.iterDrops()) {
      //console.debug({ _t, _loc });
    }
  }

  dropN(n: number) {
    let i = 0;
    for (const [_t, _loc] of this.iterDrops()) {
      //console.debug({ _t, _loc });
      i++;
      if (i >= n) break;
    }
  }

  *iterDrops() {
    for (this.tNS = 0; this.tNS < this.drops.length; this.tNS++) {
      const clobberingAt = this.drops[this.tNS];
      getXR(this.grid, clobberingAt).tClobbered = this.tNS;
      yield [this.tNS, clobberingAt];
    }
  }

  // Iterator interface
  next(): IteratorResult<number, undefined> {
    const value = this.pqueue.shift();
    if (value !== undefined) return { value };
    return { done: true, value: undefined };
  }

  // Iterable interface
  [Symbol.iterator]() {
    return this;
  }

  // Dijkstrable Interface
  statNode(id: number): [number, boolean, boolean, froms: Iterable<number>] {
    const xr = this.i2xr(id);
    const { cost, explored, tClobbered, froms } = getXR(this.grid, xr);
    return [cost, explored, tClobbered < 0, froms];
  }

  mark(id: number): void {
    this.getId(id).explored = true;
  }

  cost(n: number) {
    return this.getId(n).cost;
  }

  costFrom(_from: number, _to: number): number {
    // presume correct
    return 1;
  }

  neighbors(n: number): number[] {
    const result: number[] = [];
    const here = this.i2xr(n);
    for (const d of Directions) {
      const there = fromXR(this.grid, here, d);
      if (!there) continue;
      const node = getXR(this.grid, there);
      if (node.tClobbered < 0 && !node.explored) result.push(this.xr2i(there));
    }
    return result;
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
      this.pqueue.sort((a, b) => this.getId(a).cost - this.getId(b).cost);
    }
  }
}

const BIG = Number.MAX_SAFE_INTEGER - 5;

function bisect(
  map: Day18,
  pf: DijkstrasPathfinder,
  highestGood: number,
  lowestBad: number,
): number {
  let good = highestGood;
  let bad = lowestBad;
  while (good < bad - 1) {
    const mid = (bad - good) > 1
      ? Math.trunc((bad - good) / 2) + good
      : good + 1;
    map.resetPaths();
    map.dropN(mid);
    pf.exploreAll(0);
    const cost = map.endCost();
    if (cost < BIG) {
      console.debug({ ok: true, drops: mid, cost });
      good = mid;
    } else {
      console.debug({ ok: false, drops: mid });
      bad = mid;
    }
  }
  console.debug("FINAL", { good, bad, coords: map.drops[bad - 1] });
}

export function day18a() {
  console.debug("running a8a");
  const src = Deno.readTextFileSync("./data/day_18.txt");
  const map = new Day18(src, { w: 71, h: 71 }, { x: 0, r: 0 }, {
    x: 70,
    r: 70,
  });
  map.dropN(1024);
  const pf = new DijkstrasPathfinder(map);
  pf.exploreAll(0);
  // 140 is too low
  console.log({ solutionACost: map.endCost(), totalDrops: map.drops.length });

  console.log("starting part b");
  // validate bounds
  map.resetPaths();
  map.dropN(map.drops.length);
  pf.exploreAll(0);
  assertGreaterOrEqual(map.endCost(), BIG);
  bisect(map, pf, 1024, map.drops.length);
}
