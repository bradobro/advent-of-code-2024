import { describe, it } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { blink, blinks, parse } from "./day_11.ts";

describe("first example", () => {
  it("reproduces the first example", () => {
    // deno-fmt-ignore
    const expected = [
      [ "125", "17" ],
      [ "253000", "1", "7" ],
      [ "253", "0", "2024", "14168" ],
      [ "512072", "1", "20", "24", "28676032" ],
      [ "512", "72", "2024", "2", "0", "2", "4", "2867", "6032" ],
      [ "1036288", "7", "2", "20", "24", "4048", "1", "4048", "8096", "28", "67", "60", "32" ],
      [ "2097446912", "14168", "4048", "2", "0", "2", "4", "40", "48", "2024", "40", "48", "80", "96", "2", "8", "6", "7", "6", "0", "3", "2" ]
    ];
    expect(blink(expected[0])).toEqual(expected[1]);
    expect(blink(expected[1])).toEqual(expected[2]);
    expect(blink(expected[2])).toEqual(expected[3]);
    expect(blink(expected[3])).toEqual(expected[4]);
    expect(blink(expected[4])).toEqual(expected[5]);
    expect(blink(expected[5])).toEqual(expected[6]);
    expect(expected[6].length).toEqual(22);
  });
  it("can handle the GC pressure", () => {
    const bN = blinks(["125", "17"], 10);
    const bNlen = bN.length;
    console.debug({ bNlen });
  });

  // CAN'T HANDLE THE GARBAGE:
  // first example ... reproduces the first example => https://jsr.io/@std/testing/1.0.3/_test_suite.ts:349:15
  // error: RangeError: Invalid array length
  //  gen2.push(parseInt(s1.slice(0, h1)).toString()); // probably can't have leading 0's
  // expect(blinks(expected[0], 55312).length).toEqual(0);
});
