import { Day01 } from "./deno/day_01.ts";
import { Day02 } from "./deno/day_02.ts";
import { Day03 } from "./deno/day_03.ts";
import { Day04 } from "./deno/day_04.ts";

Deno.test(async function runAllDays() {
  await new Day01().solve();
  await new Day02().solve();
  await new Day03().solve();
  await new Day04().solve();
});
