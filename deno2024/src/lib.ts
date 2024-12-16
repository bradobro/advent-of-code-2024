// helpers for AoC
import { TextLineStream } from "@std/streams";
import { assertEquals } from "@std/assert/equals";
import { assertGreaterOrEqual, assertLess } from "@std/assert";

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
export function* beforeMeAfter<T>(
  all: T[],
): Generator<{ i: number; before: T[]; me: T; after: T[] }> {
  const n = all.length;
  for (let i = 0; i < n; i++) {
    const before: T[] = all.slice(0, i); // all the items before current item
    const me = all[i]; // ME; current item
    const after: T[] = all.slice(i + 1); // all the items after the current item
    yield { i, before, me, after };
  }
}

export function* meRest<T>(
  all: T[],
): Generator<{ i: number; me: T; rest: T[] }> {
  for (const { i, before, me, after } of beforeMeAfter(all)) {
    yield { i, me, rest: before.concat(after) };
  }
}

/**
 * @param count how many you want
 * @param choices the possible things to chose from
 * @param combo ord of the combination a number from 0...choices.length**count
 *    combo is interpreted as an integer in base choices.length whose digits,
 *    correspond to choice[digit] in least-significant order
 * @returns combination of choices
 */
export function combination<T>(
  count: number,
  choices: T[],
  combo: number,
): T[] {
  const result: T[] = []; // Least significant first (like LSB)

  const base = choices.length;
  const maxI = base ** count;
  assertGreaterOrEqual(combo, 0, `instance must be 0..${maxI}`);
  assertLess(combo, maxI, `instance must be 0..${maxI}`);

  // strip off choices using the convert-to-base algorithm
  // formatInt might be faster
  let rest = combo;
  for (let i = 0; i < count; i++) {
    const digit = rest % base;
    result.push(choices[digit]);
    rest = (rest / base) | 0; // bitwise integer division https://www.basedash.com/blog/how-to-do-integer-division-in-javascript
  }

  return result;
}

export function* iterPairsOf<T>(items: T[]): Generator<[T, T]> {
  const n = items.length;
  assertGreaterOrEqual(n, 2, `can't take pairs of less than 2 items`);
  for (let i = 0; i < n - 1; i++) {
    const a = items[i];
    for (let j = i + 1; j < n; j++) {
      yield [a, items[j]];
    }
  }
}
