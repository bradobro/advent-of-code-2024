import {
  assert,
  assertEquals,
  assertGreater,
  assertGreaterOrEqual,
  assertLess,
} from "@std/assert";
import { fileLines } from "./lib.ts";
import { Row } from "./day_07.ts";
import { Direction, left, right } from "./Direction.ts";

export const ConsoleForegroundBackgrounds: [string, string][] = [
  ["white", "black"], // foreground, background
  ["white", "red"],
  ["black", "green"],
  ["black", "yellow"],
  ["white", "blue"],
  ["black", "magenta"],
  ["black", "cyan"],
  ["black", "white"],
];

export const nColors = ConsoleForegroundBackgrounds.length;

export function getFgBg(n: number): [string, string] {
  return ConsoleForegroundBackgrounds[n % nColors];
}

export type XY = [number, number];

export function xyAdd(a: XY, b: XY): XY {
  return [a[0] + b[0], a[1] + b[1]];
}

export function xySub(a: XY, b: XY): XY {
  return [a[0] - b[0], a[1] - b[1]];
}

export function xyEqual(a: XY, b: XY): boolean {
  return a[0] === b[0] && a[1] === b[1];
}

export const directionVectors: Record<Direction, XY> = {
  0: [0, 1],
  1: [1, 0],
  2: [0, -1],
  3: [-1, 0],
};

export type CellFormatter<T> = (cell: T) => string;

// returns color number and string
export type CellColoredFormatter<T> = (cell: T) => [number, string];

export class CartesianMatrix<T> {
  private nrows = 0;
  private ncols = 0;

