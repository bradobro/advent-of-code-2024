import { Day02a } from "./deno/day_02a.ts";
import { Day03 } from "./deno/day_03.ts";
import { Puzzle01 } from "./deno/puzzle_01.ts";
import { Puzzle02 } from "./deno/puzzle_02.ts";

Deno.test(async function runAllDays() {
  await new Puzzle01().solve();
  await new Puzzle02().solve();
  await new Day02a().solve();
  await new Day03().solve();
});
