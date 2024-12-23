import { describe, it } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { findRobot, moveBot, parseWarehouse } from "./day_15_model.ts";
import { Direction } from "./Direction.ts";
import { formatMatrix } from "./Matrix.ts";

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
    // console.debug(formatMatrix((s) => s, wh));
    let bot = findRobot(wh);
    for (const d of inst) {
      bot = moveBot(wh, bot, d);
      // console.debug(`\n===== Moving ${d}=====`);
      // console.debug(formatMatrix((s) => s, wh));
    }
    expect(formatMatrix((s) => s, wh)).toEqual(
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
    let bot = findRobot(wh);
    for (const d of inst) {
      bot = moveBot(wh, bot, d);
    }
    console.debug(formatMatrix((s) => s, wh));
    expect(formatMatrix((s) => s, wh)).toEqual(`##########
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
