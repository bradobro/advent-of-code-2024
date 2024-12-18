import { assertEquals } from "@std/assert";
import { fileLines } from "./lib.ts";
import { Puzzle, Results } from "./Puzzle.ts";
import { parseTerrain } from "./day_14_model.ts";
import { moveAll } from "./day_14_model.ts";
import { quadrantCounts } from "./day_14_model.ts";

export class Day14 extends Puzzle<Results> {
  constructor() {
    super(14);
  }

  async load() {
    // let lineCount = 0;
    // const lines: string[] = [];
    // for await (const line of fileLines(this.dataFilePath)) {
    //   lines.push(line);
    //   lineCount++;
    // }
    // assertEquals(lineCount, lines.length);
    // return { lines, lineCount };
    const src = await Deno.readTextFile(this.dataFilePath);
    return parseTerrain(101, 103, src);
  }

  async solve1() {
    const bhq0 = await this.load();
    const bhq100 = moveAll(100, bhq0);
    const [qa0, qa1, qa2, qa3] = quadrantCounts(bhq100.size, bhq100.movers);
    const sfA = qa0 * qa1 * qa2 * qa3;
    if (sfA >= 241935778) console.debug("Answer too high");
    else console.debug("haven't seen that answer before");
    return { qa0, qa1, qa2, qa3, sfA };
  }

  async solve2() {
    let bhq = await this.load();
    for(let second = 0; second < 500; second++){
      if (christmasTree(bhq)) return {secondsB: second}
      bhq = moveAll(1, bhq)
    }
    return { dummy: 0 };
  }

  override async solve(): Promise<Results> {
    const which = ;
    const _results1 = which & 1 ? await this.solve1() : { puz1Skip: 1 };
    const _results2 = which & 2 ? await this.solve2() : { puz2Skip: 1 };
    console.debug({ _results1, _results2 });
    const results = { ..._results1 };
    return { day: this.dayNumber, hash: await this.hash(results), results };
  }
}
