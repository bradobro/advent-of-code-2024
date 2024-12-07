import { describe, it } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { beforeMeAfter, meRest } from "./lib.ts";
import { Matrix } from "./matrix.ts";
import { assertThrows } from "@std/assert";

const matrix1 = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [9, 10, 11],
];

describe("matrix loading and basic access", () => {
  it("loads from an array", () => {
    const m = new Matrix(matrix1);
    expect(m.sizeXY()).toEqual([3, 4]);
  });
  it("it can access 0-based row,col from the top left", () => {
    const m = new Matrix(matrix1);
    expect(m.getRC(0, 0)).toEqual(0);
    expect(m.getRC(0, 1)).toEqual(1);
    expect(m.getRC(0, 2)).toEqual(2);
    expect(m.getRC(2, 0)).toEqual(6);
    expect(m.getRC(2, 1)).toEqual(7);
    expect(m.getRC(3, 0)).toEqual(9);
    expect(m.getRC(3, 2)).toEqual(11);
  });
  it("it can access 0-based x,y from the bottom left", () => {
    const m = new Matrix(matrix1);
    expect(m.getXY(0, 3)).toEqual(0);
    expect(m.getXY(1, 3)).toEqual(1);
    expect(m.getXY(2, 3)).toEqual(2);
    expect(m.getXY(0, 2)).toEqual(3);
    expect(m.getXY(1, 2)).toEqual(4);
    expect(m.getXY(2, 2)).toEqual(5);
    expect(m.getXY(0, 1)).toEqual(6);
    expect(m.getXY(1, 1)).toEqual(7);
    expect(m.getXY(2, 1)).toEqual(8);
    expect(m.getXY(0, 0)).toEqual(9);
    expect(m.getXY(1, 0)).toEqual(10);
    expect(m.getXY(2, 0)).toEqual(11);
  });
  it("doesn't allow negative coordinates", () => {
    const m = new Matrix(matrix1);
    // Negative subscripts NOTE: I may implement these sometime to mean access from the end
    m.getXY(0, 0); // doesn't throw
    assertThrows(() => m.getXY(-1, 0));
    assertThrows(() => m.getXY(0, -1));
  });
  it("checks bounds", () => {
    const m = new Matrix(matrix1);
    // Negative subscripts NOTE: I may implement these sometime to mean access from the end
    m.getXY(0, 0); // doesn't throw
    m.getXY(2, 3); // doesn't throw
    assertThrows(() => m.getXY(0, 4));
    assertThrows(() => m.getXY(3, 0));

    expect(m.validXY(0, 0)).toBeTruthy();
    expect(m.validXY(0, 4)).toBeFalsy();
    expect(m.validXY(3, 0)).toBeFalsy();
  });
});

describe("matrix transformations", () => {
  it("can map a transformation over the matrix", () => {
    const m1 = new Matrix(matrix1);
    const m2 = m1.mapCells((c) => c * 2);
    expect(m2.rows()).toEqual([
      [0, 2, 4],
      [6, 8, 10],
      [12, 14, 16],
      [18, 20, 22],
    ]);
  });

  it("can map with indexes", () => {
    const m1 = new Matrix(matrix1);
    const m2 = m1.mapCells((c, x, y) => [x, y, c * -1]);
    console.debug(m2.rows());
    expect(m2.rows()[0]).toEqual([
      [[0, 3, 0], [1, 3, -1], [2, 3, -2]],
      [[0, 2, -3], [1, 2, -4], [2, 2, -5]],
      [[0, 1, -6], [1, 1, -7], [2, 1, -8]],
      [[0, 0, -9], [1, 0, -10], [2, 0, -11]],
    ]);
  });
});
