import { describe, it } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import {
  Cpu17,
  day17code,
  day17js,
  day17Match,
  getInput17a,
  scan17,
} from "./day_17_model.ts";

function example1() {
  return new Cpu17(
    { a: 729, b: 0, c: 0 },
    [0, 1, 5, 4, 3, 0],
  );
}

describe("problem a", () => {
  it("handles example 1", () => {
    const eg = new Cpu17({ a: 0, b: 0, c: 9 }, [2, 6]);
    // eg.trace = true;
    eg.run();
    expect(eg.snapshot().b).toEqual(1);
  });
  it("handles example 2", () => {
    const eg = new Cpu17({ a: 10, b: 0, c: 0 }, [5, 0, 5, 1, 5, 4]);
    // eg.trace = true;
    const output = eg.run();
    expect(output).toEqual([0, 1, 2]);
  });
  it("handles example 3", () => {
    const eg = new Cpu17({ a: 2024, b: 0, c: 0 }, [0, 1, 5, 4, 3, 0]);
    // eg.trace = true;
    const output = eg.run();
    expect(output).toEqual([4, 2, 5, 6, 7, 7, 7, 7, 3, 1, 0]);
    expect(eg.snapshot().a).toEqual(0);
  });
  it("handles example 4", () => {
    const eg = new Cpu17({ a: 0, b: 29, c: 0 }, [1, 7]);
    // eg.trace = true;
    eg.run();
    expect(eg.snapshot().b).toEqual(26);
  });
  it("handles example 5", () => {
    const eg = new Cpu17({ a: 0, b: 2024, c: 43690 }, [4, 0]);
    // eg.trace = true;
    eg.run();
    expect(eg.snapshot().b).toEqual(44354);
  });
  // const out: string[] = [];
  it("handles the big example", () => {
    const eg = example1();
    // eg.trace = true;
    const output = eg.run();
    expect(output).toEqual([4, 6, 3, 5, 6, 3, 5, 2, 1, 0]);
  });
  it("solves part a", () => {
    const eg = getInput17a();
    // eg.trace = true;
    const output = eg.run();
    // check our fast port for part b
    const output2 = day17js(64854237);
    console.debug({ solutionA: output, fastA: output2 });
    expect(output2).toEqual(output);
  });
});

describe("part 2", () => {
  it("demos a copying program", () => {
    const program = [0, 3, 5, 4, 3, 0];
    const eg = new Cpu17({
      a: 117440,
      b: 0,
      c: 0,
    }, program);
    const output = eg.run();
    expect(output).toEqual(program);
  });
  it("checks matching output from actual code", () => {
    const expected = [4, 7, 4, 5, 2, 0, 0, 7];
    const a = 6543216;
    const output = day17js(a);
    expect(output).toEqual(expected);
    expect(day17Match(a, expected)).toEqual(0);
    for (let i = 0; i < expected.length; i++) {
      const sample = [...expected];
      sample[i] = -1000;
      const missing = day17Match(a, sample);
      // console.debug(i, missing, sample);
      expect(missing).toEqual(i - expected.length);
    }
    // console.debug(output);
  });
  it("examines partial solutions for part b", () => {
    const partials = [
      // [35184372088846, -14],
      // [35184372089164, -13],
      // [35184372119989, -12],
      // [35184373168565, -11],
      // [35184375066301, -10],
      // [35184379260605, -9],
      // [35184396037821, -7],
      [0, -16],
      [6, -15],
      [14, -14],
      [332, -13],
      [31157, -12],
      [1079733, -11],
      [2977469, -10],
      [7171773, -9],
      [23948989, -7],
      [560819901, -6],
    ];
    for (const [a, missing] of partials) {
      console.debug(
        `[0o${a.toString(8)}, 0b${a.toString(2)}, 0x${
          a.toString(16)
        },  ${missing}]`,
      );
    }
  });
  it.skip("solves part b", async () => {
    // console.debug(day17js(560819901)); // gets 10 of 16
    console.debug(day17js(0b100001011011010110111010111101)); // gets 10 of 16
    // console.debug(day17js(0b100101010110100100100001011011010110111010111101)); // appends on naive solution
    // console.debug(day17js(0b111111000101011100001011011010110111010111101)); // gets 10 of 16

    return;
    const eg = getInput17a();
    const expected = [...eg.program].slice(10);
    const n = expected.length;
    // const minA = 2 ** ((n - 1) * 3);
    // const minA = 35184372088838 + 1; // too low
    const minA = 0;
    // console.debug(day17js(minA), expected);
    const answer = await scan17(minA, 2 ** 64, expected);
    // greater than 35184372088838);
    const output = day17js(answer);
    console.debug({ output, expected });
  });

  it.only("hacks from the back", async () => {
    const expected = [...day17code];
    // much beyond this and we get negative
    const answers = [0o4, 0o5, 2, 6, 4, 4, 6, 0, 7];
    const sample = expected.slice(expected.length - 1 - answers.length);
    const start = answers.reduce((acc, a) => (acc << 3) + a, 0) << 3;
    const answer = await scan17(start, start + 1024, sample);
    const output = day17js(answer);
    console.debug({
      expected,
      sample,
      start: start.toString(8),
      answer: answer.toString(8),
      output,
    });
  });
});
