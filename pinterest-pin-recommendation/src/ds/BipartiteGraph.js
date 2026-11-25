/**
 * DATA STRUCTURE: Undirected Bipartite Graph (Adjacency List)
 * PURPOSE: Models relationships between two disjoint sets: Pins (U) and Boards (V).
 * ALGORITHM: 2-Hop Breadth-First Search (One-Mode Projection) + Jaccard Similarity.
 * COMPLEXITY:
 * - Add Edge: O(1) average
 * - 2-Hop Recommendation Traversal: O(deg(pin) * avg_board_size)
 */
export class BipartiteGraph {
    constructor() {
        // Adjacency Lists using Hash Maps + Sets for O(1) edge lookup
        this.pinToBoards = new Map(); // pinId -> Set<boardId>
        this.boardToPins = new Map(); // boardId -> Set<pinId>

        // Metadata stores for fast node label lookup in X-Ray visualizer
        this.pins = new Map();        // pinId -> Pin Object
        this.boards = new Map();      // boardId -> Board Object
    }

    addPin(pin) {
        this.pins.set(pin.id, pin);
        if (!this.pinToBoards.has(pin.id)) {
            this.pinToBoards.set(pin.id, new Set());
        }
    }

    addBoard(board) {
        this.boards.set(board.id, board);
        if (!this.boardToPins.has(board.id)) {
            this.boardToPins.set(board.id, new Set());
        }
    }

    // Connects a Pin node and a Board node (Undirected Bipartite Edge)
    addEdge(pinId, boardId) {
        if (!this.pinToBoards.has(pinId)) this.pinToBoards.set(pinId, new Set());
        if (!this.boardToPins.has(boardId)) this.boardToPins.set(boardId, new Set());

        this.pinToBoards.get(pinId).add(boardId);
        this.boardToPins.get(boardId).add(pinId);
    }

    getBoardsForPin(pinId) {
        return Array.from(this.pinToBoards.get(pinId) || []);
    }

    getPinsForBoard(boardId) {
        return Array.from(this.boardToPins.get(boardId) || []);
    }

    /**
     * 2-HOP BFS TRAVERSAL (Pin -> Shared Boards -> Co-Saved Pins)
     * Finds pins saved alongside seedPinId and scores them via Jaccard Similarity:
     * J(A, B) = |Boards(A) ∩ Boards(B)| / |Boards(A) ∪ Boards(B)|
     */
    getTwoHopNeighbors(seedPinId) {
        const seedBoards = this.pinToBoards.get(seedPinId);
        const results = new Map(); // candidatePinId -> { jaccardScore, sharedCount, sharedBoardNames }

        if (!seedBoards || seedBoards.size === 0) return results;

        // Track shared board names for each candidate pin
        const sharedBoardTracker = new Map(); // candidatePinId -> Set<boardId>

        // HOP 1: Visit every Board connected to the clicked Pin
        for (const boardId of seedBoards) {
            const siblingPins = this.boardToPins.get(boardId) || new Set();

            // HOP 2: Visit every other Pin saved on that same Board
            for (const candidatePinId of siblingPins) {
                if (candidatePinId === seedPinId) continue; // Skip the seed pin itself

                if (!sharedBoardTracker.has(candidatePinId)) {
                    sharedBoardTracker.set(candidatePinId, new Set());
                }
                sharedBoardTracker.get(candidatePinId).add(boardId);
            }
        }

        // Compute Jaccard Similarity for every reached candidate
        for (const [candidatePinId, sharedSet] of sharedBoardTracker.entries()) {
            const candidateBoards = this.pinToBoards.get(candidatePinId) || new Set();
            const intersectionSize = sharedSet.size;
            const unionSize = seedBoards.size + candidateBoards.size - intersectionSize;
            const jaccardScore = unionSize > 0 ? intersectionSize / unionSize : 0;

            const sharedBoardNames = Array.from(sharedSet).map(
                (bId) => this.boards.get(bId)?.name || bId
            );

            results.set(candidatePinId, {
                jaccardScore,
                sharedCount: intersectionSize,
                sharedBoardNames,
            });
        }

        return results;
    }

    /**
     * Builds a clean subgraph snapshot for the live "Algorithm X-Ray" visualizer
     */
    getXRaySubgraph(seedPinId, topCandidateIds = []) {
        const seedBoardIds = this.getBoardsForPin(seedPinId);
        const candidateSet = new Set(topCandidateIds.slice(0, 5));

        const boards = seedBoardIds.map((bId) => ({
            id: bId,
            name: this.boards.get(bId)?.name || bId,
        }));

        const neighbors = [];
        for (const cId of candidateSet) {
            const cBoards = this.getBoardsForPin(cId).filter((bId) => seedBoardIds.includes(bId));
            neighbors.push({
                id: cId,
                title: this.pins.get(cId)?.title || cId,
                connectedBoardIds: cBoards,
            });
        }

        return {
            seedPin: this.pins.get(seedPinId),
            boards,
            neighbors,
        };
    }
}