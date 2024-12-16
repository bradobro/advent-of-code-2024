import { assert, assertEquals, assertGreater } from "@std/assert";
import { Puzzle, Results } from "./Puzzle.ts";
import {
  CellColoredFormatter,
  Direction,
  Directions,
  left,
  Matrix,
  nColors,
  right,
  XY,
  xyEqual,
} from "./matrix.ts";
// https://adventofcode.com/2024/day/12

export interface Region12 {
  crop: string;
  perim: number; // perimeter
  sides: number;
  area: number; // Locs contained
  cost: number; // perim * area, answer for part 1
  discounted: number; // answer for part 2
}

export type Region12Id = number;

export interface Region12WithMeta extends Region12 {
  id: Region12Id;
  start: XY;
  island: boolean; // true if surrounded by one region: presumed true until proven false
  islandIn: Region12Id;
  cells: Set<Loc12>;
  adjoining: Set<Region12Id>;
}

export interface Loc12 {
  crop: string; // letter
  region: Region12Id; // -1 means not assigned yet
  perim: number; // sides touching edge or other crop
  xy: XY;
}

export const NO_REGION = -1;

function parseLoc(crop: string, x: number, y: number): Loc12 {
  return { crop, region: NO_REGION, perim: 0, xy: [x, y] };
}

export type FieldMap12 = Matrix<Loc12>;

export class PuzzleModel12 {
  readonly RegionNeighbors: Direction[] = [Direction.S, Direction.W];
  public regions: Region12WithMeta[] = [];
  readonly totalCost: number;
  readonly totalDiscountedCost: number;

  constructor(public grid: FieldMap12) {
    this.calcPerims();
    this.collectRegions();
    this.trapseCountingSides();
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

  totalPerimsAndSides(): [number, number] {
    let tPerims = 0;
    let tSides = 0;
    for (const r of this.regions) {
      tPerims += r.perim;
      tSides += r.sides;
    }
    return [tPerims, tSides];
  }

  countSidesExtendingPerims() {}

  regionSides() {
  }

  trapseCountingSides() {
    for (const r of this.regions) r.sides = this._trapseRegion(r);
    for (const r of this.regions) {
      // islands "carve their sides out of another"
      if (r.island) this.regions[r.islandIn].sides += r.sides;
    }
  }

  private _trapseRegion(reg: Region12WithMeta): number {
    const xy0 = reg.start;
    const loc0 = this.grid.getXY(xy0);
    // console.debug(`starting from ${xy0}`, reg, loc0);

    let count = 0;
    const seen = new Set<XY>(); // prevent counterclockwise loops
    let xya = reg.start; // start here and finish here facing the same way
    let corners = 0; // found one corner
    let dir = Direction.N; // walk the perimiter starting North

    while (true) {
      // check for stop conditions
      if (xyEqual(xya, reg.start)) {
        // console.debug("We're backc home!");
        if (corners > 0) {
          // console.debug("we've got corners");
          if (dir === Direction.N) {
            // console.debug("and we're facing N, so breaking");
            break;
          } else {
            // console.debug("but we're not facing N");
          }
        } else {
          // console.debug("but we have no corners");
        }
      }

      seen.add(xya);

      // we still think this region could be an island. Let's check
      // if that's still true
      if (reg.island) {
        for (const d of Directions) {
          const xyn = this.grid.look(xya, d);
          // found an edge, it's not an island
          if (!xyn) reg.island = false;
          else {
            const locn = this.grid.getXY(xyn);
            // found a different region...
            if (locn.region !== reg.id) {
              if (reg.islandIn === NO_REGION) {
                // first we've seen, so mark it
                reg.islandIn = locn.region;
              } else if (locn.region !== reg.islandIn) {
                // bordering a second region, so not an island
                reg.island = false;
              }
            }
          }
        }
      }

      if (count++ > 1000) {
        console.debug(reg);
        assert(false, `looped too many times on on ${xya}`);
      } else {
        // console.debug({ count, dir, xya, regId: reg.id, crop: reg.crop });
      }
      seen.add(xya);

      // if I can turn left, do so and add a corner to the count
      const xyLeft = this.grid.lookL(xya, dir);
      if (xyLeft) {
        // console.debug(`looking left from ${xya} ${dir}`);
        const locLeft = this.grid.getXY(xyLeft);
        if (seen.has(xyLeft)) {
          console.debug(`strange, we might have a left-hand-trap`);
        } else if (locLeft.region === loc0.region) {
          // console.debug(`left is same region, so turning and moving`);
          dir = left(dir);
          xya = xyLeft;
          corners++;
          continue;
        } else {
          // console.debug(`...but it's not the same region`);
        }
      } else {
        // console.debug(`couldn't look left from ${xya} facing ${dir}`);
      }

      // else, go forward if I can along this side
      const xyAhead = this.grid.look(xya, dir);
      if (xyAhead) { // there's a space forward
        // console.debug(`looking forward from ${xya}, ${dir}`);
        const ahead = this.grid.getXY(xyAhead);
        if (ahead.region === loc0.region) {
          // console.debug(`same region, so moving to ${xyAhead}`);
          xya = xyAhead;
          continue;
        } else {
          // console.debug(`not same region, skipping move`);
        }
      } else {
        // console.debug(`I couldn't see forward from ${xya}, ${dir}`);
      }

      dir = right(dir);
      // console.debug(`turning right to ${dir}`);
      corners++;
    }
    // console.debug("corners = ", corners);
    return corners;
  }

  calcPerims() {
    for (const [loc, xy] of this.grid.iterCellsC()) {
      loc.perim = this.perimCount(loc, xy);
    }
  }

  perimCount(loca: Loc12, xya: XY): number {
    return Directions.reduce((acc, d) => {
      const xyb = this.grid.look(xya, d);
      return acc + ((xyb && this.grid.getXY(xyb).crop === loca.crop) ? 0 : 1);
    }, 0);
  }

  nextLocWithoutRegion(): [Loc12, XY] | null {
    for (const [loc, xy] of this.grid.iterCellsC()) {
      if (loc.region === NO_REGION) return [loc, xy];
    }
    return null;
  }

  newRegion(loc: Loc12, xy: XY): Region12WithMeta {
    // create region and do initial bookeeping
    const r: Region12WithMeta = {
      id: this.regions.length,
      start: xy,
      island: true,
      islandIn: NO_REGION,
      crop: loc.crop,
      perim: 0,
      sides: 0,
      area: 0,
      cost: 0,
      discounted: 0,
      cells: new Set<Loc12>(),
      adjoining: new Set<Region12Id>(),
    };
    this.regions.push(r);
    return r;
  }

  *iterRegionCells(id: Region12Id, xy0: XY): Generator<[Loc12, XY]> {
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

  *iterRegions(): Generator<Region12WithMeta> {
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
        r.cells.add(loca);
      }
      yield r;
    }
  }

