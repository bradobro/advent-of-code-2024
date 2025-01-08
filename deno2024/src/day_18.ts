import { assertEquals } from "@std/assert/equals";
import { numeratorsAndDenominators, xy2i } from "./FlatMatrix.ts";
import { getXR, WH, XR } from "./Matrix.ts";
import { Dijkstrable } from "./pathfinders.ts";

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

export class Day18 /*implements Dijkstrable<number>*/ {
  grid: Loc18[][] = [];
  readonly drops: XR[];
  readonly nums: number[];
  readonly divs: number[];
  readonly start: number;
  readonly finish: number;
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
            cost: 0,
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

  xr2i({ x, r }: XR): number {
    return xy2i([x, r], this.nums);
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
    assertEquals(this.tNS, 0);
    for (this.tNS = 0; this.tNS < this.drops.length; this.tNS++) {
      const clobberingAt = this.drops[this.tNS];
      getXR(this.grid, clobberingAt).tClobbered = this.tNS;
      yield [this.tNS, clobberingAt];
    }
  }
}

export function day18a() {
  console.debug("running a8a");
}
