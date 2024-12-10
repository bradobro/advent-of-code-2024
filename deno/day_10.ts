import { assertEquals } from "@std/assert";
import { fileLines } from "./lib.ts";
import { Puzzle, Results } from "./Puzzle.ts";
import { Directions, directionVectors, Matrix, XY, xyAdd } from "./matrix.ts";

export interface Location {
  el: number; // elevation
  visited: boolean;
  nexts: XY[]; // coords of neighbors that are one elevation higher.
}

export class LavaMap {
  readonly trailheads: Set<XY>;
  readonly summits: Set<XY>;

  constructor(public grid: Matrix<Location>) {
    [this.trailheads, this.summits] = this.calcNexts();
  }

  /**
   * For each cell, note the neighbors that are one higher than it.
   */
  calcNexts() {
    const trailheads = new Set<XY>();
    const summits = new Set<XY>();
    for (const [here, hereXY] of this.grid.iterCellsC()) {
      if (here.el === 0) trailheads.add(hereXY);
      else if (here.el === 9) summits.add(hereXY);
      for (const d of Directions) {
        const thereXY = this.grid.look(hereXY, d);
        if (thereXY && (this.grid.getXY(thereXY).el - here.el === 1)) {
          here.nexts.push(thereXY);
        }
      }
    }
    return [trailheads, summits];
  }

  private static parseCell(s: string): Location {
    return {
      el: parseInt(s),
      visited: false,
      nexts: [],
    };
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

  // LOAD AND PARSE

  static parse(src: string): LavaMap {
    const grid = Matrix.parse(src).mapCells(LavaMap.parseCell);
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
    return await LavaMap.read(this.dataFilePath);
  }

  override async solve(): Promise<Results> {
    const data = await this.load();
    console.debug("=====Elevations=====");
    data.printElevations();
    // console.debug("=====Endpoints=====");
    // data.printEndpoints();
    // console.debug("=====NextCount=====");
    // data.printNextCount();

    const results = {};
    return { day: this.dayNumber, hash: await this.hash(results), results };
  }
}
