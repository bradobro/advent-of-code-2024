import { describe, it } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { FlatMatrix, i2xy, xy2i } from "./FlatMatrix.ts";

describe("FlatMatrix Basics", () => {
  it("makes a matrix", () => {
    const mat1 = FlatMatrix.create<number>([2, 3, 5, 7], -1);
    expect(mat1.size).toEqual(2 * 3 * 5 * 7);
    expect(mat1.size).toEqual(mat1.store.length);
    for (let i = 0; i < mat1.size; i++) {
      mat1.store[i] = i;
    }
  });
  it("addresses leftmost inner (rightmost-major)", () => {
    const dims = [2, 3, 5, 7];
    const mat1 = FlatMatrix.create<number>(dims, -1);
    expect(mat1.divs).toEqual([2, 6, 30, 210]);
    // fill successively
    for (let i = 0; i < mat1.size; i++) {
      mat1.store[i] = i;
    }
    const [na, nb, nc, nd] = dims;
    let i = 0;
    for (let d = 0; d < nd; d++) {
      for (let c = 0; c < nc; c++) {
        for (let b = 0; b < nb; b++) {
          for (let a = 0; a < na; a++) {
            const id = xy2i([a, b, c, d], mat1.nums);
            expect(id).toEqual(mat1.id([a, b, c, d]));
            const coords = i2xy(id, mat1.divs);
            expect(coords).toEqual([a, b, c, d]);
            expect(coords).toEqual(mat1.coords(id));
            expect(mat1.store[id]).toEqual(i);
            // console.log({ a, b, c, d, coords, i });
            expect(mat1.get([a, b, c, d])).toEqual(i);
            i++;
          }
        }
      }
    }
  });
});
