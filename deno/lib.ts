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

/**
 * @param all an array of the same type of elements
 * @iterates [before, me, after] where:
 *     - me is each item sequentially in the list (each iteration advances the item)
 *     - before is the list of items before "me"
 *     - after is the list of items after "me"
 */
export function* beforeMeAfter<T>(all: T[]): Generator<(T[] | T)[]> {
  const n = all.length;
  for (let i = 0; i < n; i++) {
    const before: T[] = all.slice(0, i); // all the items before current item
    const me = all[i]; // ME; current item
    const after: T[] = all.slice(i + 1); // all the items after the current item
    yield [before, me, after];
  }
}
