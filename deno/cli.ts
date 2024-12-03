import { Puzzle02 } from "./puzzle_02.ts";

export async function cli() {
  console.log(`Running ${Deno.args}`);
  const puz = new Puzzle02();
  await puz.solve();
}
