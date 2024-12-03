import { Day02a } from "./day_02a.ts";

export async function cli() {
  console.log(`Running ${Deno.args}`);
  const puz = new Day02a();
  await puz.solve();
}
