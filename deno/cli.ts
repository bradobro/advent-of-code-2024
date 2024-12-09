// import { Day06 } from "./day_06.ts";
// import { Day07 } from "./day_07.ts";
import { Day08 } from "./day_08.ts";

export async function cli() {
  console.log(`Running ${Deno.args}`);
  const puz = new Day08();
  const result = await puz.solve();
  console.log(result);
}
