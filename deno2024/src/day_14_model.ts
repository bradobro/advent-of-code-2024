/* Puzzle 14

This puzzle talks in X,Y coordinates in screen/matrix terms (not cartesian quadrant1).
In terms of my existing Matrix class, Column, Row. To handle this, I could:

- Do a quick-and-dirty solution like most AoC leaders I've seen do.
- Rename Matrix to CartesianMatrix and and inherit a facade from it called ScreenMatrix.
- Add a switch to Matrix to use screen-style X,Y coordinates and, perhaps, flip Direction.N and Direction.S
- Use the existing getRC() functions, or a getCR(x,y) to cut down on programmer errors.
*/
import { Puzzle, Results } from "./Puzzle.ts";
