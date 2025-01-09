import { Day15 } from "./mod.ts";
import { day18a } from "./src/day_18.ts";
import { day19 } from "./src/day_19.ts";

export async function cli() {
  // console.log(`Running ${Deno.args}`);
  // const puz = new Day15();
  // const result = await puz.solve();
  // console.log(result);
  day19();
}

if (import.meta.main) {
  await cli();
}
