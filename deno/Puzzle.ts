import { join } from "@std/path";
// import { exists } from "@std/fs";

export class Puzzle {
  // readonly dataDir = import.meta.resolve("../data").slice(7);
  readonly dataDir = join(import.meta.dirname || "", "../data");
  readonly puzzleId: string;
  readonly dataFilePath: string;

  constructor(readonly puzzleNumber: number, dataFileName = "") {
    console.log(`DataDir: ${this.dataDir}`);
    this.puzzleId = puzzleNumber.toString().padStart(2, "0");
    this.dataFilePath = dataFileName
      ? join(this.dataDir, dataFileName)
      : join(this.dataDir, `puzzle_${this.puzzleId}.txt`);
  }

  getDataFileName() {
    return this.dataFilePath;
  }

  async getRawData(): Promise<string> {
    const fname = this.getDataFileName();
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

  solve(): Promise<void> {
    throw new Error("override this");
  }
}
