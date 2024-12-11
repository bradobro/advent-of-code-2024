import { assertEquals } from "@std/assert";
import { fileLines } from "./lib.ts";
import { Puzzle, Results } from "./Puzzle.ts";
import { getAssertionState } from "jsr:@std/internal@^1.0.5/assertion-state";

const PUZZLE_DATA = "3 386358 86195 85 1267 3752457 0 741";

type Stones = string[];

export function parse(s: string): Stones {
  return s.split(/\s+/);
}

export function blink(gen1: Stones): Stones {
  const gen2: Stones = [];
  for (const s1 of gen1) {
    const len1 = s1.length;
    if (s1 === "0") gen2.push("1");
    else if (len1 % 2 === 0) {
      const h1 = len1 / 2;
      gen2.push(parseInt(s1.slice(0, h1)).toString()); // probably can't have leading 0's
      gen2.push(parseInt(s1.slice(h1)).toString()); // trim leading 0's
    } else {
      gen2.push((parseInt(s1) * 2024).toString());
    }
  }
  return gen2;
}

export function blinks(gen1: Stones, n: number): Stones {
  let result: Stones = gen1.slice(0);
  for (let i = 0; i < n; i++) result = blink(result);
  return result;
}

export class Day11 extends Puzzle<Results> {
  constructor() {
    super(11);
  }

  load() {
    return Promise.resolve(parse(PUZZLE_DATA));
  }

  override async solve(): Promise<Results> {
    const _data = await this.load();
    console.debug(_data);
    const results = {};
    return { day: this.dayNumber, hash: await this.hash(results), results };
  }
}
