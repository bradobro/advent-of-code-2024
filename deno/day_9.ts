import { assert, assertEquals } from "@std/assert";
import { fileLines } from "./lib.ts";
import { Puzzle, Results } from "./Puzzle.ts";

interface Span {
  id: number; // -1 means free space
  len: number; // skipping 0 length I think
}

type Spans = Span[];

export class Disk {
  readonly nSpans: number; // original number of spans
  readonly size: number; // original sum of span lengths

  constructor(public spans: Spans) {
    this.nSpans = spans.length;
    this.size = spans.reduce((acc, span) => acc + span.len, 0);
  }

  freeSpans(): number {
    return this.spans.reduce((acc, span) => acc + (span.id < 0 ? 1 : 0), 0);
  }

  fileSpans(): number {
    return this.spans.reduce((acc, span) => acc + (span.id < 0 ? 0 : 1), 0);
  }

  firstFreeI(): number {
    const n = this.spans.length;
    for (let i = 0; i < n; i++) {
      if (this.spans[i].id < 0) return i;
    }
    assert(false, "there should always be a first free");
  }

  firstFree(): [number, Span] {
    const n = this.spans.length;
    for (let i = 0; i < n; i++) {
      if (this.spans[i].id < 0) return [i, this.spans[i]];
    }
    assert(false, "there should always be a first free");
  }

  lastFreeI(): number {
    const n = this.spans.length;
    for (let i = n - 1; i >= 0; i--) {
      if (this.spans[i].id < 0) return i;
    }
    assert(false, "there should always be a first free");
  }

  lastFileI() {
    const n = this.spans.length;
    for (let i = n - 1; i >= 0; i--) {
      if (this.spans[i].id >= 0) return i;
    }
    assert(false, "there should always be a first free");
  }

  lastFile(): [number, Span] {
    const n = this.spans.length;
    for (let i = n - 1; i >= 0; i--) {
      if (this.spans[i].id >= 0) return [i, this.spans[i]];
    }
    assert(false, "there should always be a first free");
  }

  *iterBlocks(): Generator<number> {
    for (const span of this.spans) {
      if (span.id < 0) continue; // skip free blocks
      const n = span.len;
      for (let i = 0; i < n; i++) {
        yield span.id;
      }
    }
  }

  checksum() {
    let result = 0;
    let i = 0;
    for (const id of this.iterBlocks()) {
      // i++; // 8240638239285
      result += id * i++; // 8240390321336: postincrement seems correct
      // i++; // 8240390321336
    }
    return result;
  }

  swapSameLengthSpans(
    fileI: number,
    fileSpan: Span,
    freeI: number,
  ) {
    this.spans[freeI].id = fileSpan.id;
    this.spans[fileI].id = -1;
  }

  compactNext(): number {
    const [fromI, fromSpan] = this.lastFile();
    const [toI, toSpan] = this.firstFree();
    if (fromI < toI) return -1; // DONE
    // otherwise, compact
    this.swapSameLengthSpans(fromI, fromSpan, toI);
    return toI;
  }

  compactAll(): void {
    while (this.compactNext() >= 0) { /* */ }
  }

  static async read(path: string): Promise<Disk> {
    const spans: Spans = [];
    let id = 0;
    let isFree = false;
    for await (const line of fileLines(path)) {
      for (const digit of line) {
        const len = parseInt(digit);
        if (isNaN(len)) {
          console.error("skipping non-digit", { digit });
        }
        if (isFree) spans.push({ id: -1, len });
        else {
          spans.push({ id, len });
          id++;
        }
        isFree = !isFree; // digits alternate
      }
    }
    return new Disk(spans);
  }
}

export class Day09 extends Puzzle<Results> {
  constructor() {
    super(9);
  }

  async load() {
    return await Disk.read(this.dataFilePath);
  }

  async solve1() {
    const data = await this.load();
    const { nSpans, size } = data;
    const [lastFileI, lastFile] = data.lastFile();
    const checksumBefore = data.checksum();
    data.compactAll();
    const checksumAfter = data.checksum();
    return {
      nSpans,
      size,
      nFree: data.freeSpans(),
      nFile: data.fileSpans(),
      firstFree: data.firstFreeI(),
      lastFree: data.lastFreeI(),
      lastFile: data.lastFileI(),
      lastFileI,
      lastFileId: lastFile.id,
      checksumBefore,
      checksumAfter,
    };
  }

  override async solve(): Promise<Results> {
    const results1 = await this.solve1();
    const results = { ...results1 };
    return { day: this.dayNumber, hash: await this.hash(results), results };
  }
}
