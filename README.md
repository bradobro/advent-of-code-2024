# Advent of Code 2024

I plan to solve the puzzles in Deno because fit's the standard library I'm fastest with at the moment, though I could probably also reach for Go.

## Repos to Watch

I love computer languages. These repos look interesting:

- Zig: https://github.com/p88h/aoc2024
- Deno Contest: https://github.com/denoland/advent-of-code-2024
- Mix of languages C, Java, Python, Rust: https://github.com/Friends-of-AoC/Advent-of-Code-2024-exchange
- Interesting stats: https://jeroenheijmans.github.io/advent-of-code-surveys/
- Here are some repos with nice Deno answers:
  - https://github.com/mabenj/aoc-deno-ts: I tend to look at this one when I'm done and say, Wow, I should've thought of that. Terse and to the point.

## Thoughts Along the Way

I used some of the exercises to play with iterators and async iterators. I've used them a fair bit in other languages but haven't so much in TypeScript.

I'm also playing with a mix of OOP and bare functions. I hesitate to call anything I do FP because so far I haven't grabbed any libs that would support a more FP approach. I do find myself using reduce() a lot more than I usually do, although sometimes I end up unrolling it into a for...of loop to get better progress insights.

I don't like state-heavy OOP; I tend to use it more for namespacing experiments. On day 11, when I had to iterate on the algorithms for calculating magic stones, I didn't use OOP and wished I had as a way to namespace some approaches. I had one that worked but was too slow to handle part 2. I used the part1 version to test other approaches. I wasn't very creative with names.

I really like the AOC design. The part2 curve balls remind me of the sort of stuff that comes at devs day-to-day, at least in the start ups where I've worked. It's a great exercise in balancing flexible design without overengineering.
