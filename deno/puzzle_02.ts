import { assert } from "@std/assert/assert";
import { Puzzle } from "./Puzzle.ts";

interface Input {
  lista: number[];
  freqb: { [k: number]: number };
}

export class Puzzle02 extends Puzzle {
  constructor() {
    super(2);
  }

  async load(): Promise<Input> {
    // console.log(`dataFile = ${this.getDataFileName()}`);
    const result: Input = { lista: [], freqb: {} };
    const raw = await this.getRawData();
    for (const line of raw.split("\n")) {
      const line2 = line.trim();
      if (line.length < 1) continue;
      try {
        const parts = line2.split(/\s+/);
        // console.log("parts", parts);
        const a = parseInt(parts[0]);
        const b = parseInt(parts[1]);
        if (b in result.freqb) {
          result.freqb[b] = result.freqb[b] + 1;
        } else {
          result.freqb[b] = 1;
        }
        assert(!isNaN(a), `parts[0] should be a number ${parts[0]}`);
        assert(!isNaN(b), `parts[1] should be a number ${parts[1]}`);
        result.lista.push(a);
      } catch (err) {
        console.error("error processing line", line, err);
      }
    }
    // console.log(result.lista.length);
    // console.log(Object.entries(result.freqb));
    return result;
  }

  simularity(inputs: Input) {
    const n = inputs.lista.length;
    let simularity = 0;
    for (let i = 0; i < n; i++) {
      const a = inputs.lista[i];
      const freq = inputs.freqb[a] || 0;
      const s = a * freq;
      // const adiff = Math.abs(diff);
      // console.log({ a, freq, s });
      simularity += s;
    }
    return simularity;
  }

  override async solve(): Promise<void> {
    const inputs = await this.load();
    console.log(this.simularity(inputs));
  }
}
