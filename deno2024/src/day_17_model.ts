import { assertEquals } from "@std/assert/equals";

export interface State17 {
  a: number;
  b: number;
  c: number;
}

export type Program17 = number[];

export class Cpu17 {
  trace = false;
  pc = 0;
  state: State17;

  constructor(readonly state0: State17, readonly program: Program17) {
    this.state = { ...state0 };
  }

  reset() {
    this.pc = 0;
    this.state = { ...this.state0 };
  }

  readonly instructionDescriptions = [
    "adv0 a = a div 2**combo",
    "bxl1 b ^= lit",
    "bst2 b = combo % 8",
    "jnz3 jump to lit if a != 0",
    "bxc4 b ^= c (pc++)",
    "out5 print(combo % 8)",
    "bdv6 b = a div 2 ** combo",
    "cdv7 c = a div 2 ** combo",
  ];

  // The adv instruction (opcode 0) performs division. The numerator is the
  // value in the A register. The denominator is found by raising 2 to the power
  // of the instruction's combo operand. (So, an operand of 2 would divide A by
  // 4 (2^2); an operand of 5 would divide A by 2^B.) The result of the division
  // operation is truncated to an integer and then written to the A register.
  adv() {
    const [_, combo] = this.getOperand();
    if (this.trace) console.debug({ combo });
    this.state.a = Math.trunc(this.state.a / 2 ** combo);
    return 1000;
  }

  // PAUSE: possibly an alternative unusual solution exists

  // The bxl instruction (opcode 1) calculates the bitwise XOR of register B and
  // the instruction's literal operand, then stores the result in register B.
  bxl() {
    const [lit, _] = this.getOperand();
    if (this.trace) console.debug({ lit });
    this.state.b ^= lit;
    return 1000;
  }

  // The bst instruction (opcode 2) calculates the value of its combo operand
  // modulo 8 (thereby keeping only its lowest 3 bits), then writes that value
  // to the B register.
  bst() {
    const [_, combo] = this.getOperand();
    if (this.trace) console.debug({ combo });
    this.state.b = combo % 8;
    return 1000;
  }

  // The jnz instruction (opcode 3) does nothing if the A register is 0.
  // However, if the A register is not zero, it jumps by setting the instruction
  // pointer to the value of its literal operand; if this instruction jumps, the
  // instruction pointer is not increased by 2 after this instruction.
  jnz() {
    const [lit, _] = this.getOperand();
    if (this.state.a != 0) {
      if (this.trace) console.debug({ lit });
      this.pc = lit;
    }
    return 1000;
  }

  // The bxc instruction (opcode 4) calculates the bitwise XOR of register B and
  // register C, then stores the result in register B. (For legacy reasons, this
  // instruction reads an operand but ignores it.)
  bxc() {
    if (this.trace) console.debug(`skipping operand ${this.program[this.pc]}`);
    this.pc++;
    this.state.b ^= this.state.c;
    return 1000;
  }

  // The out instruction (opcode 5) calculates the value of its combo operand
  // modulo 8, then outputs that value. (If a program outputs multiple values,
  // they are separated by commas.)
  out() {
    const [_, combo] = this.getOperand();
    const output = combo % 8;
    if (this.trace) console.debug({ combo, output });
    return output;
  }

  // The bdv instruction (opcode 6) works exactly like the adv instruction
  // except that the result is stored in the B register. (The numerator is still
  // read from the A register.)
  bdv() {
    const [_, combo] = this.getOperand();
    if (this.trace) console.debug({ combo });
    this.state.b = Math.trunc(this.state.a / 2 ** combo);
    return 1000;
  }

  // The cdv instruction (opcode 7) works exactly like the adv instruction
  // except that the result is stored in the C register. (The numerator is still
  // read from the A register.)
  cdv() {
    const [_, combo] = this.getOperand();
    if (this.trace) console.debug({ combo });
    this.state.c = Math.trunc(this.state.a / 2 ** combo);

    return 1000;
  }

  readonly instructions = [
    this.adv.bind(this),
    this.bxl.bind(this),
    this.bst.bind(this),
    this.jnz.bind(this),
    this.bxc.bind(this),
    this.out.bind(this),
    this.bdv.bind(this),
    this.cdv.bind(this),
  ];

