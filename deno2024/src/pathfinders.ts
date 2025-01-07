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
 * cost and from-node (of yet-unexplored nodes.) FlatMatrix.xy2i and .i2xy are
 * one way to do this, as is `${x},${y},${z}
 *
 * THIS IS WHY I name the generic type NodeId instead of Node. Mostly to remind
 * myself (because I use this infrequently) that typically we'll keep node
 * details in some other data structure and manipulate only the ids in the
 * Dijkstra Algorithm.
 */
export interface Dijkstrable<NodeId>
  extends Iterable<NodeId>, Iterator<NodeId> {
  /**
   * Decide whether to finish the search. This might be decided simply by coordinates of the node,
   * but could also depend on state within the search, such as whether all reachable nodes have been searched.
   * @param n the node we have just reached
   * @returns true if we should stop the search
   */
  isDone: (n: NodeId) => void; // if we've just reached a node, are we finished?
  /**
   * Store a node for later exploration, revising it's stored optimal path information if needed, depending on
   * the algorithm. Typically:
   * - only for already unexplored nodes
   * - if a lower cost has been found, replacing cost and from-node
   * - for multiple solution applications, if the same (or similar) cost has been found, adding from-nodes
   *
   * @param n The node we've traveled too
   * @param from the node we've traveled from
   * @param cost the cost to travel from start to n
   */
  push: (n: NodeId, from: NodeId, cost: number) => void; // store a node we later want to search from
  mark: (n: NodeId) => void; // mark a node as explored
  /**
   * @param n Visitable neighbors
   * @returns
   */
  neighbors: (n: NodeId) => NodeId[];
  /**
   * travel cost from one node to the other
   * for a*, don't add estimate here, add when sorting pqueue
   * @param from
   * @param to
   * @returns
   */
  costFrom: (from: NodeId, to: NodeId) => number;
  /**
   * @param id Node
   * @returns [cost, explored, open, froms] where
   *    cost: cost to travel from start to this node)
   *    explored: whether this node has been explored already
   *    open: whether this node can be traveled
   *    froms: Iterator of nodes to travel from for resultant cost)
   */
  statNode: (id: NodeId) => [number, boolean, boolean, Iterable<NodeId>];
}

/**
 * [Dijkstra's Algorithm](https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm):
 * finds the cheapest path from one source node to every other node in the
 * graph. **Summary**: starting at the source node, whose cost to "reach" itself
 * is 0, explore all neighbors: push each (unexplored) immediately reachable
 * node ("neighbor") onto a priority-queue the node it came from (from-node) and
 * it's cost (from-node's plus the cost from the from node). If a lower cost is
 * found, the from-node and cost replace the existing. If it matches lowest
 * cost, some applications may add it to the list of optimal from-nodes.
 *
 * Notice that this class will also run an A* algorithm if you sort the pQueue
 * (usually updated with world.push()) not by the cost to reach the node but
 * that cost PLUS estimated cost to goal and finish (world.isDone()) when the
 * goal is reached, not when the queue is depleted.
 */
export class DijkstrasPathfinder<NodeId> {
  debug = false;

  constructor(readonly world: Dijkstrable<NodeId>) {}

  //===== Main Interface
  exploreAll(start: NodeId) {
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
  *iterExplore(): Generator<NodeId> {
    for (const n of this.world) {
      yield this.exploreNode(n);
    }
  }

  reportPath(start: NodeId, finish: NodeId): NodeId[] {
    const result = Array.from(this.walkBack(start, finish));
    result.reverse();
    return result;
  }

  /**
   * Iterate all the best paths
   * @param start
   * @param finish
   */
  *iterAllPaths(start: NodeId, finish: NodeId): Generator<NodeId[]> {
    const path: NodeId[] = this.reportPath(start, finish); // dummy
    yield path;
    // stack or recurse?
    let cur = finish;
    while (true) {
      yield [cur];
    }
  }

  //===== Helpers
  exploreNode(from: NodeId) {
    this.world.mark(from);
    const costToFrom = this.world.statNode(from)[0];
    for (const dest of this.world.neighbors(from)) {
      this.world.push(
        dest,
        from,
        costToFrom + this.world.costFrom(from, dest),
      );
    }
    return from;
  }

  *walkBack(start: NodeId, finish: NodeId): Generator<NodeId> {
    let cur = finish;
    while (true) {
      yield cur;
      if (cur === start) break;
      const froms = this.world.statNode(cur)[3];
      // get the first from or break
      const { value, done } = froms[Symbol.iterator]().next();
      if (done) break;
      cur = value;
    }
  }
}
