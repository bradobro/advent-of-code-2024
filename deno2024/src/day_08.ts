import { assertEquals, assertGreater, assertNotEquals } from "@std/assert";
import { fileLines, iterPairsOf } from "./lib.ts";
import { Puzzle, Results } from "./Puzzle.ts";
import { Matrix, readMatrix, XY, xyAdd, xySub } from "./matrix.ts";

export function multinodes(onmap: (xy: XY) => boolean, c: XY, z: XY): XYs {
  const diff = xySub(c, z);
  const result: XYs = [];
  let a: XY = c.slice(0) as XY; // find start
  while (true) {
    const b = xyAdd(a, diff);
    // console.debug("trying to extend", { a, diff, b });
    if (onmap(b)) a = b;
    else break;
  }

  // console.debug("start point is", { a });
  // a now is one remote starting point
  // we'll keep subtracting the diff (slope) until it's off map
  while (onmap(a)) {
    result.push(a);
    // console.debug("pushing", { a });
    a = xySub(a, diff);
  }
  // console.debug("final", { a, result });

  return result;
}

export function antinodes(a: XY, b: XY): XYs {
  const diff = xySub(a, b);
  return [xyAdd(a, diff), xySub(b, diff)];
}
export interface Location {
  transmitterId?: string;
  antinodes: Set<string>;
}

export type XYs = XY[];
export type Line = [XY, XY];
export type Lines = Line[];
export type TransmitterMap = Record<string, XYs>;

export class Map {
  readonly size: XY;
  readonly towers: TransmitterMap;
  readonly freqs: Set<string>;
  readonly nFreqs: number;
  readonly unusedLetters: Set<string>;

  constructor(public locs: Matrix<Location>) {
    this.size = locs.sizeXY();
    this.towers = {};
    locs.mapCells((c, x, y) => {
      if (c.transmitterId) {
        if (!(c.transmitterId in this.towers)) {
          this.towers[c.transmitterId] = [[x, y]];
        } else this.towers[c.transmitterId].push([x, y]);
      }
    });
    this.freqs = new Set<string>(Object.keys(this.towers).toSorted());
    this.nFreqs = this.freqs.size;

    const lcLetters = "abcdefghijklmnopqrstuvwxyz".split("");
    this.unusedLetters =
      (new Set(lcLetters.flatMap((lc) => [lc.toUpperCase(), lc]))).difference(
        this.freqs,
      );
  }

  freqDupleNodes(freq: string): number {
    let marked = 0;
    const positions: XYs = this.towers[freq];
    assertGreater(positions.length, 1, `expecting at least two towers`);

    for (const [a, b] of iterPairsOf(positions)) {
      for (const anti of antinodes(a, b)) {
        if (this.locs.validXY(anti)) {
          marked += 1;
          this.locs.getXY(anti).antinodes.add(freq);
        }
      }
    }
    // console.debug({ freq, n: positions.length, marked });

    return marked;
  }

  allDupleNodes(): number {
    let total = 0; // non-distinct
    for (const freq of this.freqs) {
      total += this.freqDupleNodes(freq);
      // console.debug({ freq, n: this.towers[freq].length, antinodes });
    }
    return total;
  }

  freqMultiNodes(freq: string): number {
    let marked = 0;
    const positions: XYs = this.towers[freq];
    assertGreater(positions.length, 1, `expecting at least two towers`);

    for (const [a, b] of iterPairsOf(positions)) {
      for (const anti of multinodes((xy: XY) => this.locs.validXY(xy), a, b)) {
        marked += 1;
        this.locs.getXY(anti).antinodes.add(freq);
        // console.debug(".");
      }
    }

    return marked;
  }

  allMultiNodes(): number {
    let total = 0; // non-distinct
    for (const freq of this.freqs) {
      // console.debug({ freq });
      total += this.freqMultiNodes(freq);
    }
    return total;
  }

  static async read(path: string): Promise<Map> {
    function parseCell(s: string): Location {
      return {
        transmitterId: s === "." ? undefined : s,
        antinodes: new Set<string>(),
      };
    }

    const locs = (await readMatrix(path)).mapCells(parseCell);
    return new Map(locs);
  }
}

export class Day08 extends Puzzle<Results> {
  constructor() {
    super(8);
  }

  async load() {
    return await Map.read(this.dataFilePath);
  }

  async solve1() {
    const map = await this.load();
    const totalAntinodes1 = map.allDupleNodes();
    const distinctAntinodes1 = map.locs.iterCells().reduce(
      (acc, cell) => acc + (cell.antinodes.size > 0 ? 1 : 0),
      0,
    );

    return { totalAntinodes1, distinctAntinodes1 };
  }

  async solve2() {
    const map = await this.load();
    const totalAntinodes2 = map.allMultiNodes();
    const distinctAntinodes2 = map.locs.iterCells().reduce(
      (acc, cell) => acc + (cell.antinodes.size > 0 ? 1 : 0),
      0,
    );

    return { totalAntinodes2, distinctAntinodes2 };
  }

  override async solve(): Promise<Results> {
    // const map = await this.load();
    // console.debug(map.towers, map.freqs, map.nFreqs);
    // console.debug(map.unusedLetters);
    const results1 = await this.solve1();
    const results2 = await this.solve2();
    const results = { ...results1, ...results2 };
    return { day: this.dayNumber, hash: await this.hash(results), results };
  }
}
