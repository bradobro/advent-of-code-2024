import { Day04 } from "./day_04.ts";
import { Day05 } from "./day_05.ts";

export async function cli() {
  console.log(`Running ${Deno.args}`);
  const puz = new Day05();
  const result = await puz.solve();
  console.log(result);
}
