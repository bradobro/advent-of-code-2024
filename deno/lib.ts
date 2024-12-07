// helpers for AoC
import { TextLineStream } from "@std/streams";
import { assertEquals } from "@std/assert/equals";

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

// read a file of equal length lines into matrix map
// transforming lines and rows such that it is addressed in cartesian quadrant 1
// +x,+y coordinates
// export type XyMatrix2 = string[][];

// export async function readXyMatrix(path: string): Promise<XyMatrix2> {
//   let nX = -1; // x dimension
//   let nY = 0; // y dimension
//   const rawLines: string[] = []; // UNSHIFTED, so built in inverse (y positive) order
//   for await (const line of fileLines(path)) {
//     // Track dimensions
//     if (nX < 0) nX = line.length; // first line establishes length
//     else {assertEquals(
//         line.length,
//         nX,
//         `expecting line.length to be ${nX}: """\n${line}\m"""`,
//       );}
//     nY++;
//     rawLines.unshift(line);
//   }
//   const result: XyMatrix2 = [];
//   for (let x = 0; x < nX; x++) {
//     const col = rawLines.map((rowY) => rowY[x]);
//     console.debug(col);
//     result.push(col);
//   }
//   return result;
// }

// function dimensionsXY(mat: XyMatrix2): [number, number] {
//   return [mat.length, mat[0].length];
// }

// /**
//  * @param mat an XyMatrix
//  * @iterates printable rows descending y
//  */
// export function* xyMatrixLines(mat: XyMatrix2): Generator<string[]> {
//   const [_, nY] = dimensionsXY(mat);
//   for (let y = nY - 1; y >= 0; y--) {
//     const line: string[] = mat.map((colX) => colX[y]);
//     yield line;
//   }
// }

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
