import { cli } from "./deno/cli.ts";

if (import.meta.main) {
  await cli();
}
