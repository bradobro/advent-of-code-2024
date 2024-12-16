import { describe, it } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { PuzzleField, Region, RegionWithMeta } from "./day_12.ts";

const src1 = `
AAAA
BBCD
BBCC
EEEC
`;

// [perim, area]
const regions1: Region[] = [
  { crop: "A", area: 4, perim: 10, cost: 40, sides: 4, discounted: 16 },
  { crop: "B", area: 4, perim: 8, cost: 32, sides: 4, discounted: 16 },
  { crop: "C", area: 4, perim: 10, cost: 40, sides: 8, discounted: 32 },
  { crop: "D", area: 1, perim: 4, cost: 4, sides: 4, discounted: 4 },
  { crop: "E", area: 3, perim: 8, cost: 24, sides: 4, discounted: 12 },
];

const cost1 = 140;
const discounted1 = 80;

const src2 = `
OOOOO
OXOXO
OOOOO
OXOXO
OOOOO
`;

const regions2: Region[] = [
  // counting sides of this is the tough one
  { crop: "O", area: 21, perim: 36, cost: 756, sides: 20, discounted: 420 },
  { crop: "X", area: 1, perim: 4, cost: 4, sides: 4, discounted: 4 },
  { crop: "X", area: 1, perim: 4, cost: 4, sides: 4, discounted: 4 },
  { crop: "X", area: 1, perim: 4, cost: 4, sides: 4, discounted: 4 },
  { crop: "X", area: 1, perim: 4, cost: 4, sides: 4, discounted: 4 },
];

const cost2 = 772;
const discounted2 = 436;

const src3 = `
RRRRIICCFF
RRRRIICCCF
VVRRRCCFFF
VVRCCCJFFF
VVVVCJJCFE
VVIVCCJJEE
VVIIICJJEE
MIIIIIJJEE
MIIISIJEEE
MMMISSJEEE
`;

const regions3: Region[] = [
  { crop: "R", area: 12, perim: 18, cost: 216, sides: 10, discounted: 120 },
  { crop: "I", area: 4, perim: 8, cost: 32, sides: 4, discounted: 16 },
  { crop: "C", area: 14, perim: 28, cost: 392, sides: 22, discounted: 308 },
  { crop: "F", area: 10, perim: 18, cost: 180, sides: 12, discounted: 120 },
  { crop: "V", area: 13, perim: 20, cost: 260, sides: 10, discounted: 130 },
  { crop: "J", area: 11, perim: 20, cost: 220, sides: 12, discounted: 132 },
  { crop: "C", area: 1, perim: 4, cost: 4, sides: 4, discounted: 4 },
  { crop: "E", area: 13, perim: 18, cost: 234, sides: 8, discounted: 104 },
  { crop: "I", area: 14, perim: 22, cost: 308, sides: 16, discounted: 224 },
  { crop: "M", area: 5, perim: 12, cost: 60, sides: 6, discounted: 30 },
  { crop: "S", area: 3, perim: 8, cost: 24, sides: 6, discounted: 18 },
];

const cost3 = 1930;
const discounted3 = 1206;

describe("test data", () => {
  it("example 1 data makes sense", () => {
    regions1.forEach((reg) => expect(reg.cost).toEqual(reg.area * reg.perim));
    expect(regions1.reduce((acc, reg) => acc + reg.cost, 0)).toEqual(cost1);
    regions1.forEach((reg) =>
      expect(reg.discounted).toEqual(reg.area * reg.sides)
    );
    expect(regions1.reduce((acc, reg) => acc + reg.discounted, 0)).toEqual(
      discounted1,
    );
  });
  it("example 2 data makes sense", () => {
    regions2.forEach((reg) => expect(reg.cost).toEqual(reg.area * reg.perim));
    expect(regions2.reduce((acc, reg) => acc + reg.cost, 0)).toEqual(cost2);
    regions2.forEach((reg) =>
      expect(reg.discounted).toEqual(reg.area * reg.sides)
    );
    expect(regions2.reduce((acc, reg) => acc + reg.discounted, 0)).toEqual(
      discounted2,
    );
  });
  it("example 3 data makes sense", () => {
    regions3.forEach((reg) => expect(reg.cost).toEqual(reg.area * reg.perim));
    expect(regions3.reduce((acc, reg) => acc + reg.cost, 0)).toEqual(cost3);
    regions3.forEach((reg) =>
      expect(reg.discounted).toEqual(reg.area * reg.sides)
    );
    expect(regions3.reduce((acc, reg) => acc + reg.discounted, 0)).toEqual(
      discounted3,
    );
  });
});

function regionSet1(r: Region[]): Set<string> {
  return new Set(r.map((r) => `${r.crop}-a${r.area}-p${r.perim}-c${r.cost}`));
}

function expectRegionsMatch(actual: RegionWithMeta[], expected: Region[]) {
  // const actualSet = new Set<Region>(actual.map((
  //   { crop, perim, area, cost },
  // ) => ({ crop, perim, area, cost })));
  expect(regionSet1(actual)).toEqual(regionSet1(expected));
}

