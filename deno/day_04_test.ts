import { assertEquals } from "@std/assert";
import { xmasCount } from "./day_04.ts";

// const x4: string[] = [
//   "ABCD",
//   "EFGH",
//   "IJKL",
//   "MNOP",
// ];

Deno.test(function testFinder() {
  assertEquals(1, xmasCount("XMAS"));
  assertEquals(1, xmasCount("SAMX"));
  assertEquals(2, xmasCount("XMASSAMX"));
  // Tricky 1: share one letter
  assertEquals(2, xmasCount("XMASAMX"));
  assertEquals(2, xmasCount("SAMXMAS"));

  assertEquals(1, xmasCount("XXXXSMSMSSXXXMASSSSSSSSS"));
  assertEquals(1, xmasCount("XXXXSMSMSSXXSAMXSSSSSSSS"));
  assertEquals(2, xmasCount("XXXXSMSMSSXXXMASSAMXSSSSSSSS"));
  assertEquals(2, xmasCount("XXXXSMSMSSXXXMASAMXSSSSSSSS"));
  assertEquals(2, xmasCount("XXXXSMSMSSXXSAMXMASSSSSSSSS"));
});

// Deno.test(function testVertical() {
// assertEquals(x4, transformHorizontal(x4).join(","));
// assertEquals(x4, transformVertical(x4).join(","));
// console.debug(x4.join("\n"));
// console.debug(transformHorizontal(x4));
// console.debug(transformVertical(x4));
// console.debug(transformSlash(x4));
// console.debug(transformBackslash(x4));
// });
