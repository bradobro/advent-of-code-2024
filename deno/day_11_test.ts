import { describe, it } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import {
  blink,
  blinks,
  parse,
  population1,
  population2,
  population3,
} from "./day_11.ts";

describe("first example", () => {
  // deno-fmt-ignore
  const example1 = [
      [ "125", "17" ],
      [ "253000", "1", "7" ],
      [ "253", "0", "2024", "14168" ],
      [ "512072", "1", "20", "24", "28676032" ],
      [ "512", "72", "2024", "2", "0", "2", "4", "2867", "6032" ],
      [ "1036288", "7", "2", "20", "24", "4048", "1", "4048", "8096", "28", "67", "60", "32" ],
      [ "2097446912", "14168", "4048", "2", "0", "2", "4", "40", "48", "2024", "40", "48", "80", "96", "2", "8", "6", "7", "6", "0", "3", "2" ]
    ];
  const gen0 = example1[0];
  it("reproduces the first example", () => {
    expect(blink(example1[0])).toEqual(example1[1]);
    expect(blink(example1[1])).toEqual(example1[2]);
    expect(blink(example1[2])).toEqual(example1[3]);
    expect(blink(example1[3])).toEqual(example1[4]);
    expect(blink(example1[4])).toEqual(example1[5]);
    expect(blink(example1[5])).toEqual(example1[6]);
    expect(example1[6].length).toEqual(22);
  });
  it("can blink multiple times accurately", () => {
    for (let i = 0; i < example1.length; i++) {
      expect(blinks(gen0, i)).toEqual(example1[i]);
    }
  });
  it("reproduces the counts of the first example", () => {
    for (let i = 0; i < example1.length; i++) {
      expect(population1(gen0, i)).toEqual(example1[i].length);
    }
    expect(population1(gen0, 25)).toEqual(55312);
  });
  it("new algorithm matches old", () => {
    const N = 25;
    for (let i = 10; i < N; i++) {
      expect(population3(gen0, i)).toEqual(population1(gen0, i));
    }
  });
  it.skip("handles 0, 1, 2024 specially", () => {
    const results = new Set<string>();
    let genA: string[] = ["0"];
    for (let i = 0; i < 100; i++) {
      const genB: string[] = [];
      for (const sA of genA) {
        if (results.has(sA)) continue;
        results.add(sA);
        for (const sB of blink([sA])) if (!results.has(sB)) genB.push(sB);
      }
      genA = genB;
    }
    const res: number[] = Array.from(results).map((s) => parseInt(s));
    res.sort();
    console.log({
      uniques: results.size,
      results: res,
    });
  });

  // CAN'T HANDLE THE GARBAGE:
  // first example ... reproduces the first example => https://jsr.io/@std/testing/1.0.3/_test_suite.ts:349:15
  // error: RangeError: Invalid array length
  //  gen2.push(parseInt(s1.slice(0, h1)).toString()); // probably can't have leading 0's
  // expect(blinks(expected[0], 55312).length).toEqual(0);
});
