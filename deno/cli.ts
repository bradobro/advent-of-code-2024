import { Day04 } from "./day_04.ts";

export async function cli() {
  console.log(`Running ${Deno.args}`);
  const puz = new Day04();
  const result = await puz.solve();
  console.log(result);
}
