export class Puzzle {
  readonly dataDir = import.meta.resolve("../data");

  constructor(readonly puzzleNumber: number) {
    console.log(`DataDir: ${this.dataDir}`);
  }
}
