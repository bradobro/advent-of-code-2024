import { join } from "@std/path";
// import { exists } from "@std/fs";

export class Puzzle {
  // readonly dataDir = import.meta.resolve("../data").slice(7);
  readonly dataDir = join(import.meta.dirname || "", "../data");
  readonly puzzleId: string;

  constructor(readonly puzzleNumber: number) {
    console.log(`DataDir: ${this.dataDir}`);
    this.puzzleId = puzzleNumber.toString().padStart(2, "0");
  }

  getDataUrl() {
    return `https://adventofcode.com/2024/day/${this.puzzleNumber}/input`;
  }

  getDataFileName() {
    return join(this.dataDir, `puzzle_${this.puzzleId}.txt`);
  }

  async getRawData(): Promise<string> {
    const fname = this.getDataFileName();
    let data: string;
    try {
      // if (await exists(fname)) {
      data = await Deno.readTextFile(fname);
      // } else {
      //   const rsp = await fetch(this.getDataUrl());
      //   if (rsp.status % 100 !== 2) {
      //     throw new Error(
      //       `error fetching file ${rsp.status} ${rsp.statusText}`,
      //     );
      //   }
      //   data = await rsp.text();
      //   await Deno.writeTextFile(fname, data);
      // }
    } catch (err) {
      console.error("error reading data", this.getDataUrl(), fname, err);
      Deno.exit(1);
    }
    return data;
  }

  solve(): Promise<void> {
    throw new Error("override this");
  }
}
