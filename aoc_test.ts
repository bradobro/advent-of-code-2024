import { assertEquals } from "@std/assert/equals";
import { Day01 } from "./deno/day_01.ts";
import { Day02 } from "./deno/day_02.ts";
import { Day03 } from "./deno/day_03.ts";
import { Day04 } from "./deno/day_04.ts";
import { Day05 } from "./deno/day_05.ts";
import { DayNext } from "./deno/day_next.ts";
import { Day06 } from "./deno/day_06.ts";

Deno.test(async function day1() {
  const day1 = await new Day01().solve();
  // console.debug(day1);
  assertEquals(
    day1.hash,
    "aacfdbc84ce50cda348b4f49e986a84c946b827bcdb10945d6b8018f77a695ec",
  ); // not the anwer, but a check
});

Deno.test(async function day2() {
  const day2 = await new Day02().solve();
  // console.debug(day2);
  assertEquals(
    day2.hash,
    "a35082ae01fb49e9084f76912036e46dd4576862a2d6c391e7c983ab418ffc2a",
  );
});

Deno.test(async function day3() {
  const day3 = await new Day03().solve();
  // console.debug(day3);
  assertEquals(
    day3.hash,
    "c355a1260cc5ab84503f80f6013a10d2f520c6279b1830c4f3dd2329c33b822f",
  );
});

Deno.test(async function day4() {
  const day4 = await new Day04().solve();
  // console.debug(day4);
  assertEquals(
    day4.hash,
    "423edbd4bdde2dccf59b0515db07db702605b82665e12a94c263d3625e3df4ba",
  );
});

Deno.test(async function day5() {
  assertEquals(
    (await new Day05().solve()).hash,
    "fa11a385431c628a5c2cb46fae2c655af732bbaafa911360f96fb144c2d7e9dc",
  );
});

Deno.test(async function day6() {
  return; // SKIP because it's slow
  assertEquals(
    (await new Day06().solve()).hash,
    "5ad37e2692ce03bfad2dd623024653d55b0aa8648fa51f0a3468105123d8a780",
  );
});

/**
 * Boilerplate for next day
 */
Deno.test(async function dayNext() {
  assertEquals(
    (await new DayNext().solve()).hash,
    "110f15bf65c41e4fc6d521baf898f62b89cecffb250714f33a407a8b73e2c900",
  );
});
