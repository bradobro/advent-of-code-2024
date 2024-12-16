import { assertEquals, assertGreaterOrEqual } from "@std/assert";
import { combination, fileLines } from "./lib.ts";
import { Puzzle, Results } from "./Puzzle.ts";

export type IntOp = (a: number, b: number) => number;

export type OpSet = IntOp[];

export type OpCombo = IntOp[];

export type Factors = number[];

export function applyOps(factors: Factors, ops: OpCombo): number {
  // assertGreaterOrEqual(factors.length, 2, `expecting at least two factors`);
  // assertEquals(
  //   factors.length - 1,
  //   ops.length,
  //   `expecting one fewer ops than factors`,
  // );
  return factors.reduce((acc: number, b: number, i: number) => {
    // console.log({ i });
    // return acc + b;
    return ops[i - 1](acc, b); // reduce without initial runs 1..n-1
  });
}

export function* iterOpCombosOn(
  factors: Factors,
  ops: OpSet,
): Generator<[number, OpCombo]> {
  // assertGreaterOrEqual(factors.length, 2, `expecting at least two factors`);
  const nOps = factors.length - 1;
  const nCombos = ops.length ** nOps;
  for (let i = 0; i < nCombos; i++) {
    const combo = combination(nOps, ops, i);
    yield [applyOps(factors, combo), combo];
  }
}

export class Row {
  constructor(public answer: number, public factors: number[]) {}

  static parseString(trimmed: string): Row {
    const colonSplit = trimmed.split(":");
    assertEquals(
      colonSplit.length,
      2,
      `expecting one colon in the line: ${trimmed}`,
    );
    const answer = parseInt(colonSplit[0]);
    const factors = colonSplit[1].trim().split(/ +/).map((s) => parseInt(s));
    const result = new Row(answer, factors);
    return result;
  }

  formatWithOps(ops: OpCombo): string {
    return this.factors.reduce((acc, n, i) => {
      // return acc + n.toString() + ` ${i} `;
      if (i < ops.length) {
        return acc + n.toString() + ` ${ops[i].name} `;
      }
      return acc + n.toString() + ";";
    }, `${this.answer.toString()} = `);
  }

  satisfiable(ops: OpSet, print = false): boolean {
    for (const [r, combo] of iterOpCombosOn(this.factors, ops)) {
      if (r === this.answer) {
        if (print) {
          console.log(this.formatWithOps(combo));
        }
        return true;
      }
    }
    return false;
  }
}

const add = (a: number, b: number) => a + b;
const mul = (a: number, b: number) => a * b;
const cat = (a: number, b: number) => parseInt(a.toString() + b.toString());

function solution1(rows: Row[], print = false) {
  let satisfiable = 0;
  let satisfiableSum = 0;
  for (const row of rows) {
    if (row.satisfiable([add, mul], print)) {
      satisfiable++;
      satisfiableSum += row.answer;
    }
  }
  return { satisfiable, satisfiableSum };
}

function solution2(rows: Row[], print = false) {
  let satisfiable = 0;
  let satisfiableSum = 0;
  for (const row of rows) {
    if (row.satisfiable([add, mul, cat], print)) {
      satisfiable++;
      satisfiableSum += row.answer;
    }
  }
  return { satisfiable, satisfiableSum };
}

export class Day07 extends Puzzle<Results> {
  constructor() {
    super(7);
  }

  async load() {
    let lineCount = 0;
    const rows: Row[] = [];
    for await (const line of fileLines(this.dataFilePath)) {
      const trimmed = line.trim();
      if (trimmed === "") continue; // skip blank lines
      rows.push(Row.parseString(line));
      lineCount++;
    }
    assertEquals(lineCount, rows.length);
    return { rows, lineCount };
  }

  override async solve(): Promise<Results> {
    const { lineCount, rows } = await this.load();
    // console.debug("add", Object.getOwnPropertyNames(add), add.length, add.name);
    const { satisfiable: count1, satisfiableSum: answer1 } = solution1(
      rows,
      false,
    );
    const { satisfiable: count2, satisfiableSum: answer2 } = solution2(
      rows,
      false,
    );
    const results = {
      lineCount,
      lines: rows.length,
      count1,
      answer1,
      count2,
      answer2,
    };
    // console.debug(rows.slice(0, 5));
    return { day: this.dayNumber, hash: await this.hash(results), results };
  }
}
