import { assertEquals } from "@std/assert/equals";
import { DIGEST_ALGORITHM_NAMES } from "@std/crypto/crypto";
import { toNamespacedPath } from "@std/path/to-namespaced-path";
import { assert } from "@std/assert";

export function parseDay19(src: string): [string[], string[]] {
  const parts = src.trim().split("\n\n");
  assertEquals(parts.length, 2, "expecting 2 parts in this puzzle data");
  return [
    parts[0].trim().split(",").map((w) => w.trim()),
    parts[1].trim().split("\n").map((w) => w.trim()),
  ];
}

/**
 * A Trie node
 *
 * A Map<string, Stripe19> would be so much easier, but I'm feeling like thinking through how
 * I would do it on a resource-limited chip. Since the alphabet is so small, I'm using an array instead of
 * a Map and all the hash overhead that creates.
 */
export class Stripe19 {
  z = false; // true if word terminates here
  k: (Stripe19 | null)[]; // kids, children
  constructor(readonly id: number, alphabetLength: number) {
    this.k = Array(alphabetLength).fill(null);
  }
}

/**
 * A pattern matcher that makes designes out of towels.
 */
export class Onsen19 {
  trie: Stripe19; // head of the trie
  nodes: Stripe19[] = []; // just because
  constructor(
    readonly alphabet: string,
    readonly towels: string[],
    readonly designs: string[],
    addWords: boolean,
  ) {
    towels.forEach((t) => this.validate(t, "invalid towel"));
    designs.forEach((t) => this.validate(t, "invalid design"));
    this.trie = this.newNode();
    if (addWords) {
      towels.forEach((t) => this.addWord(t));
    }
  }

  tok(c: string) {
    // validate upon data input that we have no invalid characters
    return this.alphabet.indexOf(c);
  }

  detok(n: number) {
    // validate upon data input that we have no invalid tokens
    return this.alphabet[n]!;
  }

  validate(w: string, msg: string) {
    w.split("").forEach((c) =>
      assert(this.tok(c) >= 0, `${msg}: ${w} ("${c}")`)
    );
  }

  static parse(src: string, addWords = true): Onsen19 {
    const [towels, designs] = parseDay19(src);
    return new Onsen19("rgubw", towels, designs, addWords);
  }

  // create another trie node and add it to the pool
  // the pool isn't for reuse, but for reporting and debuggfing
  newNode(): Stripe19 {
    const node = new Stripe19(this.nodes.length, this.alphabet.length);
    this.nodes.push(node);
    return node;
  }

  /**
   * encode another set of chars in the trie
   * returning the terminal node
   * @param word
   */
  addWord(word: string): Stripe19 {
    this.validate(word, "malformed word");
    return this._addWord(word, this.trie);
  }

  private _addWord(w: string, n: Stripe19): Stripe19 {
    if (w.length < 1) {
      n.z = true; // mark the node as terminal
      // console.debug(`marking node ${n.id} terminal`, n);
      return n;
    }
    const char = w[0];
    const tok = this.tok(char);
    let n2 = n.k[tok];
    if (n2 === null) {
      n2 = this.newNode();
      // console.debug(
      //   `created node ${n2.id} and added it to node${n.id}.k[${tok}].`,
      // );
      n.k[tok] = n2;
    }
    return this._addWord(w.slice(1), n2);
  }

  matchWord(word: string): boolean {
    this.validate(word, "searching for invalid word");
    return this._matchWord(word, this.trie);
  }

  private _matchWord(word: string, n: Stripe19): boolean {
    if (word.length < 1) return n.z; // true if we're at terminal;
    const char = word[0];
    const tok = this.tok(char);
    const n2 = n.k[tok];
    if (n2 === null) return false;
    return this._matchWord(word.slice(1), n2);
  }
}

/**
 * @deprecated
 * use Stripe19 instead
 */
export class Node19a1 {
  z: number[] = []; //words terminated here
  n: (Node19a1 | null)[] = [null, null, null, null, null];

  // addLetter(c: string): Node19 {
  //   const i = "rgubw".indexOf(c);
  //   if (i < 0) throw new Error(`received unknown character "${c}"`);
  //   if (!this.n[i]) this.n[i] = new Node19();
  //   return this.n[i];
  // }
}

/**
 * @deprecated
 */
export class Day19a1 {
  readonly towels: string[];
  readonly designs: string[];
  trie = new Node19a1();
  nodes: Node19a1[] = []; // dunno why, why not?

  constructor(src: string) {
    [this.towels, this.designs] = parseDay19(src);
    for (let i = 0; i < this.towels.length; i++) this.add(i);
  }

  addLetter(node: Node19a1, c: string): Node19a1 {
    const i = "rgubw".indexOf(c);
    if (i < 0) throw new Error(`received unknown character "${c}"`);
    if (!node.n[i]) {
      const newNode = new Node19a1();
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
    node: Node19a1,
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