describe("basic algorithms 1", () => {
  it("finds the regions in example 1", () => {
    const pf1 = PuzzleField.parse(src1);
    expect(pf1.regions.length).toEqual(regions1.length);
    expectRegionsMatch(pf1.regions, regions1);
    expect(pf1.totalCost).toEqual(cost1);
    // console.debug(regionSet(regions1));
  });
  it("finds the regions in example 2", () => {
    const pf2 = PuzzleField.parse(src2);
    expect(pf2.regions.length).toEqual(regions2.length);
    expectRegionsMatch(pf2.regions, regions2);
    expect(pf2.totalCost).toEqual(cost2);
    // console.debug(regionSet(regions1));
  });
  it("finds the regions in example 3", () => {
    const pf3 = PuzzleField.parse(src3);
    for (const r of pf3.iterRegions()) {
      console.log(r);
    }
    expectRegionsMatch(pf3.regions, regions3);
    expect(pf3.totalCost).toEqual(cost3);
  });
});

function regionSet2(r: Region[]): Set<string> {
  return new Set(
    r.map((r) => `${r.crop}-a${r.area}-s${r.sides}-d${r.discounted}`),
  );
}

describe("basic algorithms 2 (sides calc)", () => {
  it("finds the sides count of example 1", () => {
    const pf1 = PuzzleField.parse(src1);
    expect(regionSet2(pf1.regions)).toEqual(regionSet2(regions1));
    expect(pf1.totalDiscountedCost).toEqual(discounted1);
    // example 1 has no islands
    for (const r of pf1.regions) expect(r.island).toBeFalsy();
  });
  it("finds the sides count of example 2", () => {
    const pf2 = PuzzleField.parse(src2);
    expect(regionSet2(pf2.regions)).toEqual(regionSet2(regions2));
    expect(pf2.totalDiscountedCost).toEqual(discounted2);
    // for (const r of pf2.regions) {
    //   if (r.island) console.debug(r);
    // }
  });
  it("finds the sides count of example 3", () => {
    const pf3 = PuzzleField.parse(src3);
    expect(regionSet2(pf3.regions)).toEqual(regionSet2(regions3));
    expect(pf3.totalDiscountedCost).toEqual(discounted3);
    for (const r of pf3.regions) expect(r.island).toBeFalsy();
  });
});

describe("part 2 handles the extra examples", () => {
  it("handles example 4", () => {
    const pf4 = PuzzleField.parse(`
      EEEEE
      EXXXX
      EEEEE
      EXXXX
      EEEEE
      `);
    const discounted4 = 236;
    expect(pf4.totalDiscountedCost).toEqual(discounted4);
  });

  it("handles example 5", () => {
    // tests the diagonal edge condition with A's in the center
    const pf5 = PuzzleField.parse(`
AAAAAA
AAABBA
AAABBA
ABBAAA
ABBAAA
AAAAAA
`);
    const discounted5 = 368;
    expect(pf5.totalDiscountedCost).toEqual(discounted5);
  });
});

// describe("alternate part1 implementation for example 3", () => {
//   it("iterates the first region", () => {
//     const pf3 = PuzzleField.parse(src3);
//     for (const l of pf3.grid.iterCells()) {
//       l.region = NO_REGION;
//     }
//     const nxt = pf3.nextLocWithoutRegion();
//     expect(nxt).toEqual([{ crop: "M", region: -1, perim: 2 }, [0, 0]]);
//     const ci = pf3.iterRegionCells(0, [0, 0]);
//     expect(ci.next().value[1]).toEqual([0, 0]);
//     expect(ci.next().value[1]).toEqual([0, 1]);
//     expect(ci.next().value[1]).toEqual([1, 0]);
//     expect(ci.next().value[1]).toEqual([0, 2]);
//     expect(ci.next().value[1]).toEqual([2, 0]);
//     expect(ci.next().done).toBeTruthy();
//   });
//   it("iterates the second region", () => {
//     const pf3 = PuzzleField.parse(src3);
//     for (const l of pf3.grid.iterCells()) {
//       l.region = NO_REGION;
//     }
//     const cells = Array.from(pf3.iterRegionCells(0, [3, 0]));
//     // console.debug(cells);
//     expect(cells[0][0].crop).toEqual("I");
//     expect(new Set<XY>(cells.map((c) => c[1]))).toEqual(
//       new Set([
//         [1, 1],
//         [1, 2],
//         [2, 1],
//         [2, 2],
//         [2, 3],
//         [2, 4],
//         [3, 0],
//         [3, 1],
//         [3, 2],
//         [3, 3],
//         [4, 2],
//         [4, 3],
//         [5, 1],
//         [5, 2],
//       ]),
//     );
//   });
//   it("iterates over the first tricky C region", () => {
//     const pf3 = PuzzleField.parse(src3);
//     for (const l of pf3.grid.iterCells()) {
//       l.region = NO_REGION;
//     }
//     const cells = Array.from(pf3.iterRegionCells(0, [5, 3]));
//     expect(cells[0][0].crop).toEqual("C");
//     expect(cells.length).toEqual(14);
//     const cells2 = Array.from(pf3.iterRegionCells(1, [7, 5]));
//     expect(cells2[0][0].crop).toEqual("C");
//     expect(cells2.length).toEqual(1);
//   });
// });
