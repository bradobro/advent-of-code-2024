/**
 * Matrix is a simpler take on Cartesian Matrix, meant to work
 * directly with the 2D arrays. It's base coordinate system is
 * Row,Col, like Cartesian Matrix.
 */

import { Direction } from "./Direction.ts";

export type Matrix<T> = T[][];

//===== Coordinate Systems
// problem: unlike some languages, this does not create distinct types and won't protect
export type W = number; // width
export type X = number; // 0-based from left
export type Col = number; // same, 0-based from left
export type H = number; // height
export type Y = number; // 0-based from bottom
export type Row = number; // 0-based from top

// Main coordinate formats
export type WH = { w: W; h: H };
export type XY = { x: X; y: Y };
export type CR = { c: Col; r: Row };
export type XR = { x: X; r: Row };

// export const xr2cr = ([x, r]: XR) => [x as Col, r];

// I/O
export type CellParser<T> = (s: string) => T;
export const parseMatrix = <T>(p: CellParser<T>, src: string): Matrix<T> =>
  src.split("\n").map((r) => r.split("").map(p));
export type CellFormatter<T> = (c: T) => string;
export const formatMatrix = <T>(f: CellFormatter<T>, m: Matrix<T>): string =>
  m.map((r) => r.map(f).join("")).join("\n");

// Manipulations
export const dim = <T>(m: Matrix<T>): WH => ({ h: m.length, w: m[0].length });
export type CellTransformer<T, U> = (c: T) => U;
export const transformMatrix = <T, U>(
  t: CellTransformer<T, U>,
  m: Matrix<T>,
): Matrix<U> => m.map((r) => r.map(t));
export const row = <T>(m: Matrix<T>, r: number): T[] => m[r];
export function* rows<T>(m: Matrix<T>): Generator<T[]> {
  for (const r of m) yield r;
}
export const col = <T>(m: Matrix<T>, c: number): T[] => m.map((r) => r[c]);
export function* cols<T>(m: Matrix<T>): Generator<T[]> {
  const w = m[0].length;
  for (let i = 0; i < w; i++) yield col(m, i);
}

// processing
export function* iterCells<T>(
  m: Matrix<T>,
): Generator<{ x: X; r: Row; value: T }> {
  const { w, h } = dim(m);
  for (let r = 0; r < h; r++) {
    for (let x = 0; x < w; x++) {
      yield { x, r, value: m[r][x] };
    }
  }
}

// directions and bounds
const deltasXR: XR[] = [{ x: 0, r: -1 }, { x: 1, r: 0 }, { x: 0, r: 1 }, {
  x: -1,
  r: 0,
}];

export function okXR<T>(m: Matrix<T>, { x, r }: XR): boolean {
  const { w, h } = dim(m);
  return x <= w && r <= h;
}
export function atXR<T>(
  m: Matrix<T>,
  { x: x1, r: r1 }: XR,
  d: Direction,
  dist = 1,
): null | XR {
  const { x: dx, r: dr } = deltasXR[d];
  const result = { x: x1 + dx * dist, r: r1 + dr * dist };
  if (okXR(m, result)) return result;
  return null;
}
