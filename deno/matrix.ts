import {
  assert,
  assertGreater,
  assertGreaterOrEqual,
  assertLess,
} from "@std/assert";
import { fileLines } from "./lib.ts";

export class Matrix<T> {
  private nrows = 0;
  private ncols = 0;

  // we store internally in nY-Y,X coordinates, a.k.a. Row,Col
  // or screen coordinates, the same order we read or print lines:
  // _store[r][c], so _store[0,9] is the rightmost (last) item of 10 in
  // the first row read.
  constructor(private store: T[][]) {
    this.calcDimensions();
  }

  reset() {
    this.store = [];
    this.calcDimensions();
  }

  private calcDimensions() {
    this.nrows = this.store.length;
    this.ncols = this.nrows < 1 ? 0 : this.store[0].length;
  }

  sizeXY() {
    return [this.ncols, this.nrows];
  }

  validateRC(row: number, column: number) {
    assertGreater(this.nrows, 0, `no rows`);
    assertGreaterOrEqual(row, 0, `row must be >= 0`);
    assertLess(row, this.nrows, `row must be < ${this.nrows}`);
    assertGreater(this.ncols, 0, `no cols`);
    assertGreaterOrEqual(column, 0, `cl. must be >= 0`);
    assertLess(column, this.ncols, `cl. must be < ${this.ncols}`);
  }

  validXY(x: number, y: number): boolean {
    assert(
      this.ncols > 0 && this.nrows > 0,
      `any index into a null matrix is invalid`,
    );
    return x >= 0 && x < this.ncols && y >= 0 && y < this.nrows;
  }

  getRC(row: number, column: number): T {
    if (
      this.nrows > 0 && this.ncols > 0 &&
      row >= 0 && column >= 0 &&
      row < this.nrows && column < this.nrows
    ) {
      const val = this.store[row][column];
      if (val !== undefined) return val;
    }
    throw new Error(
      `attempted to read rc(${row},${column})/xy(${column},${
        this.nrows - 1 - row
      }) from a Matrix[${this.ncols},${this.nrows}]`,
    );
  }

  getXY(x: number, y: number): T {
    return this.getRC(this.nrows - 1 - y, x);
  }

  *iterRows() {
    for (const row of this.store) yield row.slice(0);
  }

  rows() {
    return this.store.slice(0);
  }

  mapCells<U>(fn: (cell: T, x: number, y: number) => U): Matrix<U> {
    const store = this.store.map((row, r) =>
      row.map((cell, c) => fn(cell, c, this.nrows - 1 - r))
    );
    return new Matrix(store);
  }
}

export async function readMatrix(path: string): Promise<Matrix<string>> {
  const store: string[][] = [];
  for await (const line of fileLines(path)) store.push(line.split(""));
  return new Matrix(store);
}
