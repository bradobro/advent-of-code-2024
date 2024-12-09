import { assertEquals } from "@std/assert";
import { fileLines } from "./lib.ts";
import { Puzzle, Results } from "./Puzzle.ts";
import { Matrix, readMatrix, XY } from "./matrix.ts";

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
    // const LC = new Set(lcLetters);
    // const UC = new Set(lcLetters.map((s) => s.toUpperCase()));
    // this.unusedLetters = UC.difference(this.freqs).union(
    //   LC.difference(this.freqs),
    // );
    this.unusedLetters =
      (new Set(lcLetters.flatMap((lc) => [lc.toUpperCase(), lc]))).difference(
        this.freqs,
      );
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

  override async solve(): Promise<Results> {
    const map = await this.load();
    // console.debug(map.towers, map.freqs, map.nFreqs);
    console.debug(map.unusedLetters);
    const results = {};
    return { day: this.dayNumber, hash: await this.hash(results), results };
  }
}
