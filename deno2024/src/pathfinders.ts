// various pathfinding algorithms

/**
 * Dijkstrable objects lend themselves to a family of pathfinding and
 * graph-traversal algorithms. I'll use the word "cheapest" below to describe
 * these algorithms because they are technically cost-based algorithms, though
 * in traditional pathfinding, "cost" means "distance" or "travel time."
 *
 * It's presumed that the pathfinder will store some state while
 * executing--typically a priority-queue of nodes to explore and a map or graph
 * of neighbors.
 *
 * It's also typical for nodes to be small-ish id's (keys into a Map or indexes
 * into an array) of Node objects that can record their cost information, their
 * from-nodes, etc., and that in the course of searching, we may revise the best
 * cost and from-node (of yet-unexplored nodes.) FlatMatrix.xy2i and .i2xy are one way to do this,
 * as is `${x},${y},${z}
 *
 * [Dijkstra's Algorithm](https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm):
 * finds the cheapest path from one source node to every other node in the
 * graph. **Summary**: starting at the source node, whose cost to "reach" itself
 * is 0, explore all neighbors: push each (unexplored) immediately reachable node
 * ("neighbor") onto a priority-queue the node it came from (from-node) and it's
 * cost (from-node's plus the cost from the from node). If a lower cost is
 * found, the from-node and cost replace the existing. If it matches lowest
 * cost, some applications may add it to the list of optimal from-nodes.
 */
export interface Dijkstrable<Node> {
  /**
   * Decide whether to finish the search. This might be decided simply by coordinates of the node,
   * but could also depend on state within the search, such as whether all reachable nodes have been searched.
   * @param n the node we have just reached
   * @returns true if we should stop the search
   */
  isDone: (n: Node) => void; // if we've just reached a node, are we finished?
  /**
   * Store a node for later exploration, revising it's stored optimal path information if needed, depending on
   * the algorithm. Typically:
   * - only for already unexplored nodes
   * - if a lower cost has been found, replacing cost and from-node
   * - for multiple solution applications, if the same (or similar) cost has been found, adding from-nodes
   *
   * @param n The node we've traveled too
   * @param from the node we've traveled from
   * @param cost the cost to travel from that node
   */
  push: (n: Node, from: Node, cost: number) => void; // store a node we later want to search from
  more: () => boolean; // true if we can pop another node
  pop: () => Node; // get the next node to explore
  mark: (n: Node) => void; // mark a node as explored
  neighbors: (n: Node) => Node[];
  /**
   * A* just adds estimated cost to finish; straight Dijkstra adds only travel cost
   * @param from
   * @param to
   * @returns
   */
  costFrom: (from: Node, to: Node) => number;
  /**
   * Used to realize a single optimal path
   * @param destination
   * @returns null if we're at the start
   */
  from?: (destination: Node) => Node | null;
  /**
   * Used to realize multiple (usually all) optimal paths
   * @param destination
   * @returns
   */
  froms?: (destination: Node) => Node[];
}

export class DijkstrasPathfinder<Node> {
  debug = false;

  constructor(readonly world: Dijkstrable<Node>) {}

  //===== Main Interface
  exploreAll(start: Node) {
    this.world.push(start, start, 0);
    for (const exploredNode of this.iterExplore()) {
      if (this.debug) {
        console.debug(`explored node ${exploredNode}`);
      }
    }
    // when finished, this.world should have stored the cost of the shortest
    // path(s) in the finish node.
  }

  // driving the explorations interatively can be helpful for handling maps that change,
  // for instance, one that gains obstacles after each move.
  *iterExplore(): Generator<Node> {
    while (this.world.more()) {
      const from = this.world.pop();
      yield this.exploreNode(from);
    }
  }

  reportPath(destination: Node): Node[] {
    const getFrom = this.world.from?.bind(this);
    if (!getFrom) {
      throw new Error(
        `this world cannot materialize a single optimal path because it doesn't implement .from(Node);`,
      );
    }
    const result: Node[] = [];
    let current = destination;
    while (true) {
      result.push(current);
      const prev = getFrom(current);
      // if we've reached the start node, we're done
      if (prev === null) break; // only the start node originates from itself
      current = prev;
    }
    result.reverse();
    return result;
  }

  // UNTESTED
  reportPaths(dest: Node): Node[][] {
    if (this.world.froms) {
      const froms = this.world.froms(dest);
      // ending condition: we found the single start
      if (froms.length < 1) return [[dest]]; // we found the start

      // recursive condition, we materialize all subpaths
      // I THINK we can build these in correct order, but test it
      // against reportPath()
      return this.reportPaths(dest).map((prepath) => [...prepath, dest]);
    } else {
      throw new Error(
        `no .froms(Node) implemented, so this world can't materialzed multiple paths`,
      );
    }
  }

  //===== Helpers
  exploreNode(from: Node) {
    this.world.mark(from);
    for (const dest of this.world.neighbors(from)) {
      this.world.push(dest, from, this.world.costFrom(from, dest));
    }
    return from;
  }
}
