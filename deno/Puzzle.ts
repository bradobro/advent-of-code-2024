import { join } from "@std/path";
import { crypto } from "jsr:@std/crypto";
import { encodeHex } from "jsr:@std/encoding/hex";

export interface Results {
  day: number;
  hash: string;
  results: {
    [k: string]: number;
  };
}

export class Puzzle<T> {
  // readonly dataDir = import.meta.resolve("../data").slice(7);
  readonly dataDir = join(import.meta.dirname || "", "../data");
  readonly dayId: string;
  readonly dataFilePath: string;

  constructor(readonly dayNumber: number, dataFileName = "") {
    // console.log(`DataDir: ${this.dataDir}`);
    this.dayId = dayNumber.toString().padStart(2, "0");
    this.dataFilePath = dataFileName
      ? join(this.dataDir, dataFileName)
      : join(this.dataDir, `day_${this.dayId}.txt`);
  }

  async getRawData(): Promise<string> {
    const fname = this.dataFilePath;
    let data: string;
    try {
      // if (await exists(fname)) {
      data = await Deno.readTextFile(fname);
    } catch (err) {
      console.error("error reading data", fname, err);
      Deno.exit(1);
    }
    return data;
  }

  /**
   * This is used in my tests to prevent regressions without committing answers
   * @param r
   * @returns
   */
  async hash(r: object) {
    const buffer = new TextEncoder().encode(JSON.stringify(r));
    const hash = await crypto.subtle.digest("SHA-256", buffer);
    return encodeHex(hash);
  }

  solve(): Promise<T> {
    throw new Error("override this");
  }
}
