import { assert } from "@std/assert/assert";
import { Puzzle } from "./Puzzle.ts";

interface Input {
  lista: number[];
  listb: number[];
}

export class Puzzle01 extends Puzzle {
  constructor() {
    super(1);
  }

  async load(): Promise<Input> {
    // console.log(`dataFile = ${this.getDataFileName()}`);
    const result: Input = { lista: [], listb: [] };
    const raw = await this.getRawData();
    for (const line of raw.split("\n")) {
      const line2 = line.trim();
      if (line.length < 1) continue;
      try {
        const parts = line2.split(/\s+/);
        // console.log("parts", parts);
        const a = parseInt(parts[0]);
        const b = parseInt(parts[1]);
        assert(!isNaN(a), `parts[0] should be a number ${parts[0]}`);
        assert(!isNaN(b), `parts[1] should be a number ${parts[1]}`);
        result.lista.push(a);
        result.listb.push(b);
      } catch (err) {
        console.error("error processing line", line, err);
      }
    }
    assert(
      result.lista.length === result.listb.length,
      "data list lengths should match",
    );
    return result;
  }

  sumDiff(inputs: Input): number {
    return inputs.lista.reduce((acc: number, a: number, i: number) =>
      acc + a - inputs.listb[i]
    );
  }

  sumAbsDiff(inputs: Input): number {
    return inputs.lista.reduce((acc: number, a: number, i: number) =>
      acc + Math.abs(a - inputs.listb[i])
    );
  }

  sumHardWay(inputs: Input) {
    const n = inputs.lista.length;
    let sumD = 0;
    let sumA = 0;
    for (let i = 0; i < n; i++) {
      const a = inputs.lista[i];
      const b = inputs.listb[i];
      const diff = a - b;
      const adiff = Math.abs(diff);
      sumD += diff;
      sumA += adiff;
      // console.debug({ a, b, diff, adiff });
    }
    return { sumD, sumA };
  }

  override async solve(): Promise<void> {
    const inputs = await this.load();
    inputs.lista.sort();
    inputs.listb.sort();
    const diff = this.sumDiff(inputs);
    const absDiff = this.sumAbsDiff(inputs);
    console.log({ diff, absDiff, hardDiff: this.sumHardWay(inputs) });
  }
}
