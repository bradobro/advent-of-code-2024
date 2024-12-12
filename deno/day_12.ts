import { assertEquals, assertGreater } from "@std/assert";
import { fileLines } from "./lib.ts";
import { Puzzle, Results } from "./Puzzle.ts";
import { Direction, Directions, Matrix, XY } from "./matrix.ts";
// https://adventofcode.com/2024/day/12

export interface Region {
  crop: string;
  perim: number; // perimeter
  area: number; // Locs contained
  cost: number; // perim * area
}

type RegionId = number;

export interface RegionIdd extends Region {
  id: RegionId;
}

export interface Loc {
  crop: string; // letter
  region: RegionId; // -1 means not assigned yet
  perim: number; // sides touching edge or other crop
}

const NO_REGION = -1;

function parseLoc(crop: string): Loc {
  return { crop, region: NO_REGION, perim: 0 };
}

export type FieldMap = Matrix<Loc>;

export class PuzzleField {
  readonly RegionNeighbors: Direction[] = [Direction.S, Direction.W];
  public regions: RegionIdd[] = [];
  readonly totalCost: number;

  constructor(public grid: FieldMap) {
    this.collectRegions();
    this.totalCost = this.calcCosts();
  }

  collectRegions() {
    // this algorithm depends on iterating +x,+y (row-major, ascending cartesisn)
    for (const [loca, xya, xypred] of this.grid.iterSnake()) {
      loca.perim = this.perimCount(loca, xya);
      loca.region = this.findOrMakeRegion(loca, xya, xypred);
    }
  }

  calcCosts(): number {
    let result = 0;
    for (let i = 0; i < this.regions.length; i++) {
      const region = this.regions[i];
      assertEquals(region.id, i, "expecting regions id's to ascend and match");
      region.cost = region.area * region.perim;
      result += region.cost;
    }
    return result;
  }

  perimCount(loca: Loc, xya: XY): number {
    return Directions.reduce((acc, d) => {
      const xyb = this.grid.look(xya, d);
      return acc + ((xyb && this.grid.getXY(xyb).crop === loca.crop) ? 0 : 1);
    }, 0);
  }

  findOrMakeRegion(loca: Loc, xya: XY, xypred: XY | null): RegionId {
    for (const xyb of [xypred, this.grid.look(xya, Direction.S)]) {
      if (!xyb) continue;
      const locb = this.grid.getXY(xyb);
      if (locb.crop === loca.crop) {
        assertGreater(
          locb.region,
          NO_REGION,
          "if the crops match, should already have a region",
        );
        // add to region , area, and perim maybe? zip up costs after we're done
        const region = this.regions[locb.region];
        region.area += 1;
        region.perim += loca.perim;
        return locb.region;
      }
    }
    const region: RegionIdd = {
      id: this.regions.length,
      crop: loca.crop,
      perim: loca.perim,
      area: 1,
      cost: 0,
    };
    loca.region = region.id;
    // console.debug("found new region", loca, xya);
    this.regions.push(region);
    return region.id;
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
    return data.grid.format((c: Loc) => c.crop);
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
