import { describe, it } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { day13data } from "./day_13_data.ts";
import {
  formatProof,
  optimize2,
  optimize3,
  optimize4,
  Optimizer4,
} from "./day_13_model.ts";
import { assertEquals } from "@std/assert/equals";

const _winnable = [0, 1, 3, 5, 6, 317, 319];
const _unwinnable = [2, 7, 11, 12, 13, 14, 15, 314, 318];
const COSTA = 3;
const COSTB = 1;

describe.skip("look at progression of some puzzles, normal sized", () => {
  const g = day13data[_winnable[0]];
  const s = optimize2(g, COSTA, COSTB);
  // console.debug(s, formatProof(g, s));
  const s2 = optimize3(g, COSTA, COSTB);
  // console.debug(s2);
});

describe("try slope-intercept method of optimize4", () => {
  let i = 0;
  for (const g of day13data) {
    const s2 = optimize2(g, COSTA, COSTB);
    // console.debug(formatProof(g, s2, false));
    const o4 = new Optimizer4(g, COSTA, COSTB);
    // console.debug(o4.format(i));
    const s4 = o4.solve();
    // console.debug("optimizer4 solution", s4);
    assertEquals(
      s4,
      s2,
      `expected both ways of solving to match inn game[${i}]`,
    );
    i++;
  }
});
