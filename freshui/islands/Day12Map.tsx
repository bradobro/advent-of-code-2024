import { useSignal, type Signal } from "@preact/signals";
import { Button } from "../components/Button.tsx";
import { FieldMap12, Loc12, PuzzleModel12 } from "deno2024";
import { createElement } from "https://esm.sh/v128/preact@10.22.0/src/index.js";

// interface CounterProps {
//   model: Signal<PuzzleModel12 | string>;
// }

async function getModel(): Promise<PuzzleModel12 | string> {
  try {
    console.debug("trying to load data");
    const rsp = await fetch("/api/days/12data");
    if (rsp.status !== 200) {
      console.error("got an error", rsp);
      return "error: " + rsp.statusText;
    }
    console.debug("got response");
    const data = (await rsp.json()) as PuzzleModel12;
    return data;
  } catch (err) {
    console.error(err);
    return "error fetching data";
  }
}

export default function Day12Map() {
  const model: Signal<PuzzleModel12 | string> = useSignal(
    "waiting in component"
  );
  let MapDisplay = <div>{model.value}</div>;
  if (typeof model.value !== "string") {
    const rows: createElement.JSX.Element[] = [];
    console.debug(model.value);
    const grid = model.value.grid.store;
    for (const row of grid) {
      const cells = row.map((loc: Loc12, i: number) => (
        <td key={i}>{loc.crop}</td>
      ));
      rows.push(<tr>{cells}</tr>);
    }
    console.debug("updating map display");
    MapDisplay = (
      <div>
        <table>{rows}</table>
      </div>
    );
  }

  return (
    <div class="">
      <Button onClick={() => (model.value = "Clicked the non-async button")}>
        new text
      </Button>
      <Button onClick={() => getModel().then((d) => (model.value = d))}>
        Load
      </Button>

      {MapDisplay}
    </div>
  );
}
