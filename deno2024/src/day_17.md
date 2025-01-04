# Notes on Day 17

Simple state machine; the hardest part is catching the edge cases, some of which aren't super clear (well, to me that is) until I worked through all the examples, even the little ones.

Part 2 makes me want to disassemble the input program. Notice that JNZ can jump to any of 0-7, but the program is a stable loop--it does not do anything fancy like branching where it treats former operands as opcodes.

| PC  | bits |    from 0    |
| === | ==== | ============ |
| 00  | 2    | BST A % 8    |
| 01  | 4    |              |
| 02  | 1    | BXL B ^ 1    |
| 03  | 1    |              |
| 04  | 7    | CDV A / 2**B |
| 05  | 5    |              |
| 06  | 1    | BXL B ^ 5 |
| 07  | 5    |              |
| 08  | 4    | BXC B^C      |
| 09  | 0    |              |
| 10  | 5    | OUT B % 8    |
| 11  | 5    |              |
| 12  | 0    | ADV A / 8    |
| 13  | 3    |              |
| 14  | 3    | JNZ 0        |
| 15  | 0    |              |

Translated into TypeScript:

```typescript
export function day17js(initialA: number): number[] {
  const result: number[] = [];
  let [a, b, c] = [initialA, 0, 0];
  while (a !== 0) {
    b = a % 8;
    b ^= 1;
    // console.debug({ a, b, c });  // shows the patterrn
    c = Math.trunc(a / 2 ** b);
    b ^= 5;
    b ^= c;
    result.push(b % 8);
    a >>= 3;
  }
  return result;
}
```
