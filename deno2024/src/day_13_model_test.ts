import { describe, it } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { day13data } from "./day_13_data.ts";
import { formatProof, optimize2, optimize3 } from "./day_13_model.ts";

const _winnable = [0, 1, 3, 5, 6, 317, 319];
const _unwinnable = [2, 7, 11, 12, 13, 14, 15, 314, 318];
const COSTA = 3;
const COSTB = 1;

describe("look at progression of some puzzles, normal sized", () => {
  const g = day13data[_winnable[0]];
  const s = optimize2(g, COSTA, COSTB);
  console.debug(s, formatProof(g, s));
  const s2 = optimize3(g, COSTA, COSTB);
  console.debug(s2);
});