  // we store internally in nY-Y,X coordinates, a.k.a. Row,Col
  // or screen coordinates, the same order we read or print lines:
  // _store[r][c], so _store[0,9] is the rightmost (last) item of 10 in
  // the first row read.
  constructor(public store: T[][]) {
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

  sizeXY(): XY {
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

  validXY([x, y]: XY): boolean {
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

  getXY([x, y]: XY): T {
    return this.getRC(this.nrows - 1 - y, x);
  }

  *iterRows(): Generator<T[]> {
    for (const row of this.store) yield row;
  }

  formatRow(formatter: CellFormatter<T>, row: T[]): string {
    return row.map(formatter).join("");
  }

  print(formatter: CellFormatter<T>) {
    for (const row of this.store) {
      console.log(this.formatRow(formatter, row));
    }
  }

  // works, but not with Less R
  consoleColorize(fmt: CellColoredFormatter<T>, row: T[]): [string, string[]] {
    assertGreater(row.length, 0, "row must have items to format");
    let currentColor = -1;
    const message: string[] = [];
    const colors: string[] = [];
    for (const cell of row) {
      const [color, txt] = fmt(cell);
      if (color !== currentColor) {
        message.push("%c");
        currentColor = color;
        const [fg, bg] = getFgBg(color);
        colors.push(`color: ${fg}; background-color: ${bg};`);
      }
      message.push(txt);
    }
    message.push("%c");
    colors.push(`color: black; background-color: white;`);
    // return [message.join(""), colors];
    // return ["message", ["test: red;"]];
    return [message.join(""), colors];
  }

  printc(fmt: CellColoredFormatter<T>) {
    for (const row of this.store) {
      const [msg, colors] = this.consoleColorize(fmt, row);
      console.log(msg, ...colors);
      // console.debug({ msg, colors });
      // console.log(msg, colors);
      // console.log(this.formatRow(formatter, row));
    }
  }

  async fprint(path: string, formatter: CellFormatter<T>) {
    const te = new TextEncoder();
    const f = await Deno.open(path, {
      write: true,
      truncate: true,
      create: true,
    });
    const w = f.writable.getWriter();
    for (const row of this.store) {
      w.write(te.encode(this.formatRow(formatter, row)));
    }
  }

  format(formatter: CellFormatter<T>): string {
    const rows = this.store.map((row) => this.formatRow(formatter, row));
    return rows.join("\n");
  }

  rows() {
    return this.store.slice(0);
  }

  mapCells<U>(fn: (cell: T, x: number, y: number) => U): CartesianMatrix<U> {
    const store = this.store.map((row, r) =>
      row.map((cell, c) => fn(cell, c, this.nrows - 1 - r))
    );
    return new CartesianMatrix(store);
  }

  *iterCells(): Generator<T> {
    for (const row of this.store) {
      for (const cell of row) {
        yield cell;
      }
    }
  }

  /**
   * Iterates the cells ascending X over each ascending row
   * @generator [cell, XY]
   */
  *iterCellsC(): Generator<[T, XY]> {
    const [nx, ny] = this.sizeXY();
    for (let y = 0; y < ny; y++) {
      const row = this.store[ny - 1 - y];
      for (let x = 0; x < nx; x++) {
        yield [row[x], [x, y]];
      }
    }
  }

  /**
   * Iterate  ascending y, +x|-x alternating
   *
   * @generator: [cell, cellXY, predecessor XY|null]
   */
  *iterSnake(): Generator<[T, XY, XY | null]> {
    const [nx, ny] = this.sizeXY();
    let xDirection = 1;
    for (let y = 0; y < ny; y++) {
      const row = this.store[ny - 1 - y];
      let pred: XY | null = null;
      for (let x = 0; x < nx; x++) {
        const actualX = xDirection > 0 ? x : nx - 1 - x;
        const cell = row[actualX];
        const xy: XY = [actualX, y];
        yield [cell, xy, pred];
        pred = xy;
      }
      xDirection *= -1;
    }
  }

  look(locA: XY, d: Direction): XY | null {
    const locB = xyAdd(locA, directionVectors[d]);
    if (this.validXY(locB)) return locB;
    return null;
  }

  lookL(locA: XY, d: Direction): XY | null {
    return this.look(locA, left(d));
  }

  lookR(locA: XY, d: Direction): XY | null {
    return this.look(locA, right(d));
  }

  static async read(path: string): Promise<CartesianMatrix<string>> {
    let len = -1;
    const store: string[][] = [];
    for await (const line of fileLines(path)) {
      const trimmed = line.trim();
      if (trimmed === "") continue;
      const row = trimmed.split("");
      const rowLen = row.length;
      assertGreater(rowLen, 0, `I'm expecting chars in the row string`);
      if (len < 0) len = rowLen;
      else {assertEquals(
          rowLen,
          len,
          `row.length = ${rowLen}, expected ${len}: "${trimmed}`,
        );}
      store.push(row);
    }
    return new CartesianMatrix(store);
  }

  static tryAddLine(line: string, store: string[][], len: number): number {
    const trimmed = line.trim();
    if (trimmed === "") return len; // skip blank line
    const row = trimmed.split("");
    const rowLen = row.length;

    // consistency and sanity checking
    assertGreater(rowLen, 0, `I'm expecting chars in the row string`);
    if (len > 0) { // if previous len has been noted, check it
      assertEquals(
        rowLen,
        len,
        `row.length = ${rowLen}, expected ${len}: "${trimmed}`,
      );
    }
    store.push(row);
    return rowLen; // we've now captured a length and will check deviations
  }

  static parse(multiLineSource: string): CartesianMatrix<string> {
    let len = -1;
    const store: string[][] = [];
    for (const line of multiLineSource.split(/[\r\n]+/)) {
      len = CartesianMatrix.tryAddLine(line, store, len);
    }
    return new CartesianMatrix(store);
  }
}

/**
 * @deprecated
 * @param path
 * @returns
 */
export function readMatrix(path: string): Promise<CartesianMatrix<string>> {
  return CartesianMatrix.read(path);
  // let len = -1;
  // const store: string[][] = [];
  // for await (const line of fileLines(path)) {
  //   const trimmed = line.trim();
  //   if (trimmed === "") continue;
  //   const row = trimmed.split("");
  //   const rowLen = row.length;
  //   assertGreater(rowLen, 0, `I'm expecting chars in the row string`);
  //   if (len < 0) len = rowLen;
  //   else {assertEquals(
  //       rowLen,
  //       len,
  //       `row.length = ${rowLen}, expected ${len}: "${trimmed}`,
  //     );}
  //   store.push(row);
  // }
  // return new Matrix(store);
}