  collectRegions() {
    // search out the regions
    this.iterRegions().forEach((r, i) => {
      assertEquals(r.id, i);
      assertEquals(r.area, r.cells.size);
    });
  }

  // Loading

  static parse(src: string): PuzzleModel12 {
    const grid = Matrix.parse(src.trim()).mapCells(parseLoc);
    return new PuzzleModel12(grid);
  }

  static async read(path: string): Promise<PuzzleModel12> {
    const src = await Deno.readTextFile(path);
    return PuzzleModel12.parse(src);
  }
}

export class Day12 extends Puzzle<Results> {
  constructor() {
    super(12);
  }

  async load() {
    return await PuzzleModel12.read(this.dataFilePath);
  }

  async solve1() {
    const data = await this.load();
    // return data.grid.format((c: Loc) => c.crop);
    return { cost1: data.totalCost };
  }

  async solve2() {
    // deno-lint-ignore no-explicit-any
    const mistakes: Record<number, any> = {
      878118: { msg: "too low" },
      918740: { msg: "too high", tPerim: 16568, tSides: 10688 },
    };
    const data = await this.load();
    const { totalDiscountedCost: discounted2 } = data;
    const [tPerim, tSides] = data.totalPerimsAndSides();

    if (discounted2 in mistakes) {
      console.error(
        "already gave that answer",
        discounted2,
        mistakes[discounted2],
      );
    }
    if (discounted2 < 918740 && discounted2 > 978118) {
      console.debug("you have a new answer in a possibly correct range");
    }

    // color formatters
    const _cRegions: CellColoredFormatter<Loc12> = (
      c: Loc12,
    ) => [c.region, c.crop];
    const _cRegionIds: CellColoredFormatter<Loc12> = (
      c: Loc12,
    ) => [c.region, data.regions[c.region].id.toString().padEnd(4)];

    const _cRegionSides: CellColoredFormatter<Loc12> = (
      c: Loc12,
    ) => [c.region, data.regions[c.region].sides.toString().padEnd(4)];
    const _cIslands: CellColoredFormatter<Loc12> = (
      c: Loc12,
    ) => {
      const region = data.regions[c.region];
      if (region.island) {
        return [c.region, c.crop];
      } else {
        return [nColors - 1, " "];
      }
    };

    // data.grid.printc(_cRegions);
    // data.grid.printc(_cIslands);
    for (const r of data.regions) {
      if (r.sides % 2 === 1) console.debug(r); // regions should have even number of sides
    }
    return { discounted2, tPerim, tSides };
  }

  override async solve(): Promise<Results> {
    const which = 2;
    const results1 = which & 1 ? await this.solve1() : { puz1Skip: 1 };
    const results2 = which & 2 ? await this.solve2() : { puz2Skip: 1 };
    const results = { ...results1, ...results2 };
    return { day: this.dayNumber, hash: await this.hash(results), results };
  }
}
