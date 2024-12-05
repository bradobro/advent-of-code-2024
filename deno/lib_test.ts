import { describe, it } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { beforeMeAfter, meRest } from "./lib.ts";

describe("list split iterators", () => {
  const a = [0, 1, 2, 3, 4, 5];
  expect(Array.from(beforeMeAfter(a))).toEqual([
    { i: 0, before: [], me: 0, after: [1, 2, 3, 4, 5] },
    { i: 1, before: [0], me: 1, after: [2, 3, 4, 5] },
    { i: 2, before: [0, 1], me: 2, after: [3, 4, 5] },
    { i: 3, before: [0, 1, 2], me: 3, after: [4, 5] },
    { i: 4, before: [0, 1, 2, 3], me: 4, after: [5] },
    { i: 5, before: [0, 1, 2, 3, 4], me: 5, after: [] },
  ]);

  // expect(Array.from(meRest(a))).toEqual([]);
  expect(Array.from(meRest(a))).toEqual([
    { i: 0, me: 0, rest: [1, 2, 3, 4, 5] },
    { i: 1, me: 1, rest: [0, 2, 3, 4, 5] },
    { i: 2, me: 2, rest: [0, 1, 3, 4, 5] },
    { i: 3, me: 3, rest: [0, 1, 2, 4, 5] },
    { i: 4, me: 4, rest: [0, 1, 2, 3, 5] },
    { i: 5, me: 5, rest: [0, 1, 2, 3, 4] },
  ]);
});
