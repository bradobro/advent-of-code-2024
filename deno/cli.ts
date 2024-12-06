import { Day06 } from "./day_06.ts";

export async function cli() {
  console.log(`Running ${Deno.args}`);
  const puz = new Day06();
  const result = await puz.solve();
  console.log(result);
}
