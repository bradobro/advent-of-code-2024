import { assert } from "@std/assert/assert";
import { Puzzle } from "./Puzzle.ts";
import { TextLineStream } from "@std/streams";

type Report = number[];

interface Results {
  total: number;
  safe: number;
  dampable: number;
  safish: number;
}

function parseReport(line: string): Report {
  const numberStrings = line.trim().split(/\s+/);
  // I don't see why parseInt mapped doesn't work, but it throws NaN's unless you
  // wrap it
  // console.log(numberStrings, numberStrings.map(parseInt));
  // return line.trim().split(/\s+/).map(parseInt);
  return numberStrings.map((s) => parseInt(s));
}

async function* fileLines(path: string) {
  const file = await Deno.open(path, { read: true });
  const lines = file
    .readable
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(new TextLineStream());
  for await (const line of lines) yield line;
}

export class Day02a extends Puzzle {
  constructor() {
    super(3, "day_02.txt");
  }

  safe(rpt: Report): boolean {
    if (rpt.length < 2) throw new Error("single length report unexpected");
    const direction = rpt[0] < rpt[1] ? 1 : -1; // -1 means descending
    for (let i = 1; i < rpt.length; i++) {
      const diff = direction * (rpt[i] - rpt[i - 1]);
      if (diff < 1 || diff > 3) return false;
    }
    return true;
  }

  dampable(rpt: Report): boolean {
    const n = rpt.length;
    const t = rpt.reduce((a, b) => a + b);
    const short = n - 1;
    for (let i = 0; i < n; i++) {
      const omitI = rpt.slice(0, i).concat(rpt.slice(i + 1));
      assert(omitI.length === short, "expecting length n-1");
      assert(
        omitI.reduce((a, b) => a + b) + rpt[i] === t,
        "totals should match",
      );
      if (this.safe(omitI)) return true;
    }
    return false;
  }

  async load(): Promise<Results> {
    const result: Results = { total: 0, safe: 0, dampable: 0, safish: 0 };
    for await (const line of fileLines(this.dataFilePath)) {
      const rpt = parseReport(line);
      result.total += 1;
      if (this.safe(rpt)) {
        result.safe += 1;
        console.log("safe", rpt);
      } else if (this.dampable(rpt)) {
        result.dampable += 1;
      } else {
        console.log("unsafe", rpt);
      }
    }
    result.safish = result.safe + result.dampable;
    return result;
  }

  override async solve() {
    const results = await this.load();
    console.log({ results });
  }
}
