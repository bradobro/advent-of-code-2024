import { assertEquals } from "@std/assert";
import { fileLines } from "./lib.ts";
import { Puzzle, Results } from "./Puzzle.ts";
import {
  CartesianMatrix,
  directionVectors,
  XY,
  xyAdd,
} from "./cartesianMatrix.ts";
import { Directions } from "./Direction.ts";

export interface Location {
  el: number; // elevation
  // visited: boolean;
  nexts: XY[]; // coords of neighbors that are one elevation higher.
  trailheads: Set<XY>; //trailheads reachable from here
  summits: Set<XY>; // only valid for trailheads: summits reachable
  rating: number; // number of full trails originating from here;
}

export class LavaMap {
  readonly trailheads: Set<XY>;
  readonly summits: Set<XY>;

  constructor(public grid: CartesianMatrix<Location>) {
    [this.trailheads, this.summits] = this.calcNexts();
  }

  /**
   * For each cell, note the neighbors that are one higher than it.
   */
  calcNexts() {
    const trailheads = new Set<XY>();
    const summits = new Set<XY>();
    for (const [here, hereXY] of this.grid.iterCellsC()) {
      if (here.el === 9) {
        summits.add(hereXY);
        continue; // summits have no nexts
      }
      if (here.el === 0) trailheads.add(hereXY);

      // calculate nexts
      for (const d of Directions) {
        const thereXY = this.grid.look(hereXY, d);
        if (thereXY && (this.grid.getXY(thereXY).el - here.el === 1)) {
          here.nexts.push(thereXY);
        }
      }
    }
    return [trailheads, summits];
  }

  extendPaths() {
    for (let el = 0; el < 10; el++) {
      for (const [locA, xyA] of this.iterLocsAtLevel(el)) {
        // if a trailhead, initialize-- trailheads  all originate at themselves
        if (el === 0) locA.trailheads.add(xyA);

        // OPTIMIZATION no need to propagate unreachables
        if (locA.trailheads.size < 1) continue;

        // if on a summit, note on origins
        if (el === 9) {
          for (const trailhead of locA.trailheads) {
            this.grid.getXY(trailhead).summits.add(xyA);
          }
        }
        // otherwise propagate trailheads
        for (const xyB of locA.nexts) {
          const locB = this.grid.getXY(xyB);
          for (const trailhead of locA.trailheads) {
            locB.trailheads.add(trailhead);
          }
        }
      }
    }
  }

  extendRatings() {
    for (let el = 9; el > 0; el--) {
      for (const [locA, xyA] of this.iterLocsAtLevel(el)) {
        // if summit, initialize: all summits have rating 1: one path to themselves
        if (el === 9) locA.rating = 1;

        // OPTIMIZATION no need to propagate dead ends
        if (locA.rating < 1) continue;

        // for (const xyB of locA.nexts) {
        for (const xyB of Directions.map((d) => this.grid.look(xyA, d))) {
          if (xyB === null) continue; // off map, so skip
          const locB = this.grid.getXY(xyB);
          // if appropriate level, propagate ratings
          if (locB.el === el - 1) locB.rating += locA.rating;
        }
      }
    }
  }

  *iterLocsAtLevel(elevation: number): Generator<[Location, XY]> {
    for (const [loc, xy] of this.grid.iterCellsC()) {
      if (loc.el === elevation) yield [loc, xy];
    }
  }

  // Display

  printElevations() {
    this.grid.print((c) => c.el.toString());
  }

  printEndpoints() {
    this.grid.print((c) => [0, 9].includes(c.el) ? c.el.toString() : ".");
  }

  printNextCount() {
    this.grid.print((c) => c.nexts.length.toString());
  }

  printSummitCount() {
    this.grid.print((c) => {
      if (c.el === 9) return "^";
      if (c.el === 0) return c.summits.size.toString();
      return ".";
    });
  }

  printTrailheadCount(a: number, z: number) {
    this.grid.print((c) => {
      if (c.el === 9) return "^";
      if (c.el >= a && c.el <= z) return c.trailheads.size.toString();
      return ".";
    });
  }

  // LOAD AND PARSE

  private static parseCell(s: string): Location {
    return {
      el: parseInt(s),
      nexts: [],
      trailheads: new Set<XY>(),
      summits: new Set<XY>(),
      rating: 0,
    };
  }

  static parse(src: string): LavaMap {
    const grid = CartesianMatrix.parse(src).mapCells(LavaMap.parseCell);
    return new LavaMap(grid);
  }

  static async read(path: string): Promise<LavaMap> {
    const src = await Deno.readTextFile(path);
    return LavaMap.parse(src);
  }
}

export class Day10 extends Puzzle<Results> {
  constructor() {
    super(10);
  }

  async load() {
    const lavamap = await LavaMap.read(this.dataFilePath);
    return lavamap;
  }

  async solve1() {
    const data = await this.load();
    data.extendPaths();
    const totalSumitsFromTrailhead = Array.from(data.trailheads).map((th) =>
      data.grid.getXY(th).summits.size
    ).reduce((acc, n) => acc + n);
    return {
      nTrailheads: data.trailheads.size,
      nSummits: data.summits.size,
      totalSumitsFromTrailhead,
    };
  }

  async solve2() {
    const data = await this.load();
    data.extendRatings();
    const ratings = Array.from(data.trailheads).map((th) =>
      data.grid.getXY(th).rating
    );
    const totalTrailheadRatings = ratings.reduce((acc, n) => acc + n);
    return { totalTrailheadRatings };
  }

  override async solve(): Promise<Results> {
    const results1 = await this.solve1();
    // console.log(results1);
    const results2 = await this.solve2();
    // console.log(results2);
    const results = { ...results1, ...results2 };
    return { day: this.dayNumber, hash: await this.hash(results), results };
  }
}
