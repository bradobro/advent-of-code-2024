export enum Direction {
  N = 0,
  E,
  S,
  W,
}

export function right(d: Direction): Direction {
  return (d + 1) % 4;
}

export function left(d: Direction): Direction {
  return (d + 3) % 4;
}

export const Directions: Direction[] = [
  Direction.N,
  Direction.E,
  Direction.S,
  Direction.W,
];
