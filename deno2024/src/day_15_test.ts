import { describe, it } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import {
  BotInWarehouse,
  doublesize,
  findRobot,
  formatWarehouse,
  moveBot1,
  moveBot2,
  parseWarehouse,
  parseWideWarehouse,
  tally15,
} from "./day_15_model.ts";
import { Direction } from "./Direction.ts";
import { cloneMatrix, formatMatrix } from "./Matrix.ts";
import { assert } from "@std/assert/assert";

const src1 = `
##########
#..O..O.O#
#......O.#
#.OO..O.O#
#..O@..O.#
#O#..O...#
#O..O..O.#
#.OO.O.OO#
#....O...#
##########

<vv>^<v^>v>^vv^v>v<>v^v<v<^vv<<<^><<><>>v<vvv<>^v^>^<<<><<v<<<v^vv^v>^
vvv<<^>^v^^><<>>><>^<<><^vv^^<>vvv<>><^^v>^>vv<>v<<<<v<^v>^<^^>>>^<v<v
><>vv>v^v^<>><>>>><^^>vv>v<^^^>>v^v^<^^>v^^>v^<^v>v<>>v^v^<v>v^^<^^vv<
<<v<^>>^^^^>>>v^<>vvv^><v<<<>^^^vv^<vvv>^>v<^^^^v<>^>vvvv><>>v^<<^^^^^
^><^><>>><>^^<<^^v>>><^<v>^<vv>>v>>>^v><>^v><<<<v>>v<v<v>vvv>^<><<>^><
^>><>^v<><^vvv<^^<><v<<<<<><^v<<<><<<^^<v<^^^><^>>^<v^><<<^>>^v<v^v<v^
>^>>^v>vv>^<<^v<>><<><<v<<v><>v<^vv<<<>^^v^>^^>>><<^v>>v^v><^^>>^<>vv^
<><^^>^^^<><vvvvv^v<v<<>^v<v>v<<^><<><<><<<^^<<<^<<>><<><^^^>^^<>^>v<>
^^>vv<^v^v<vv>^<><v<^v>^^^>>>^^vvv^>vvv<>>>^<^>>>>>^<<^v>^vvv<>^<><<v>
v^^>>><<^^<>>^v^<v^vv<>v^<<>^<^v^v><^<<<><<^<v><v<>vv>>v><v^<vv<>v^<<^
`;

const src2 = `

########
#..O.O.#
##@.O..#
#...O..#
#.#.O..#
#...O..#
#......#
########

<^^>>>vv<v>>v<<

`;

const src3 = `
#######
#...#.#
#.....#
#..OO@#
#..O..#
#.....#
#######

<vv<<^^<<^^
`;

const states3: string[] = [
  `##############
##......##..##
##..........##
##....[][]@.##
##....[]....##
##..........##
##############`,

  `##############
##......##..##
##..........##
##...[][]@..##
##....[]....##
##..........##
##############`,

  `##############
##......##..##
##..........##
##...[][]...##
##....[].@..##
##..........##
##############`,

  `##############
##......##..##
##..........##
##...[][]...##
##....[]....##
##.......@..##
##############`,

  `##############
##......##..##
##..........##
##...[][]...##
##....[]....##
##......@...##
##############`,

  `##############
##......##..##
##..........##
##...[][]...##
##....[]....##
##.....@....##
##############`,

  `##############
##......##..##
##...[][]...##
##....[]....##
##.....@....##
##..........##
##############`,

  `##############
##......##..##
##...[][]...##
##....[]....##
##.....@....##
##..........##
##############`,

  `##############
##......##..##
##...[][]...##
##....[]....##
##....@.....##
##..........##
##############`,

  `##############
##......##..##
##...[][]...##
##....[]....##
##...@......##
##..........##
##############`,

  `##############
##......##..##
##...[][]...##
##...@[]....##
##..........##
##..........##
##############`,

  `##############
##...[].##..##
##...@.[]...##
##....[]....##
##..........##
##..........##
##############`,
];

describe("day 15 examples", () => {
  it("parses the simple example", () => {
    const { wh, inst } = parseWarehouse(src2);
    expect(wh.length).toEqual(8);
    expect(wh[0].length).toEqual(8);
    expect(inst).toEqual([
      Direction.W,
      Direction.N,
      Direction.N,
      Direction.E,
      Direction.E,
      Direction.E,
      Direction.S,
      Direction.S,
      Direction.W,
      Direction.S,
      Direction.E,
      Direction.E,
      Direction.S,
      Direction.W,
      Direction.W,
    ]);
    const botLoc = findRobot(wh);
    expect(botLoc).toEqual({ x: 2, r: 2 });
  });
  it("can execute the moves of the simple example", () => {
    const { wh, inst } = parseWarehouse(src2);
    let state: BotInWarehouse = { wh, bot: findRobot(wh) };
    for (const d of inst) {
      state = moveBot2(state, d);
    }
    expect(tally15(state.wh)).toEqual(2028);
    assert(state.wh !== wh, "objects should be distinct");
    expect(formatMatrix((s) => s, state.wh)).toEqual(
      `########
#....OO#
##.....#
#.....O#
#.#O@..#
#...O..#
#...O..#
########`,
    );
  });
  it("can execute the moves of the first, larger example", () => {
    const { wh, inst } = parseWarehouse(src1);
    let state: BotInWarehouse = { wh, bot: findRobot(wh) };
    for (const d of inst) {
      state = moveBot2(state, d);
    }
    expect(tally15(state.wh)).toEqual(10092);
    expect(formatMatrix((s) => s, state.wh)).toEqual(`##########
#.O.O.OOO#
#........#
#OO......#
#OO@.....#
#O#.....O#
#O.....OO#
#O.....OO#
#OO....OO#
##########`);
  });
});

describe("day15 part 2", () => {
  it("parses doublesize small example", () => {
    const { wh: wh1 } = parseWarehouse(src2);
    const _wh = doublesize(wh1);
    // console.debug(formatMatrix((c) => c, wh));
  });
  it("handles the new example", () => {
    const { wh, inst } = parseWideWarehouse(src3);
    let [state, i] = [{ wh, bot: findRobot(wh) }, 0];
    expect(formatWarehouse(wh)).toEqual(states3[i]);
    for (const d of inst) {
      i++;
      state = moveBot2(state, d);
      const theMap = formatWarehouse(state.wh);
      // console.debug(`\n===== Move ${i}: ${d} =====\n${theMap}\n\n`);
      expect(theMap).toEqual(states3[i]);
    }
  });
  it("parses, moves, and tallies the doublesize large example", () => {
    const { wh, inst } = parseWideWarehouse(src1);
    // console.debug(formatWarehouse(wh));
    expect(formatWarehouse(wh)).toEqual(`####################
##....[]....[]..[]##
##............[]..##
##..[][]....[]..[]##
##....[]@.....[]..##
##[]##....[]......##
##[]....[]....[]..##
##..[][]..[]..[][]##
##........[]......##
####################`);
    let state = { wh, bot: findRobot(wh) };
    for (const d of inst) {
      state = moveBot2(state, d);
    }
    expect(formatWarehouse(state.wh)).toEqual(`####################
##[].......[].[][]##
##[]...........[].##
##[]........[][][]##
##[]......[]....[]##
##..##......[]....##
##..[]............##
##..@......[].[][]##
##......[][]..[]..##
####################`);
    expect(tally15(state.wh)).toEqual(9021);
  });
});
