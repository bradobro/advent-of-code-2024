import { assertEquals } from "@std/assert/equals";
import { DIGEST_ALGORITHM_NAMES } from "@std/crypto/crypto";
import { toNamespacedPath } from "@std/path/to-namespaced-path";
import { assert, assertGreater } from "@std/assert";

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
 *
 * Still too slow. Might need to just hack it with regex?
 */
export class Stripe19 {
  z = false; // true if word terminates here
  k: (Stripe19 | null)[]; // kids, children
  constructor(readonly id: number, alphabetLength: number) {
    this.k = Array(alphabetLength).fill(null);
  }
}

// sort by length, then alphabetic
export function shortestThenAbc(a: string, b: string): number {
  const byLength = a.length - b.length;
  if (byLength === 0) return b < a ? 1 : -1;
  return byLength;
}

/**
 * A pattern matcher that makes designes out of towels.
 */
export class Onsen19 {
  trie: Stripe19; // head of the trie
  nodes: Stripe19[] = []; // just because
  words: string[] = []; // words in the order added
  constructor(
    readonly alphabet: string, // the colors of the towels
    readonly towels: string[], // the "words"
    readonly designs: string[], // the "sentences"
    addWords: boolean,
  ) {
    towels.forEach((t) => this.validate(t, "invalid towel"));
    designs.forEach((t) => this.validate(t, "invalid design"));
    this.towels.sort(shortestThenAbc);
    this.designs.sort(shortestThenAbc);
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
    assertGreater(word.length, 0, "zero length words will mess up the trie");
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

  matchSentence(sentence: string): boolean {
    assert(!this.trie.z); // head of trie must not be terminal or we'll loop
    this.validate(sentence, "malformed sentence");
    // return this._matchSentenceBfs1(sentence, this.trie);
    const [match, breaksR] = this._matchSentenceDfs1(
      sentence,
      this.trie,
      0,
      [],
    );
    if (!match) return false;

    const parts: string[] = [];
    let posa = 0;
    const breaks = breaksR.map((r) => sentence.length - r);

    while (true) {
      const posz = breaks.shift();
      if (posz) {
        parts.push(sentence.slice(posa, posz));
        posa = posz;
        continue;
      }
      parts.push(sentence.slice(posa));
      break;
    }
    console.debug({ sentence, parts });

    return true;
  }

  /**
   * BFS (Breadth-First Search) version of matching concatenations that
   * works for the example but hangs on the puzzle.
   *
   * @param sent
   * @param n
   * @returns
   */
  private _matchSentenceBfs1(sent: string, n: Stripe19): boolean {
    if (sent.length < 1) return n.z; // nothing left, have to be at terminal
    let [wordBoundary, wordContinue] = [false, false];
    if (n.z) { // ASSUMES this.trie.z muset be false
      wordBoundary = this._matchSentenceBfs1(sent, this.trie);
    }
    const char = sent[0]!;
    const tok = this.tok(char);
    const n2 = n.k[tok];
    if (n2 !== null) {
      wordContinue = this._matchSentenceBfs1(sent.slice(1), n2);
    }
    return wordBoundary || wordContinue;
  }

  /**
   * @param design
   * @param node1
   * @param depth
   * @param wordBreaks
   * @returns [match, breaks]
   *  match: true if the design can be matched
   *  breaks: list of lengths of remaining design to match when a word break was used
   */
  _matchSentenceDfs1(
    design: string,
    node1: Stripe19,
    depth: number,
    wordBreaks: number[],
  ): [boolean, number[]] {
    console.debug({ depth, design, wordBreaks });
    if (depth > 200) {
      throw new Error("Your stack is getting pretty deep");
    }
    // CASE 1: no more characters to match, are we at a terminal node?
    if (design.length < 1) return [node1.z, wordBreaks];

    // Set up for other cases
    const [tok, rest] = [this.tok(design[0]), design.slice(1)];
    const [wordBreak, wordExtends] = [this.trie.k[tok], node1.k[tok]];

    // CASE 2: we can continue matching characters, making this DFS prefer longer words
    if (wordExtends !== null) {
      // deno-fmt-ignore
      const [match, breaks] = this._matchSentenceDfs1( rest, wordExtends, depth + 1, wordBreaks );
      // we return here with success, possibly ignoring alternatives; exhaustive search would have to consider case 3 as well
      if (match) return [match, breaks];
    }

    //CASE 3: we have a word ending and can try match a new word;
    if (node1.z && wordBreak !== null) {
      //deno-fmt-ignore
      const [match, breaks] = this._matchSentenceDfs1( rest, wordBreak, depth + 1, [...wordBreaks, design.length] );
      if (match) return [match, breaks];
    }

    // CASE 4: no further match possible from node1 or, if at a word break, from the head of the trie
    return [false, wordBreaks];
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
  const src = Deno.readTextFileSync("./data/day_19.txt");
  const puz = Onsen19.parse(src);
  const total = puz.designs.length;
  let ok = 0;
  for (const design of puz.designs) {
    console.debug({ design });
    const match = puz.matchSentence(design);
    if (match) ok++;
    // const match = false;
    console.debug({ match, design });
  }
  console.debug(total, ok);
}
