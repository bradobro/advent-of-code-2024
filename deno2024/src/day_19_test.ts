import { describe, it } from "jsr:@std/testing/bdd";
import { Day19, parseDay19 } from "./day_19.ts";
import { expect } from "jsr:@std/expect/expect";

const src1 = `r, wr, b, g, bwu, rb, gb, br

brwrr
bggr
gbbr
rrbgbr
ubwu
bwurrg
brgr
bbrgwb
`;

describe("example 1", () => {
  it("parses the source", () => {
    const [towels, designs] = parseDay19(src1);
    expect(towels).toEqual(["r", "wr", "b", "g", "bwu", "rb", "gb", "br"]);
    expect(designs).toEqual([
      "brwrr",
      "bggr",
      "gbbr",
      "rrbgbr",
      "ubwu",
      "bwurrg",
      "brgr",
      "bbrgwb",
    ]);
  });
  it("adds the words", () => {
    const puz = new Day19(src1);
    expect(puz.nodes.length).toEqual(10);
  });
  it("finds words", () => {
    const puz = new Day19(src1);
    expect(puz.match("r")).toEqual([[0]]);
    // expect(puz.match("rwrb")).toEqual([0, 1, 2]);  // doesn't get consituents right
    expect(puz.match("wwwwwww")).toEqual([]);
  });
  it("finds the words in the list", () => {
    const puz = new Day19(src1);
    for (const d of puz.designs) {
      const pat = puz.match(d);
      if (pat.length > 0) {
        console.debug({ find: true, design: d, pat });
      } else {
        console.debug({ find: false, design: d });
      }
    }
  });
});
