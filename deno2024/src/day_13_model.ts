// trying to avoid classes in the main model today,
// though maybe using smaller ones to namespace algorithms.

import { assertEquals } from "@std/assert/equals";
import { multinodes } from "./day_08.ts";
import { parse } from "./day_11.ts";
import { day13data } from "./day_13_data.ts";
import { min } from "./lib.ts";
import { XY } from "./matrix.ts";
import { assertGreater } from "@std/assert/greater";
import { assertGreaterOrEqual } from "@std/assert/greater-or-equal";

const nOfficialGames = day13data.length;

export interface Game {
  buttona: XY;
  buttonb: XY;
  prize: XY;
}

export const NOT_POSSIBLE = -1;

export interface Solution {
  buttona: number;
  buttonb: number;
  cost: number; // cost < 1 means not possible
}

export interface ClawMachine {
  costa: number; // cost for button a
  costb: number; // cost for button b
  games: Game[];
  solutions: Solution[];
}

export function getClawMachine(
  costa: number,
  costb: number,
  gamea = 0,
  gamez = nOfficialGames + 1,
) {
  const games = day13data.slice(gamea, gamez);
  const solutions = games.map((_) => ({ buttona: 0, buttonb: 0, cost: 0 }));
  return { costa, costb, games, solutions };
}

export function puzzle1Machine() {
  return getClawMachine(3, 1);
}

const supersizeFactor = 10000000000000;

export function supersizeGame(g: Game) {
  const [px, py] = g.prize;
  const newPos: XY = [px + supersizeFactor, py + supersizeFactor];
  g.prize = newPos;
}

export class Optimizer1 {
  // first take at optimizing a single puzzle
  readonly stats: ReturnType<Optimizer1["analyze"]>;

  constructor(public game: Game, public costa: number, public costb: number) {
    this.stats = this.analyze(game);
  }

  analyze(g: Game) {
    const [ax, ay] = g.buttona;
    const [bx, by] = g.buttonb;
    const [px, py] = g.prize;
    // a can save money
    const abargainx = ax * this.costb > bx * this.costa;
    const abargainy = ay * this.costb > by * this.costa;
    const axfit = px % ax === 0;
    const ayfit = py % ay === 0;
    const afit = axfit && ayfit;
    const bxfit = px % bx === 0;
    const byfit = py % by === 0;
    const bfit = bxfit && byfit;
    return {
      ax, // how far does button a move along the x axis
      ay,
      bx, // same for button b
      by,
      px, // location of the prize
      py,
      abargainx, // if you might save money using button a for large moves
      abargainy,
      axfit, // does button a divide evenly into the amount of x movement needed?
      ayfit, // y movement
      afit, // both?
      bxfit, // same for y
      byfit,
      bfit,
    };
  }

  static machineStats(m: ClawMachine) {
    let [abargainx, abargainy, axfit, ayfit, afit, bxfit, byfit, bfit] = [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
    ];
    for (const g of m.games) {
      const s = new Optimizer1(g, m.costa, m.costb).stats;
      abargainx += s.abargainx ? 1 : 0;
      abargainy += s.abargainy ? 1 : 0;
      axfit += s.axfit ? 1 : 0;
      ayfit += s.ayfit ? 1 : 0;
      afit += s.afit ? 1 : 0;
      bxfit += s.bxfit ? 1 : 0;
      byfit += s.byfit ? 1 : 0;
      bfit += s.bfit ? 1 : 0;
    }
    return { abargainx, abargainy, axfit, ayfit, afit, bxfit, byfit, bfit };
  }
}

export function maxA(g: Game) {
  const [ax, ay] = g.buttona;
  const [px, py] = g.prize;
  return min(Math.trunc(px / ax), Math.trunc(py / ay));
}

export function solves(g: Game, buttona: number, buttonb: number): boolean {
  const [ax, ay] = g.buttona;
  const [bx, by] = g.buttonb;
  const [px, py] = g.prize;
  return (buttona * ax + buttonb * bx === px) &&
    (buttona * ay + buttonb * by === py);
}

export function findb(g: Game, buttona: number): number {
  const [ax, ay] = g.buttona;
  const [bx, by] = g.buttonb;
  const [px, py] = g.prize;
  const restx = px - (ax * buttona);
  if (restx < 1 || restx % bx !== 0) return -1; // can't solve
  const b = restx / bx;
  if (py === buttona * ay + b * by) return b;
  return -1;
}

type Optimizer = (g: Game, costa: number, costb: number) => Solution;

export function optimize2(g: Game, costa: number, costb: number): Solution {
  let [abest, bbest, costbest] = [0, 0, 0];
  for (let a = maxA(g); a >= 0; a--) {
    const b = findb(g, a);
    if (b < 0) continue;
    const cost = a * costa + b * costb;
    if (costbest < 1 || cost < costbest) {
      [abest, bbest, costbest] = [a, b, cost];
    }
  }
  return { buttona: abest, buttonb: bbest, cost: costbest };
}

