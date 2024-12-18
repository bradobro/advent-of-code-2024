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

export type XR = { x: number; r: number }; // R is y measured from the top left

// guard bunnies
export interface Mover {
  loc: XR;
  dx: number;
  dr: number;
}

export function move(times: number, area: XR, mvr: Mover): XR {
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
  size: XR;
  movers: Mover[];
}

export function moveAll(times: number, { size, movers }: Terrain): Terrain {
  const newMovers = movers.map((mvr) => ({
    ...mvr,
    loc: move(times, size, mvr),
  }));
  return { size, movers: newMovers };
}

// export function quadrantOf({x: w, r:h}: XR, {x, r}:XR){

// }

export function quadrantCounts(area: XR, mvrs: Mover[]) {
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
  };
}
