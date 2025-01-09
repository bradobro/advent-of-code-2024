import { describe, it } from "jsr:@std/testing/bdd";
import { Day19a1, Onsen19, parseDay19 } from "./day_19.ts";
import { expect } from "jsr:@std/expect/expect";
import { assertThrows } from "@std/assert/throws";
import { assert } from "@std/assert/assert";

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

describe.skip("example 1 with deprecated approach Day19a1", () => {
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
    const puz = new Day19a1(src1);
    expect(puz.nodes.length).toEqual(10);
  });
  it("finds words", () => {
    const puz = new Day19a1(src1);
    expect(puz.match("r")).toEqual([[0]]);
    // expect(puz.match("rwrb")).toEqual([0, 1, 2]);  // doesn't get consituents right
    expect(puz.match("wwwwwww")).toEqual([]);
  });
  it("finds the words in the list", () => {
    const puz = new Day19a1(src1);
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

describe("example 1 with Onsen19", () => {
  it("parses and validates the input", () => {
    const puz = Onsen19.parse(src1, false);
    expect(puz.alphabet.length).toEqual(5);
    expect(puz.towels.length).toEqual(8);
    expect(puz.designs.length).toEqual(8);
    expect(puz.nodes.length).toEqual(1);
    expect(puz.nodes[0]).toEqual(puz.trie);
    expect(puz.trie.z).toBeFalsy();
    expect(puz.trie.k).toEqual([null, null, null, null, null]);
  });
  it("adds a single single-char word and finds it", () => {
    const puz = Onsen19.parse(src1, false);
    puz.addWord("r");
    // make sure the trie head looks right
    expect(puz.nodes.length).toEqual(2); // we've added a node
    expect(puz.trie).toEqual(puz.nodes[0]); // trie head remains constant
    expect(puz.trie.z).toBeFalsy(); // trie head can't be terminal
    expect(puz.trie.k).toEqual([puz.nodes[1], null, null, null, null]); // the "r" node is filled

    // make sure the child node looks right
    const r = puz.trie.k[0];
    expect(r).toEqual(puz.nodes[1]);
    expect(r).not.toBe(null);

    // test the finding
    expect(puz.matchWord("r")).toBeTruthy();
    expect(puz.matchWord("rr")).toBeFalsy();
    expect(puz.matchWord("u")).toBeFalsy();
    expect(puz.matchWord("")).toBeFalsy();
    assertThrows(() => puz.matchWord("q"), "illegal alphabet should throw");
  });
  it("adds a single 2-letter word and finds it", () => {
    const puz = Onsen19.parse(src1, false);
    puz.addWord("rw");
    expect(puz.matchWord("rw")).toBeTruthy(); // finds the whole word
    expect(puz.matchWord("r")).toBeFalsy(); // but not just the first letter
    expect(puz.matchWord("w")).toBeFalsy(); // nor just the last
    expect(puz.matchWord("rrw")).toBeFalsy(); // nor a superset
  });
  it("adds a few simple words and finds them all", () => {
    const words = ["r", "rw", "wwr", "rrww"];
    const fakes = ["w", "wr", "rrw", "rrwww", "ww", "rr"];
    const puz = Onsen19.parse(src1, false);
    words.forEach((w) => puz.addWord(w));
    words.forEach((w) => expect(puz.matchWord(w)).toBeTruthy());
    fakes.forEach((w) => expect(puz.matchWord(w)).toBeFalsy());
  });
});
