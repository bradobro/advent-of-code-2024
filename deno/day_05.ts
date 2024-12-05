import { assert, assertEquals, assertFalse } from "@std/assert";
import { fileLines } from "./lib.ts";
import { Puzzle, Results } from "./Puzzle.ts";

type Page = number;
type PageList = Page[];
type PageSet = Set<Page>;
type Jobs = PageList[]; // Print runs, each an ordered list of pages

interface PageRule {
  beforeMe: PageSet; // all the page numbers that must come before me (that I must come after)
  afterMe: PageSet; // all the page numbers that must come after me (that I must precede)
}

type Rules = Record<Page, PageRule>;

interface InputData {
  rules: Rules;
  jobs: Jobs; // print runs
}

function followsOrderRules(rules: Rules) {
  return function (job: PageList): boolean {
    for (let i = 0; i < job.length; i++) {
      const pg = job[i];
      const me = rules[pg];
      // console.debug({ i, me });
      const before = job.slice(0, i);
      const after = job.slice(i + 1);
      console.debug({ pg, before, after });
      // const before = new Set<Page>()
    }
    return job.length < 15;
  };
}

function linesToRules(lines: string[]): Rules {
  const result: Rules = {};
  function addRules(left: Page, right: Page) {
    // ensure entries for each page
    if (!(left in result)) {
      result[left] = { beforeMe: new Set(), afterMe: new Set() };
    }
    if (!(right in result)) {
      result[right] = { beforeMe: new Set(), afterMe: new Set() };
    }
    result[left].afterMe.add(right);
    result[right].beforeMe.add(left);
  }
  for (const line of lines) {
    const lr = line.trim().split("|").map((s) => parseInt(s) as Page);
    assertEquals(lr.length, 2, `expected two entries in rule line ${line}`);
    addRules(lr[0], lr[1]);
  }
  // audit rules, check for illogicals
  for (const [pg, { beforeMe, afterMe }] of Object.entries(result)) {
    const common = beforeMe.intersection(afterMe);
    assertEquals(
      common.size,
      0,
      `ERROR: page ${pg} has shared before and after entries: ${common}`,
    );
    const pgN = parseInt(pg) as Page;
    assert(pgN > 0, "expecting a positive page");
    assertFalse(
      beforeMe.has(pgN),
      `page ${pg} appears in it's own beforeMe list`,
    );
    assertFalse(
      afterMe.has(pgN),
      `page ${pg} appears in it's own afterMe list`,
    );
    // console.debug(beforeMe);
  }

  return result;
}

function linesToJobs(lines: string[]): Jobs {
  const result = lines
    .map((line) => line.split(",").map((s) => parseInt(s) as Page));
  // console.debug({ jobs: result });

  // audit jobs
  let min = 100000000000;
  let max = 0;
  let sum = 0;
  let n = 0;
  result.forEach((job) => {
    assertEquals(
      job.length % 2,
      1,
      "expecting all jobs to have an odd number of pages given the requirements",
    );
    const len = job.length;
    sum += len;
    n++;
    if (len < min) min = len;
    if (len > max) max = len;
  });
  console.debug({
    what: "job lengths",
    min,
    max,
    n,
    avg: sum / n,
  });
  return result;
}

export class Day05 extends Puzzle<Results> {
  constructor() {
    super(5);
  }

  async load(): Promise<InputData> {
    let loadSection = 0; // 0-rules, 1-print jobs (lists of pages)
    const ruleLines: string[] = [];
    const jobLines: string[] = [];
    for await (const line of fileLines(this.dataFilePath)) {
      const trimmed = line.trim();
      if (trimmed === "") {
        loadSection++;
        continue; // should bail out of trailing blank lines
      }
      switch (loadSection) {
        case 0:
          ruleLines.push(trimmed);
          break;
        case 1:
          jobLines.push(trimmed);
          break;
        default:
          throw new Error("what! a third section?");
      }
    }
    return {
      rules: linesToRules(ruleLines),
      jobs: linesToJobs(jobLines),
    };
  }

  override async solve(): Promise<Results> {
    const { rules, jobs } = await this.load();
    const correct = jobs.slice(0, 4).filter(followsOrderRules(rules));
    // midpoint, sum
    const results = {
      rules: Object.keys(rules).length,
      jobs: jobs.length,
      correct: correct.length,
    };
    return { day: 5, hash: await this.hash(results), results };
  }
}
