import { Puzzle01 } from "./puzzle_01.ts";

export async function cli() {
  console.log(`Running ${Deno.args}`);
  const puz1 = new Puzzle01();
  await puz1.solve();
}
