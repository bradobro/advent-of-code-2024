/* Puzzle 14

This puzzle talks in X,Y coordinates in screen/matrix terms (not cartesian quadrant1).
In terms of my existing Matrix class, Column, Row. To handle this, I could:

- Do a quick-and-dirty solution like most AoC leaders I've seen do.
- Rename Matrix to CartesianMatrix and and inherit a facade from it called ScreenMatrix.
- Add a switch to Matrix to use screen-style X,Y coordinates and, perhaps, flip Direction.N and Direction.S
- Use the existing getRC() functions, or a getCR(x,y) to cut down on programmer errors.

at this point, I don't even need to realize the map, just the positions on it. Fairly quick and dirty
*/
import { assertExists } from "@std/assert/exists";
import { Puzzle, Results } from "./Puzzle.ts";
import { assertEquals } from "@std/assert/equals";
import { assertLessOrEqual } from "@std/assert/less-or-equal";

export type XR14 = { x: number; r: number }; // R is y measured from the top left

// guard bunnies
export interface Mover {
  loc: XR14;
  dx: number;
  dr: number;
}

export function move(times: number, area: XR14, mvr: Mover): XR14 {
  const positiveModulo = (
    n: number,
    area: number,
    start: number,
    delta: number,
  ): number => {
    const moduloPositiveOrNegative = (n * delta + start) % area;
    return (moduloPositiveOrNegative + area) % area;
  };
  return {
    x: positiveModulo(times, area.x, mvr.loc.x, mvr.dx),
    r: positiveModulo(times, area.r, mvr.loc.r, mvr.dr),
  };
}

// BHQ
export interface Terrain {
  size: XR14;
  movers: Mover[];
  generation: number;
}

export function moveAll(
  times: number,
  { size, movers, generation }: Terrain,
): Terrain {
  if (times === 0) return { size, movers, generation };
  const newMovers = movers.map((mvr) => ({
    ...mvr,
    loc: move(times, size, mvr),
  }));
  return { size, movers: newMovers, generation: generation + times };
}

export function quadrantCounts(area: XR14, mvrs: Mover[]) {
  const quadrants = [0, 0, 0, 0];
  // returns [a,b] where n<=a means lower quadrant, n>=b upper quadrant
  function dividers(n: number): [number, number] {
    let mid = n / 2;
    if (n % 2 === 0) return [mid - 1, mid];
    mid = (n - 1) / 2;
    return [mid - 1, mid + 1]; // we omit middle row or column
  }
  const [x1max, x2min] = dividers(area.x);
  const [r1max, r2min] = dividers(area.r);
  for (const mvr of mvrs) {
    if (mvr.loc.x <= x1max) {
      if (mvr.loc.r <= r1max) quadrants[0]++;
      else if (mvr.loc.r >= r2min) quadrants[2]++;
    } else if (mvr.loc.x >= x2min) {
      if (mvr.loc.r <= r1max) quadrants[1]++;
      else if (mvr.loc.r >= r2min) quadrants[3]++;
    }
  }
  return quadrants;
}

export function parseMovers(src: string) {
  return src.trim().split("\n").map((so) => {
    const matches = so.trim().match(/^p=(\d+),(\d+) v=(-?\d+),(-?\d+)/);
    assertExists(matches, "we should always have matches");
    const [x, r, dx, dr] = matches.slice(1, 5).map((s) => parseInt(s));
    const mvr: Mover = { loc: { x, r }, dx, dr };
    return mvr;
  });
}

export function parseTerrain(
  xwidth: number,
  rheight: number,
  moversSrc: string,
): Terrain {
  return {
    size: { x: xwidth, r: rheight },
    movers: parseMovers(moversSrc),
    generation: 0,
  };
}

export function christmasTree(t: Terrain): boolean {
  /*
  IDEAS:
  - look for vertical or horizontal lines?
  - look for few (or no) stacks
  - similarly, look for high number of distinct occupied cells
  */
  return false;
}

type NMatrix14 = number[][];

export function makeMatrix14(rows: number, cols: number, value = 0): NMatrix14 {
  const result: NMatrix14 = [];
  for (let i = 0; i < rows; i++) result.push(Array(cols).fill(value));
  return result;
}

interface GriddedTerrain extends Terrain {
  grid: NMatrix14;
}

type NFormatter = (n: number) => string;

function defaultCellFormatter(n: number): string {
  if (n < 0) return "-";
  if (n === 0) return ".";
  if (n < (10)) return String.fromCharCode(n + "0".charCodeAt(0));
  if (n < (37)) return String.fromCharCode(n + "a".charCodeAt(0));
  return "*";
}

export function formatMatrix14(
  m: NMatrix14,
  cells = defaultCellFormatter,
  rowJoin = "\n",
): string {
  return m.map((row) => row.map(cells).join("")).join(rowJoin);
}

export function addGrid(t: Terrain): GriddedTerrain {
  const grid = makeMatrix14(t.size.r, t.size.x);
  for (const m of t.movers) {
    grid[m.loc.r][m.loc.x] += 1;
  }
  return { ...t, grid };
}

export function* iterGrids14(
  terrain: Terrain,
  start = 0,
  step = 1,
  limit = 1000000000,
): Generator<GriddedTerrain> {
  assertEquals(terrain.generation, 0, "pristine terrain only");
  const current = addGrid(moveAll(start, terrain));
  while (current.generation < limit) { // caller must halt!
    yield { ...current };
    const grid = makeMatrix14(current.size.r, current.size.x);
    const movers = current.movers.map((mvr) => {
      const loc = move(step, current.size, mvr); // find the new location
      grid[loc.r][loc.x] += 1; // add an occupant to the count at the new location
      return { ...mvr, loc };
    });
    current.generation += step;
    current.grid = grid;
    current.movers = movers;
  }
}
