import { assertEquals } from "@std/assert";
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

function linesToRules(lines: string[]): Rules {
  return {};
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
    const results = { rules: Object.keys(rules).length, jobs: jobs.length };
    return { day: 5, hash: await this.hash(results), results };
  }
}
