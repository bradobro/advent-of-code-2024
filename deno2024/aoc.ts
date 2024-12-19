import { Day15 } from "./mod.ts";

export async function cli() {
  // console.log(`Running ${Deno.args}`);
  const puz = new Day15();
  const result = await puz.solve();
  console.log(result);
}

if (import.meta.main) {
  await cli();
}
