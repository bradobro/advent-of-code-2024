import { assertEquals } from "@std/assert/equals";
import { DayNext } from "./src/day_next.ts";
import {
  Day01,
  Day02,
  Day03,
  Day04,
  Day05,
  Day06,
  Day07,
  Day08,
  Day09,
  Day10,
  Day11,
  Day12,
  Day13,
} from "./mod.ts";

export const AOC_TEST_SLOW = Deno.env.get("AOC_TEST_SLOW") ? true : false;

Deno.test(async function day1() {
  const day1 = await new Day01().solve();
  assertEquals(
    day1.hash,
    "aacfdbc84ce50cda348b4f49e986a84c946b827bcdb10945d6b8018f77a695ec",
  ); // not the anwer, but a check
});

Deno.test(async function day2() {
  const day2 = await new Day02().solve();
  assertEquals(
    day2.hash,
    "a35082ae01fb49e9084f76912036e46dd4576862a2d6c391e7c983ab418ffc2a",
  );
});

Deno.test(async function day3() {
  const day3 = await new Day03().solve();
  assertEquals(
    day3.hash,
    "c355a1260cc5ab84503f80f6013a10d2f520c6279b1830c4f3dd2329c33b822f",
  );
});

Deno.test({
  name: "day4",
  ignore: !AOC_TEST_SLOW,
  async fn() {
    const day4 = await new Day04().solve();
    assertEquals(
      day4.hash,
      "423edbd4bdde2dccf59b0515db07db702605b82665e12a94c263d3625e3df4ba",
    );
  },
});

Deno.test(async function day5() {
  assertEquals(
    (await new Day05().solve()).hash,
    "fa11a385431c628a5c2cb46fae2c655af732bbaafa911360f96fb144c2d7e9dc",
  );
});

Deno.test({
  name: "day7",
  ignore: !AOC_TEST_SLOW,
  async fn() {
    assertEquals(
      (await new Day06().solve()).hash,
      "5ad37e2692ce03bfad2dd623024653d55b0aa8648fa51f0a3468105123d8a780",
    );
  },
});

Deno.test({
  name: "day7",
  ignore: !AOC_TEST_SLOW,
  async fn() {
    assertEquals(
      (await new Day07().solve()).hash,
      "2e52d6be6d1aadec2826901a14ff60c3f5bc4e0dcd51c2ff2a0cb2e04e47718e",
    );
  },
});

Deno.test(async function day8() {
  assertEquals(
    (await new Day08().solve()).hash,
    "fb8e9edfdaa164afca37d8f7e68eac2e5f637385ad11af0b7b7bf58673dee768",
  );
});

Deno.test({
  name: "day7",
  ignore: !AOC_TEST_SLOW,
  async fn() {
    assertEquals(
      (await new Day09().solve()).hash,
      "91cf5a01233b4920cfdf8a55aed30f48061e0a7a378c0216974453076b959849",
      // // with results2
      // "78884640e34328f51b1f2b5304681a10fa88e855ec2b165c1009d9629cd26562",
    );
  },
});

Deno.test(async function day10() {
  assertEquals(
    (await new Day10().solve()).hash,
    "3aa37bf77c5e805380e11dde1a72d1c5404254c88bd1ba7e45ce50956f4747b2",
  );
});

Deno.test(async function day11() {
  assertEquals(
    (await new Day11().solve()).hash,
    "4323c49c7c68ab1a3c48092ad76c9fb5d8b350579ae6da21bee69c44813c0d03",
    // with results2
    // fc2ccd10d3643d93ca9b1eedc75996b8e92ab3c72681f8a7e6027e4dc83d02cd
  );
});

Deno.test(async function day12() {
  assertEquals(
    (await new Day12().solve()).hash,
    "dc2d5a6ee65bfbb57482c36fc040c3685c712f39551b9ea23ad617fede6468e1",
  );
});

Deno.test(async function day13() {
  assertEquals(
    (await new Day13().solve()).hash,
    "3f15e04be1d823a25482628cad925e021b06d74857f56675fcf82cc32317e7cd",
  );
});

/**
 * Boilerplate for next day
 */
Deno.test(async function dayNext() {
  assertEquals(
    (await new DayNext().solve()).hash,
    "44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a",
  );
});
