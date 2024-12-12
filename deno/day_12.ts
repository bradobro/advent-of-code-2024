import { assertEquals, assertGreater } from "@std/assert";
import { Puzzle, Results } from "./Puzzle.ts";
import { Direction, Directions, Matrix, XY } from "./matrix.ts";
// https://adventofcode.com/2024/day/12

export interface Region {
  crop: string;
  perim: number; // perimeter
  sides: number;
  area: number; // Locs contained
  cost: number; // perim * area, answer for part 1
  discounted: number; // answer for part 2
}

type RegionId = number;

export interface RegionIdd extends Region {
  start: XY;
  id: RegionId;
}

export interface Loc {
  crop: string; // letter
  region: RegionId; // -1 means not assigned yet
  perim: number; // sides touching edge or other crop
}

export const NO_REGION = -1;

function parseLoc(crop: string): Loc {
  return { crop, region: NO_REGION, perim: 0 };
}

export type FieldMap = Matrix<Loc>;

export class PuzzleField {
  readonly RegionNeighbors: Direction[] = [Direction.S, Direction.W];
  public regions: RegionIdd[] = [];
  readonly totalCost: number;
  readonly totalDiscountedCost: number;

  constructor(public grid: FieldMap) {
    this.calcPerims();
    this.collectRegions();
    [this.totalCost, this.totalDiscountedCost] = this.calcCosts();
  }

  calcCosts(): [number, number] {
    let cost = 0;
    let discounted = 0;
    for (let i = 0; i < this.regions.length; i++) {
      const region = this.regions[i];
      assertEquals(region.id, i, "expecting regions id's to ascend and match");
      region.cost = region.area * region.perim;
      region.discounted = region.area * region.sides;
      cost += region.cost;
      discounted += region.discounted;
    }
    return [cost, discounted];
  }

  calcPerims() {
    for (const [loc, xy] of this.grid.iterCellsC()) {
      loc.perim = this.perimCount(loc, xy);
    }
  }

  perimCount(loca: Loc, xya: XY): number {
    return Directions.reduce((acc, d) => {
      const xyb = this.grid.look(xya, d);
      return acc + ((xyb && this.grid.getXY(xyb).crop === loca.crop) ? 0 : 1);
    }, 0);
  }

  nextLocWithoutRegion(): [Loc, XY] | null {
    for (const [loc, xy] of this.grid.iterCellsC()) {
      if (loc.region === NO_REGION) return [loc, xy];
    }
    return null;
  }

  newRegion(loc: Loc, xy: XY): RegionIdd {
    // create region and do initial bookeeping
    const r: RegionIdd = {
      start: xy,
      id: this.regions.length,
      crop: loc.crop,
      perim: 0,
      sides: 0,
      area: 0,
      cost: 0,
      discounted: 0,
    };
    this.regions.push(r);
    return r;
  }

  *iterRegionCells(id: RegionId, xy0: XY): Generator<[Loc, XY]> {
    const searchThese: XY[] = [xy0];
    while (true) {
      // get the next loc  if there is one
      const xya: XY | undefined = searchThese.shift();
      if (!xya) break;
      const loca = this.grid.getXY(xya);
      // might be redundant, but it's safe
      if (loca.region !== NO_REGION) continue; // we already dealt with this one

      // set the region and yield
      loca.region = id;
      yield [loca, xya];

      // gather other places to search
      for (const d of Directions) {
        // might not have to look at S, but let's do it anyhow for now
        const xyb = this.grid.look(xya, d);
        if (!xyb) continue; // on edge, no neighbor
        const locb = this.grid.getXY(xyb);
        if (locb.region !== NO_REGION) continue; // already taken care of
        // otherwise put on the list of ones to look at.
        if (locb.crop === loca.crop) searchThese.push(xyb);
      }
    }
  }

  *iterRegions(): Generator<RegionIdd> {
    while (true) {
      const nxt = this.nextLocWithoutRegion();
      if (nxt === null) break; // no more non-regioned cells

      // create new region
      const [loc0, xy0] = nxt;
      const r = this.newRegion(loc0, xy0);

      // add cells to it (iterator includes origin cell)
      for (const [loca, _] of this.iterRegionCells(r.id, xy0)) {
        // loca.region = r.id; // set in iterator
        r.perim += loca.perim;
        r.area += 1;
      }
      yield r;
    }
  }

  collectRegions() {
    // for (const [loca, xya, xypred] of this.grid.iterSnake()) {
    //   // loca.perim = this.perimCount(loca, xya);
    //   loca.region = this.findOrMakeRegion(loca, xya, xypred);
    // }
    this.iterRegions().forEach((r, i) => assertEquals(r.id, i));
  }

  // Loading

  static parse(src: string): PuzzleField {
    const grid = Matrix.parse(src.trim()).mapCells(parseLoc);
    return new PuzzleField(grid);
  }

  static async read(path: string): Promise<PuzzleField> {
    const src = await Deno.readTextFile(path);
    return PuzzleField.parse(src);
  }
}

export class Day12 extends Puzzle<Results> {
  constructor() {
    super(12);
  }

  async load() {
    return await PuzzleField.read(this.dataFilePath);
  }

  async solve1() {
    const data = await this.load();
    // return data.grid.format((c: Loc) => c.crop);
    return { cost1: data.totalCost };
  }

  async solve2() {
    const data = await this.load();
    return { data };
  }

  override async solve(): Promise<Results> {
    const which = 1;
    const results1 = which & 1 ? await this.solve1() : { puz1Skip: 1 };
    console.debug(results1);
    const results2 = which & 2 ? await this.solve2() : { puz2Skip: 1 };
    // console.debug({ results1, results2 });
    const results = {};
    return { day: this.dayNumber, hash: await this.hash(results), results };
  }
}