// if verify=true, audits solution silently
export function formatProof(g: Game, s: Solution, verify = false): string {
  const result: string[] = ["proof: "];
  const [ax, ay] = g.buttona;
  const [bx, by] = g.buttonb;
  const [px, py] = g.prize;
  const { buttona: na, buttonb: nb, cost } = s;
  const xcalc = na * ax + nb * bx;
  const ycalc = na * ay + nb * by;
  if (verify) {
    assertEquals(xcalc, px, "our x result is off");
    assertEquals(ycalc, py, "our y result is off");
  } else {
    result.push(
      `a*ax+b*bx=${xcalc}===px=${px} ${JSON.stringify([na, ax, nb, bx, px])}; `,
    );
    result.push(
      `a*ay+b*by=${ycalc}===py=${py}  ${
        JSON.stringify([na, ay, nb, by, py])
      }; `,
    );
    result.push(`cost=${cost}.`);
  }
  return result.join("");
}

export function solveMachine(
  m: ClawMachine,
  opt: Optimizer = optimize2,
  verify = true,
) {
  let nWinnable = 0;
  m.solutions = m.games.map((g, i) => {
    console.debug("starting game", i);
    const solution = opt(g, m.costa, m.costb);
    if (solution.cost > 0) {
      nWinnable++;
      if (verify) formatProof(g, solution, verify);
      else console.debug("A winner", i, formatProof(g, solution));
    } else if (!verify) {
      verify || console.debug("unwinnable:", i);
    }
    return solution;
  });
  const tCost = m.solutions.reduce((acc, s) => acc + s.cost, 0);
  return { nWinnable, tCost };
}

/**
 * @param g
 * @param buttona
 * @ returns [
 *   b, // valid buttonb value or -1 for none found
 *   errx, // remainder of b for x
 *   erry, // if errx===0, remainder of b for y
 * ]
 */
export function findBOrErrors(
  g: Game,
  buttona: number,
): [number, number, number] {
  const [ax, ay] = g.buttona;
  const [bx, by] = g.buttonb;
  const [px, py] = g.prize;
  const restx = px - (ax * buttona);
  assertGreaterOrEqual(restx, 0);
  if (restx > 0) { // if we need some button b, let's see if it works out
    const errx = restx % bx;
    if (errx > 0) return [-1, errx, 0];
  }

  // okay, we know a and b can satisfy prizex, but b might be 0
  const b = restx < 1 ? 0 : restx / bx;
  const calcy = buttona * ay + b * by;
  const erry = calcy - py;
  if (erry === 0) return [b, 0, 0];
  return [-1, 0, erry];
}

/**
 * @param g game
 * @param n number of a's to sample
 * @returns [stride, lowpoint]
 *
 * BUG: it might be a bit more complicated than this.
 * FACT: in game 0, tracking ErrX is all that matters
 * FACT: ErrX has to be 0 before we can win
 * BUT: ErrX might not equal 0 at the lowpoint if it passes below 0
 * BUT: it's a modulo, so it can never be negative
 * HYPOTHESIS: a lowpoint is the lowest ErrX after which the next two are higher
 */
export function findStrideAndStart(g: Game, n = 50): [number, number] {
  const limit = min(n, maxA(g) + 1);
  let [lowA, lowB] = [-1, -1];
  let [vL, vM, vN] = [-1, -1, -1]; // val i-2, val i-1, val i
  let [iL, iM, iN] = [-1, -1, -1]; // i-2, i-1, i
  for (let a = 0; a < limit; a++) {
    const [b, errx, _] = findBOrErrors(g, a);
    // if (b >= 0) console.debug("found an answer while searching for strides");
    if (vL < 0) {
      [vL, iL] = [errx, a];
      continue;
    } // initialize item L
    if (vM < 0) {
      [vM, iM] = [errx, a];
      continue;
    } // initialize item M
    if (vL < vM && vL < vN) { // see if we found a low
      if (lowA >= 0) { // found second low, so stop
        console.debug("found lowB");
        lowB = iL;
        break;
      }
      console.debug("found lowA");
      lowA = iL;
      // BUG? shouldn't need to reset vL and vM if this is a true low I thinnk
    }
    [vL, vM] = [vM, vN]; // update the prevs
    [iL, iM] = [iM, iN];
  }
  const stride = lowB - lowA;
  if (stride === lowA) return [stride, 0]; // start ot origin
  return [stride, lowA];
}

// tries to look at the progression of errors
export function optimize3(g: Game, costa: number, costb: number): Solution {
  let [abest, bbest, costbest] = [0, 0, 0];
  // console.debug("game", g);
  // console.debug("b,errx,erry");
  const limit = maxA(g) + 1;
  // for (let a = maxA(g); a >= 0; a--) {
  for (let a = 0; a < limit; a++) {
    const [stride, start] = findStrideAndStart(g, 1000);
    const [b, _errx, _erry] = findBOrErrors(g, a);
    // IDEA: estimate the stride of x, within the stride, errx, erry seem parallel lines
    const b1 = findb(g, a);
    assertEquals(b1, b, "expecting b's to match");
    // console.debug([a, b, errx, erry].map((n) => n.toString()).join(","));
    if (b < 0) continue; // not an answer yet
    const cost = a * costa + b * costb;
    if (costbest < 1 || cost < costbest) {
      console.debug("  improving solution", { stride, start, a, b, cost });
      [abest, bbest, costbest] = [a, b, cost];
    }
  }
  return { buttona: abest, buttonb: bbest, cost: costbest };
}
