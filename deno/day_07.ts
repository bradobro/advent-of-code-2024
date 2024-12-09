import {
  assertEquals,
  assertGreater,
  assertGreaterOrEqual,
  assertLess,
} from "@std/assert";
import { fileLines } from "./lib.ts";
import { Puzzle, Results } from "./Puzzle.ts";

/**
 * @param count how many you want
 * @param choices the possible things to chose from
 * @param combo ord of the combination a number from 0...choices.length**count
 */
export function combination<T>(
  count: number,
  choices: T[],
  combo: number,
): T[] {
  const result: T[] = []; // Least significant first (like LSB)

  const base = choices.length;
  const maxI = base ** count;
  assertGreaterOrEqual(combo, 0, `instance must be 0..${maxI}`);
  assertLess(combo, maxI, `instance must be 0..${maxI}`);

  // strip off choices using the convert-to-base algorithm
  // formatInt might be faster
  let rest = combo;
  for (let i = 0; i < count; i++) {
    const digit = rest % base;
    result.push(choices[digit]);
    rest = (rest / base) | 0; // bitwise integer division https://www.basedash.com/blog/how-to-do-integer-division-in-javascript
  }

  return result;
}

export type IntOp = (a: number, b: number) => number;

export class Row {
  constructor(public answer: number, public factors: number[]) {}

  static parseString(trimmed: string): Row {
    const colonSplit = trimmed.split(":");
    assertEquals(
      colonSplit.length,
      2,
      `expecting one colon in the line: ${trimmed}`,
    );
    const answer = parseInt(colonSplit[0]);
    const factors = colonSplit[1].trim().split(/ +/).map((s) => parseInt(s));
    const result = new Row(answer, factors);
    return result;
  }
}

export class Day07 extends Puzzle<Results> {
  constructor() {
    super(7);
  }

  async load() {
    let lineCount = 0;
    const rows: Row[] = [];
    for await (const line of fileLines(this.dataFilePath)) {
      const trimmed = line.trim();
      if (trimmed === "") continue; // skip blank lines
      rows.push(Row.parseString(line));
      lineCount++;
    }
    assertEquals(lineCount, rows.length);
    return { rows, lineCount };
  }

  override async solve(): Promise<Results> {
    const { lineCount, rows } = await this.load();
    const results = { lineCount, lines: rows.length };
    console.debug(rows.slice(0, 5));
    return { day: this.dayNumber, hash: await this.hash(results), results };
  }
}
