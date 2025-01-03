import { useSignal } from "@preact/signals";
import Counter from "../islands/Counter.tsx";

export default function Home() {
  const count = useSignal(3);
  return (
    <div class="">
      <div class="">
        <Counter count={count} />
      </div>
    </div>
  );
}