  getInstruction(opcode: number) {
    const instruction = this.instructions[opcode];
    if (this.trace) {
      console.debug(
        `${instruction.name.slice(6)}${opcode}(${this.program[this.pc + 1]}): ${
          this.instructionDescriptions[opcode]
        }`,
      );
    }
    this.pc++;
    if (instruction) return instruction;
    throw new Error(`unknown opcode "${opcode} at pc=${this.pc}`);
  }

  getOperand(): [number, number] {
    if (this.pc >= this.program.length) {
      throw new Error(`could not get operand at pc=${this.pc}`);
    }
    const literal = this.program[this.pc];
    this.pc++;
    if (literal < 0) throw new Error(`invalid operand ${literal}@${this.pc}`);
    if (literal < 4) return [literal, literal];
    if (literal === 4) return [literal, this.state.a];
    if (literal === 5) return [literal, this.state.b];
    if (literal === 6) return [literal, this.state.c];
    if (literal === 7) return [literal, -Infinity];
    throw new Error(`invalid operand ${literal}@${this.pc}`);
  }

  *step() {
    let step = 0;
    if (this.trace) {
      console.debug("==========");
      console.debug({ program: this.program });
      console.debug({ ...this.snapshot() });
      console.debug("----------");
    }
    while (this.pc < this.program.length) {
      step++;
      const instruction = this.getInstruction(this.program[this.pc]);
      const output = instruction();
      if (output < 8) yield output;
      if (this.trace) {
        console.debug({ afterstep: step, ...this.snapshot() });
      }
    }
  }

  run() {
    this.reset();
    const output = Array.from(this.step()).filter((a) => a < 8);
    return output;
  }

  snapshot() {
    const { a, b, c } = this.state;
    return {
      a,
      b,
      c,
      pc: this.pc,
      snippet: this.program.slice(this.pc, this.pc + 4),
    };
  }
}

export const day17code = [2, 4, 1, 1, 7, 5, 1, 5, 4, 0, 5, 5, 0, 3, 3, 0];

export function getInput17a() {
  return new Cpu17({
    a: 64854237,
    b: 0,
    c: 0,
  }, day17code);
}

export function day17js(initialA: number): number[] {
  const result: number[] = [];
  let [a, b, c] = [initialA, 0, 0];
  while (a !== 0) {
    console.debug({ a: a.toString(2), b: b.toString(2), c: c.toString(2) });

    b = a % 8;
    b ^= 1;
    // console.debug({ a, b, c });
    c = Math.trunc(a / 2 ** b);
    b ^= 5;
    b ^= c;
    result.push(b % 8);
    a >>= 3;
  }
  return result;
}

/**
 * @param initialA
 * @param pattern
 * @returns negative means how many unmatched, 0 = exact, 1 = too many
 */
export function day17Match(initialA: number, pattern: number[]): number {
  const n = pattern.length;
  let i = 0;
  let [a, b, c] = [initialA, 0, 0];
  while (a !== 0) {
    // console.debug({ a: a.toString(2), b: b.toString(2), c: c.toString(2) });
    b = a % 8;
    b ^= 1;
    c = Math.trunc(a / 2 ** b);
    b ^= 5;
    b ^= c;
    // check output
    const outp = b % 8;
    if (i >= n) return 1; // too many
    // console.debug({ outp, inp: pattern[i], i, n });
    if (outp !== pattern[i]) return i - n; // too few
    i++;
    a >>= 3;
  }
  // might have gotten here because program ended early
  return i - n;
}

export async function scan17(
  start: number,
  finish: number,
  pattern: number[],
): Promise<number> {
  // assertEquals(Math.trunc(Math.log2(got)), bits - 1);
  const increment = 2 ** 0;
  console.debug({ start, finish, increment });
  let minSoFar = -10000000;
  const logfile = "day17.log";
  const enc = new TextEncoder();
  console.debug("writing to log file", logfile);
  const f = await Deno.open(logfile, {
    write: true,
    create: true,
    truncate: true,
  });
  try {
    for (let i = start; i < finish; i += increment) {
      // const x = (i << bits + 1) | got;
      const missing = day17Match(i, pattern);
      if (missing === 0) {
        await f.write(enc.encode(`${i.toString(2)},${missing}\n`));
        console.debug("FOUND IT", 1);
        return i;
      }
      if (missing > minSoFar) {
        await f.write(enc.encode(`${i.toString(2).padStart(40)},${missing}\n`));
        minSoFar = missing;
      }
    }
  } finally {
    f.close();
  }
  return 0;
}
