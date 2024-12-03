// helpers for AoC
import { TextLineStream } from "@std/streams";

/**
 * @param path fileLines returns an async iterator that steps through the lines of a file
 */
export async function* fileLines(path: string) {
  const file = await Deno.open(path, { read: true });
  const lines = file
    .readable
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(new TextLineStream());
  for await (const line of lines) yield line;
}
