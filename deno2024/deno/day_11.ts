import { assertEquals } from "@std/assert";
import { fileLines } from "./lib.ts";
import { Puzzle, Results } from "./Puzzle.ts";
import { getAssertionState } from "jsr:@std/internal@^1.0.5/assertion-state";
import { iterOpCombosOn } from "./day_07.ts";

const PUZZLE_DATA = "3 386358 86195 85 1267 3752457 0 741";

type Stones = string[];
type Nones = number[];

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

export function blinksNumeric(item: number, n: number): number[] {
  return blinks([item.toString()], n).map((s) => parseInt(s));
}

/**
 * blinks instantiates the array, which can't handle huge combinatorial explosion
 *
 * Might be able to reduce GC pressure by statically allocating only 2 arrays and pin-ponging,
 * but JS doesn't excel at that
 *
 * See population() for one solution
 * @param gen1
 * @param n
 * @returns
 */
export function blinks(gen1: Stones, n: number): Stones {
  let result: Stones = gen1.slice(0);
  for (let i = 0; i < n; i++) result = blink(result);
  return result;
}

const MAX_BLINKS = 25; // higher numbers increase GC but decrease recursion depth

interface CashedBlink {
  pop: number;
  items: number[];
}

const MaxBlinksCache: Record<number, CashedBlink> = {};
let CacheSize = 0;

function maxBlinks1(item: number): number[] {
  const c = MaxBlinksCache[item];
  if (c !== undefined) return c.items;
  // const stones = blinks([item.toString()]);
  const items = blinksNumeric(item, MAX_BLINKS);
  const pop = items.length;
  MaxBlinksCache[item] = { pop, items };
  CacheSize++;
  // console.debug("added cache", { CacheSize, item });
  return items;
}

/**
 * Avoid RAM requirements of instantiating all the stones by subdividing the list
 * as necessary;
 * @param gen1
 * @param generations
 * @returns
 */
export function population1(genA: Stones, generations: number): number {
  let result = 0;
  const remainingGenerations = generations - MAX_BLINKS;
  // console.debug({ generations });
  for (const stoneA of genA) {
    // if it's small enough, sum the links of generations for each member;
    if (generations <= MAX_BLINKS) {
      // console.debug({ stoneA });
      result += blinks([stoneA], generations).length;
      continue;
    }

    // otherwise, divide the list
    const genB = blinks([stoneA], MAX_BLINKS);
    // console.debug({ remainingGenerations, genB });
    for (const stoneB of genB) {
      result += population1([stoneB], remainingGenerations);
    }
  }
  return result;
}

export function pop3N(stoneA: number, n: number): number {
  if (n === 0) {
    // console.debug("hit solo");
    return 1;
  }
  if (n < MAX_BLINKS) {
    // console.debug(`hit submax ${n}`);
    return blinks([stoneA.toString()], n).length;
  }
  if (n === MAX_BLINKS) {
    // console.debug(`hit max ${n}`);
    return maxBlinks1(stoneA).length;
  }
  // if (n > 10 && n % 5 == 0) {console.debug(`hit depth mark ${n}`);

  let result = 0;
  const genB = maxBlinks1(stoneA);
  for (const stoneB of genB) {
    result += pop3N(stoneB, n - MAX_BLINKS);
  }

  return result;
}

export function population3(stones: Stones, n: number): number {
  let result = 0;
  // const result = stones.reduce((acc, s) => acc + pop3N(parseInt(s), n), 0);
  // const cacheKeys = Object.keys(MaxBlinksCache);
  // const keyCount = cacheKeys.length;
  // cacheKeys.sort();
  // console.debug({ cacheKeys, keyCount });
  for (const s of stones) {
    const stone = parseInt(s);
    // console.debug("starting", stone);
    const count = pop3N(stone, n);
    // console.debug("completed", { stone, count });
    result += count;
  }
  return result;
}

// first return is 0 if not splittable
export function splitEvenDigits(n: number): [number, number] {
  const s = n.toString();
  const length = s.length;
  if (length % 2 === 1) return [0, n];
  const h = length / 2;
  return [parseInt(s.slice(0, h)), parseInt(s.slice(h))];
}

// population of one item after 1 generation
function pop1(item: number): number {
  if (item === 0) return 1;
  const [a, b] = splitEvenDigits(item);
  if (a !== 0) return 2;
  return 1;
}

export function popN(item: number, n: number): number {
  if (n === 0) return 1;
  if (n === 1) return pop1(item);
  if (item === 0) return popN(1, n - 1);
  const [a, b] = splitEvenDigits(item);
  if (a === 0) return popN(item * 2024, n - 1);
  return popN(a, n - 1) + popN(b, n - 1);
}

export function population2(stones: Stones, n: number): number {
  return stones.reduce((acc, s) => acc + popN(parseInt(s), n), 0);
}

export class Day11 extends Puzzle<Results> {
  constructor() {
    super(11);
  }

  load() {
    return Promise.resolve(parse(PUZZLE_DATA));
  }

  async solve1() {
    const gen0 = await this.load();
    const pop1 = population3(gen0, 25);
    return { pop1 };
  }
  async solve2() {
    const data = await this.load();
    // takes a few minutes, see how commented out console.debug() in population3()
    // allows some progress monitoring
    // could optimize more...there are probably a lot of dups at the 50 level
    const sum3 = population3(data, 75);
    return { pop2: sum3 };
  }

  override async solve(): Promise<Results> {
    const results1 = await this.solve1();
    // omit slow results in regression tests
    // const results2 = await this.solve2();
    // const results = { ...results1, ...results2 };
    const results = { ...results1 };
    return { day: this.dayNumber, hash: await this.hash(results), results };
  }
}
