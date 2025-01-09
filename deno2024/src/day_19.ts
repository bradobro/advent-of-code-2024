import { assertEquals } from "@std/assert/equals";
import { DIGEST_ALGORITHM_NAMES } from "@std/crypto/crypto";

const [R, G, U, B, W] = [0, 1, 2, 3, 4];

export class Node19 {
  z: number[] = []; //words terminated here
  n: (Node19 | null)[] = [null, null, null, null, null];

  // addLetter(c: string): Node19 {
  //   const i = "rgubw".indexOf(c);
  //   if (i < 0) throw new Error(`received unknown character "${c}"`);
  //   if (!this.n[i]) this.n[i] = new Node19();
  //   return this.n[i];
  // }
}

export function parseDay19(src: string): [string[], string[]] {
  const parts = src.trim().split("\n\n");
  assertEquals(parts.length, 2, "expecting 2 parts in this puzzle data");
  return [
    parts[0].trim().split(",").map((w) => w.trim()),
    parts[1].trim().split("\n").map((w) => w.trim()),
  ];
}

export class Day19 {
  readonly towels: string[];
  readonly designs: string[];
  trie = new Node19();
  nodes: Node19[] = []; // dunno why, why not?

  constructor(src: string) {
    [this.towels, this.designs] = parseDay19(src);
    for (let i = 0; i < this.towels.length; i++) this.add(i);
  }

  addLetter(node: Node19, c: string): Node19 {
    const i = "rgubw".indexOf(c);
    if (i < 0) throw new Error(`received unknown character "${c}"`);
    if (!node.n[i]) {
      const newNode = new Node19();
      node.n[i] = newNode;
      this.nodes.push(newNode);
    }
    return node.n[i];
  }

  add(wordIndex: number) {
    const word = this.towels[wordIndex];
    let cur = this.trie; // start at trie head
    for (const letter of word) {
      cur = this.addLetter(cur, letter);
    }
    cur.z.push(wordIndex);
  }

  match(design: string) {
    return Array.from(this._iterMatches(design.split(""), this.trie, []));
  }
  /**
   * @param design letters to find
   * @param node node from which to find them (start with this.trie)
   * @param prefix list of component word indexes (start with [])
   */
  private *_iterMatches(
    design: string[],
    node: Node19,
    prefix: number[],
  ): Generator<number[] | null> {
    // handle ending case: empty search
    if (design.length === 0) {
      if (node.z.length > 0) {
        // if (node.z.length > 1) { console.debug( `i didn't expect to find two words ending at the same node. shouldn't happen, should it?` ); }
        yield [...prefix, node.z[0]];
      }
      yield null; // matched word, but no terminal can we just not yield?
    } else {
      const l = design[0];
      const i = "rgubw".indexOf(l);
      if (i < 0) throw new Error(`unrecognized character in search "${l}`);
      // if we're at a terminal, follow the path of fresh words
      // deno-fmt-ignore
      if (node.z.length > 0 && this.trie.n[i])
        // if (node.z.length > 1) { console.debug( `i didn't expect to find two words ending at the same node. shouldn't happen, should it?`, ); }
        for ( const result of this._iterMatches(design.slice(1), this.trie, [ ...prefix, node.z[0] ]) )
          if (result !== null) yield result;
      // deno-fmt-ignore
      if (node.n[i])
          for ( const result of this._iterMatches(design.slice(1), node.n[i], [ ...prefix ]) )
            if (result !== null) yield result;
    }
  }
}

export function day19() {
  console.debug("designs with towels at the onsen");
}
