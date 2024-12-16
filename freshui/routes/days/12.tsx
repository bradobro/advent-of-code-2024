import { Signal, useSignal } from "@preact/signals";
import Day12Map from "../../islands/Day12Map.tsx";
import { PuzzleModel12 } from "deno2024";

export default function Home() {
  // const model: Signal<PuzzleModel12 | string> = useSignal("Loading model...");

  return (
    <div class="px-4 py-8 mx-auto bg-[#86efac]">
      <Day12Map />
    </div>
  );
}
