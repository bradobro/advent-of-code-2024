import { describe, it } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { applyOps, combination, IntOp, iterOpCombosOn, Row } from "./day_07.ts";
import { assertThrows } from "@std/assert/throws";

const raw1 = [
  "25056746772: 4 47 136 21 79 49",
  "3790126111: 371 8 10 125 325 788",
  "37542888: 3 977 944 5",
  "785818128: 1 8 5 9 4 73 5 7 860 7",
  "19035366: 37 41 1 42 555 9 366",
];

const data1 = [
  new Row(25056746772, [4, 47, 136, 21, 79, 49]),
  new Row(3790126111, [371, 8, 10, 125, 325, 788]),
  new Row(37542888, [3, 977, 944, 5]),
  new Row(785818128, [1, 8, 5, 9, 4, 73, 5, 7, 860, 7]),
  new Row(19035366, [37, 41, 1, 42, 555, 9, 366]),
];

describe("Row object", () => {
  it("parses row strings", () => {
    const parsed1 = raw1.map(Row.parseString);
    expect(parsed1).toEqual(data1);
  });
});

describe(" combiner", () => {
  it("produces combinations aligned with combo id", () => {
    const choices = ["0", "1"];
    // 1 digit
    expect(combination(1, choices, 0).join("")).toEqual("0");
    expect(combination(1, choices, 1).join("")).toEqual("1");

    // 2 digits
    expect(combination(2, choices, 0).join("")).toEqual("00");
    expect(combination(2, choices, 1).join("")).toEqual("10");
    expect(combination(2, choices, 2).join("")).toEqual("01");
    expect(combination(2, choices, 3).join("")).toEqual("11");
    assertThrows(() => combination(2, choices, 4).join(""));
    assertThrows(() => combination(2, choices, -1).join(""));

    // 10 digits spot check
    expect(combination(10, choices, 0).join("")).toEqual("0000000000");
    expect(combination(10, choices, 1).join("")).toEqual("1000000000");
    expect(combination(10, choices, 2).join("")).toEqual("0100000000");
    expect(combination(10, choices, 3).join("")).toEqual("1100000000");

    expect(combination(10, choices, 1023).join("")).toEqual("1111111111");
    expect(combination(10, choices, 1022).join("")).toEqual("0111111111");
    expect(combination(10, choices, 512).join("")).toEqual("0000000001");
    expect(combination(10, choices, 511).join("")).toEqual("1111111110");
    // NOTICE the relationship to binary numbers is reverse: significance
    // increases (left to right) not right to left
    // to align with our visualization of array indies from left to right
    expect(combination(10, choices, 0b1111100000).join("")).toEqual(
      "0000011111",
    );
    expect(combination(10, choices, 0b0110110110).join("")).toEqual(
      "0110110110",
    );
    expect(combination(10, choices, 3).join("")).toEqual("1100000000");
    expect(combination(10, choices, 3).join("")).toEqual("1100000000");
    assertThrows(() => combination(10, choices, 1024));
    assertThrows(() => combination(10, choices, -1));
  });
});

describe("combining functions and applying", () => {
  const add = (a: number, b: number) => a + b;
  const mul = (a: number, b: number) => a * b;
  const choices: IntOp[] = [add, mul];
  it("works with any kind of choice (a.k.a. 'digit')", () => {
    expect(combination(2, choices, 0)).toEqual([add, add]);
    expect(combination(2, choices, 1)).toEqual([mul, add]);
    expect(combination(2, choices, 2)).toEqual([add, mul]);
    expect(combination(2, choices, 3)).toEqual([mul, mul]);
  });

  it("we can apply those combinations to reduce an array", () => {
    const factors = [1, 2, 3];
    expect(applyOps(factors, [add, add])).toEqual(6);
    expect(applyOps(factors, combination(2, choices, 0))).toEqual(6);
    expect(applyOps(factors, combination(2, choices, 1))).toEqual(5);
    expect(applyOps(factors, combination(2, choices, 2))).toEqual(9);
    expect(applyOps(factors, combination(2, choices, 3))).toEqual(6);

    expect(Array.from(iterOpCombosOn(factors, choices))).toEqual([6, 5, 9, 6]);
  });
});
