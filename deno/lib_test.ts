import { describe, it } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { beforeMeAfter } from "./lib.ts";

describe("list split iterator", () => {
  const a = [0, 1, 2, 3, 4, 5];
  const b = Array.from(beforeMeAfter(a));
  // console.debug(a, b);
  expect(b).toEqual([
    [[], 0, [1, 2, 3, 4, 5]],
    [[0], 1, [2, 3, 4, 5]],
    [[0, 1], 2, [3, 4, 5]],
    [[0, 1, 2], 3, [4, 5]],
    [[0, 1, 2, 3], 4, [5]],
    [[0, 1, 2, 3, 4], 5, []],
  ]);
});
