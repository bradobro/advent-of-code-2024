import { assert, assertEquals, assertGreater } from "@std/assert";
import { Puzzle, Results } from "./Puzzle.ts";
import {
  Direction,
  Directions,
  left,
  Matrix,
  right,
  XY,
  xyEqual,
} from "./matrix.ts";
import { earlyZipReadableStreams } from "@std/streams/early-zip-readable-streams";
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

export interface RegionWithMeta extends Region {
  id: RegionId;
  start: XY;
  island: boolean; // true if surrounded by one region: presumed true until proven false
  islandIn: RegionId;
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
  public regions: RegionWithMeta[] = [];
  readonly totalCost: number;
  readonly totalDiscountedCost: number;

  constructor(public grid: FieldMap) {
    this.calcPerims();
    this.collectRegions();
    for (const r of this.regions) r.sides = this.externalSideCount(r);
    for (const r of this.regions) {
      // islands "carve their sides out of another"
      if (r.island) this.regions[r.islandIn].sides += r.sides;
    }
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

  externalSideCount(reg: RegionWithMeta): number {
    // const neighbors = new Set<RegionId>();  // test for islands a byproducs
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
        if (locLeft.region === loc0.region) {
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

  newRegion(loc: Loc, xy: XY): RegionWithMeta {
    // create region and do initial bookeeping
    const r: RegionWithMeta = {
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

  *iterRegions(): Generator<RegionWithMeta> {
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
