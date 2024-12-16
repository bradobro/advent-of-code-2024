import { Day12, PuzzleModel12 } from "@scope/deno2024";

import { Handlers } from "$fresh/server.ts";

interface Day12State {
  generation: 0;
  solver: Day12;
  model: PuzzleModel12;
}

let _state: Day12State;

async function ensureState(): Promise<Day12State> {
  if (!_state) {
    const solver = new Day12();
    const model = await solver.load();
    _state = { solver, model, generation: 0 };
  }
  return _state;
}

export const handler: Handlers = {
  async GET(_req, _ctx) {
    const { model } = await ensureState();
    return new Response(JSON.stringify(model), { status: 200 });
  },
  async POST(req, _ctx) {
    const form = await req.formData();
    const _email = form.get("email")?.toString();

    // Add email to list.

    // Redirect user to thank you page.
    const headers = new Headers();
    headers.set("location", "/thanks-for-subscribing");
    return new Response(null, {
      status: 303, // See Other
      headers,
    });
  },
};
