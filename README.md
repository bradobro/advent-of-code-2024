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
  - https://github.com/davidanastasov/advent-of-code

## Thoughts Along the Way

I used some of the exercises to play with iterators and async iterators. I've used them a fair bit in other languages but haven't so much in TypeScript.

I'm also playing with a mix of OOP and bare functions. I hesitate to call anything I do FP because so far I haven't grabbed any libs that would support a more FP approach. I do find myself using reduce() a lot more than I usually do, although sometimes I end up unrolling it into a for...of loop to get better progress insights.

I don't like state-heavy OOP; I tend to use it more for namespacing experiments. On day 11, when I had to iterate on the algorithms for calculating magic stones, I didn't use OOP and wished I had as a way to namespace some approaches. I had one that worked but was too slow to handle part 2. I used the part1 version to test other approaches. I wasn't very creative with names.

I really like the AOC design. The part2 curve balls remind me of the sort of stuff that comes at devs day-to-day, at least in the start ups where I've worked. It's a great exercise in balancing flexible design without overengineering.

### Day 12b

This is the first time I've been baffled. I haven't read other solutions in detail yet, though I skimmed the Reddit one that mentions complex numbers.

Today I added some visualization. A couple things I notice:

- Deno console.log coloring does NOT use ANSI coloration, so I can't use `less -R` to explore. Might have to work in sliced quadrants instead.
- There were some islands my algorithm missed:
  - islands butting against each other (not really islands, but their collective sides needs to be added to the engulfing region's side count). l130c90. Looking closer, it's not really engulfed, but grouped "islands" would fool my algorithm.
  - at least one true island it just plain missed---nope, on closer examination, my colorization tricked me into seeing an island, but it wasn't

Thoughts: the "islands" algorithm doesn't handle multiple adjoined regions engulfed by another region, but I don't spot any of those in the puzzle. I think a spans approach might work better, otherwise I'm going to have to scout for other algorithms.

My hunch is I'm adding too many sides in for islands.

I could spot-check some regions with islands and some of the larger regions.
