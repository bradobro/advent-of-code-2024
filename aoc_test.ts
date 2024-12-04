import { Day02 } from "./deno/day_02.ts";
import { Day03 } from "./deno/day_03.ts";
import { Day04 } from "./deno/day_04.ts";
import { Puzzle01 } from "./deno/puzzle_01.ts";
import { Puzzle02 } from "./deno/puzzle_02.ts";

Deno.test(async function runAllDays() {
  await new Puzzle01().solve();
  await new Puzzle02().solve();
  await new Day02().solve();
  await new Day03().solve();
  await new Day04().solve();
});
