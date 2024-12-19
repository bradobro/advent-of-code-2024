import { assertEquals } from "@std/assert";
import { fileLines } from "./lib.ts";
import { Puzzle, Results } from "./Puzzle.ts";
import { formatMatrix, iterGrids, parseTerrain } from "./day_14_model.ts";
import { moveAll } from "./day_14_model.ts";
import { quadrantCounts } from "./day_14_model.ts";
import { format } from "@std/path/format";

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
    let bhq0 = await this.load();
    for (const bhq of iterGrids(bhq0, 5000, 1, 25000)) {
      const header = `========== GENERATION ${
        bhq.generation.toString().padStart(6, "0")
      } ==========\n`;
      const grid = formatMatrix(bhq.grid);
      const matches = grid.search("1111111111");
      if (matches > 0) {
        return { generation2: bhq.generation };
      }
    }

    return { unfound: 1 };
  }

  override async solve(): Promise<Results> {
    const which = 3;
    const _results1 = which & 1 ? await this.solve1() : { puz1Skip: 1 };
    const _results2 = which & 2 ? await this.solve2() : { puz2Skip: 1 };
    console.debug({ _results1, _results2 });
    const results = { ..._results1 };
    return { day: this.dayNumber, hash: await this.hash(results), results };
  }
}
