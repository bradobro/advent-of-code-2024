import { assert } from "@std/assert/assert";
import { fileLines } from "./lib.ts";
import { Puzzle } from "./Puzzle.ts";

type Lines = string[];

const hits = ["SM", "MS"];

function foundCross(a: Lines, x: number, y: number): boolean {
  const formation = a[y].slice(x, x + 3) + "\n" + a[y + 1].slice(x, x + 3) +
    "\n" +
    a[y + 2].slice(x, x + 3) + "\n";
  if (formation[5] !== "A") return false;
  if (!hits.includes(formation[0] + formation[10])) return false;
  if (!hits.includes(formation[2] + formation[8])) return false;
  // console.debug(formation);
  return true;
}

function countCrossedMAS(a: Lines) {
  const n = a.length;
  const limit = n - 2; // dont' have to search last two columns or rows for a 3x3 pattern
  let result = 0;

  for (let y = 0; y < limit; y++) {
    for (let x = 0; x < limit; x++) {
      // rules: only search down and to the right
      if (foundCross(a, x, y)) result++;
    }
  }

  return result;
}

type transformer = (a: Lines) => Lines;

/**
 * @param a input data as horizontal lines
 * @returns input data as horizontal lines
 */
export function transformHorizontal(a: Lines): Lines {
  return a;
}

export function transformVertical(a: Lines): Lines {
  const result: Lines = [];
  const n = a.length;
  for (let x = 0; x < n; x++) {
    const chars: string[] = [];
    for (let y = 0; y < n; y++) {
      chars.push(a[y][x]);
    }
    const line = chars.join("");
    // console.debug(line);
    result.push(line);
  }
  return result;
}

/**
 * @param a
 * @returns diagnoal down left to up right
 */
export function transformSlash(a: Lines): Lines {
  const result: Lines = [];
  const n = a.length;
  for (let i = 0; i < n; i++) {
    const charsy: string[] = []; // i is y descending the side
    const charsx: string[] = []; // i is -x across the bottom
    for (let j = 0; j <= i; j++) {
      charsy.push(a[i - j][j]);
      charsx.push(a[n - 1 - j][n - 1 - i + j]);
    }
    // console.log(charsy, charsx);
    result.push(charsy.join(""));
    if (i + 1 >= n) continue; //don't duplicate the common diag
    result.push(charsx.join(""));
  }
  return result;
}

/**
 * @param a
 * @returns diagnoal up left to down right
 */
export function transformBackslash(a: Lines): Lines {
  const result: Lines = [];
  const n = a.length;
  for (let i = 0; i < n; i++) {
    // switching my referents here to two sides, seems clearer
    const charsy: string[] = []; // i is -y ascending the left side
    const charsx: string[] = []; // i is y descending right side
    for (let j = 0; j <= i; j++) {
      charsy.push(a[n - 1 - j][i - j]);
      charsx.push(a[j][n - 1 - i + j]);
    }
    // console.log(charsy, charsx);
    result.push(charsy.reverse().join("")); // got this one backwards
    if (i + 1 >= n) continue; //don't duplicate the common diag
    result.push(charsx.join(""));
  }
  return result;
}

const findXmas = /XMAS/g;
const findSmax = /SAMX/g;

export function xmasCount(a: string): number {
  let result = 0;
  for (const _ of a.matchAll(findXmas)) {
    result++;
  }
  for (const _ of a.matchAll(findSmax)) {
    result++;
  }
  return result;
}

export function countXmasIn(a: Lines, tx: transformer): number {
  const b = tx(a);
  let result = 0;
  b.forEach((line) => {
    result += xmasCount(line);
  });
  return result;
}

export class Day04 extends Puzzle {
  constructor() {
    super(7, "day_04.txt");
  }

  async load() {
    let lineCount = 0;
    const data: string[] = [];
    let len = -1;
    for await (const line of fileLines(this.dataFilePath)) {
      if (len < 0) {
        len = line.length;
        console.debug("line length = ", len);
      } else assert(line.length === len, "lengths should match");
      data.push(line);
      lineCount++;
    }
    assert(len === lineCount, "matrix should be square");
    return { data, lineCount };
  }

  override async solve(): Promise<void> {
    const { lineCount, data } = await this.load();
    const horizontal = countXmasIn(data, transformHorizontal);
    const vertical = countXmasIn(data, transformVertical);
    const diagSlash = countXmasIn(data, transformSlash);
    const diagBackslash = countXmasIn(data, transformBackslash);
    const totalXmas = horizontal + vertical + diagBackslash + diagSlash;
    const totalMaxX = countCrossedMAS(data);

    console.log({
      day: 4,
      lineCount,
      totalMaxX,
      totalXmas,
      horizontal,
      vertical,
      diagSlash,
      diagBackslash,
    });
  }
}
