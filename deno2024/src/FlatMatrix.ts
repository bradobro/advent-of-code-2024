import { assertEquals } from "@std/assert/equals";
import { assert } from "@std/assert/assert";

export type FlatStore<T> = T[];

/**
 * @param coords coordinate array: [x, y, z, ...]
 * @param numerators "place" multipliers, e.g. [1, 10, 100] for a 10*10*10
 * @returns the integer offset into a single flat array
 */
export function xy2i(coords: number[], numerators: number[]): number {
  return coords.reduce((acc, coord, i) => acc + (coord * numerators[i]), 0);
}

/**
 * @param id integer offset into a single flat array
 * @param divisors modulus value for each "place", e.g. [10, 100, 1000] for a 10*10*10
 * @returns coordinate array, [x, y, z, ...]
 */
export function i2xy(id: number, divisors: number[]): number[] {
  let rest = id;
  let numerator = 1;
  return divisors.map((div) => {
    let coord = rest % div;
    rest -= coord;
    coord /= numerator;
    numerator = div;
    return coord;
  });
}

// bounds checked
export function xy2iSafe(
  coords: number[],
  numerators: number[],
  dims: number[],
): number {
  assertEquals(
    coords.length,
    numerators.length,
    "length of coorinates and dimension numerators should match",
  );
  assertEquals(
    coords.length,
    dims.length,
    "length of coorinates and dimensions should match",
  );
  return coords.reduce((acc, coord, i) => {
    assert(coord >= 0 && coord < dims[i]);
    return acc + (coord * numerators[i]);
  }, 0);
}

export class FlatMatrix<T> {
  // Dimensions
  readonly ndim: number; // number of demensions
  readonly nums: number[] = []; // numerators of each dimension digit * num[place] sum for value
  readonly divs: number[] = []; // divisors of each dimension (rest % divs[place] to extract digit)

  // Backing store
  readonly size: number; // number of elements in store

  // Fancy stuff
  // private names: string[] = []; // names of dimensions

  constructor(public store: FlatStore<T>, readonly dims: number[]) {
    this.ndim = dims.length;
    this.size = 1;
    for (const dim of dims) {
      this.nums.push(this.size);
      this.size *= dim;
      this.divs.push(this.size);
    }
    assertEquals(
      store.length,
      this.size,
      `expecting store to hold ${this.size} items`,
    );
  }

  static calcSize(dims: number[]): number {
    return dims.reduce((acc, d) => acc * d, 1);
  }

  static create<T>(dimensions: number[], defaultValue: T): FlatMatrix<T> {
    return new this(
      new Array(this.calcSize(dimensions)).fill(defaultValue),
      dimensions,
    );
  }

  get(coords: number[]): T {
    return this.store[this.id(coords)];
  }

  id(coords: number[]): number {
    return xy2i(coords, this.nums);
  }

  coords(id: number): number[] {
    return i2xy(id, this.divs);
  }
}
