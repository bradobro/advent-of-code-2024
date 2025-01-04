import { describe, it } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { Cpu17, day17js, getInput17a } from "./day_17_model.ts";

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
  it.only("solves part a", () => {
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
  // it("confirms our js port of the program", ()=>{
  //   const output = day17js(64854237);
  //   expect(output).toEqual()
  // })
});
