// import { Day06 } from "./day_06.ts";
// import { Day07 } from "./day_07.ts";
// import { Day08 } from "./day_08.ts";
// import { Day09 } from "./day_09.ts";
import { Day10 } from "./day_10.ts";

export async function cli() {
  // console.log(`Running ${Deno.args}`);
  const puz = new Day10();
  const result = await puz.solve();
  console.log(result);
}
