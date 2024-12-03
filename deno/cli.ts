import { Day03 } from "./day_03.ts";

export async function cli() {
  console.log(`Running ${Deno.args}`);
  const puz = new Day03();
  await puz.solve();
}
