import { BipartiteGraph } from "../ds/BipartiteGraph.js";
import { MaxHeap } from "../ds/MaxHeap.js";
import { Trie } from "../ds/Trie.js";
import { InvertedIndex } from "../ds/InvertedIndex.js";
import { LRUCache } from "../ds/LRUCache.js";

/**
 * RECOMMENDATION PIPELINE ORCHESTRATOR (Inspired by Pinterest's Pixie Engine)
 * Stage 1: Candidate Retrieval (Bipartite Graph 2-Hop BFS + Inverted Index Hash Map)
 * Stage 2: Hybrid Scoring & Session Context (Jaccard + Tag Overlap + LRU Cache)
 * Stage 3: Top-K Ranking (Binary Max-Heap Priority Queue)
 */
export class RecommendationEngine {
    constructor(pins = [], boards = []) {
        this.initialize(pins, boards);
    }

    initialize(pins, boards) {
        this.graph = new BipartiteGraph();
        this.index = new InvertedIndex();
        this.trie = new Trie();
        this.sessionCache = new LRUCache(8);
        this.pinCatalog = new Map();

        // 1. Load all Pins into Catalog, Bipartite Graph, Inverted Index, and Trie
        for (const pin of pins) {
            this.addNewPin(pin);
        }

        // 2. Load all Boards and wire Pin <-> Board edges in the Bipartite Graph
        for (const board of boards) {
            this.graph.addBoard(board);
            for (const pinId of board.pinIds) {
                this.graph.addEdge(pinId, board.id);
            }
        }
    }

    // Dynamically index a newly uploaded Pin across Graph, Hash Map, and Trie
    addNewPin(pin) {
        this.pinCatalog.set(pin.id, pin);
        this.graph.addPin(pin);
        this.index.indexPin(pin);

        for (const tag of pin.tags) {
            this.trie.insert(tag, 1);
        }
    }

    // Record a user click inside the O(1) LRU Cache
    recordPinInteraction(pin) {
        if (pin) {
            this.sessionCache.put(pin.id, pin);
        }
    }

    // Dynamically add a new Pin <-> Board edge when user clicks "Save to Board"
    savePinToBoard(pinId, board) {
        if (!this.graph.boards.has(board.id)) {
            this.graph.addBoard(board);
        }
        this.graph.addEdge(pinId, board.id);
    }

    searchAutocomplete(prefix) {
        return this.trie.getSuggestions(prefix, 6);
    }

    /**
     * "MORE LIKE THIS" ENGINE (Triggered when clicking any Pin)
     */
    recommendForPin(seedPin, activeUser = null, topK = 12) {
        const startTime = performance.now();

        // STAGE 1: Candidate Retrieval
        const graphNeighbors = this.graph.getTwoHopNeighbors(seedPin.id);
        const tagNeighbors = this.index.getTagCandidates(seedPin.tags, seedPin.id);

        const allCandidateIds = new Set([
            ...graphNeighbors.keys(),
            ...tagNeighbors.keys(),
        ]);

        const sessionTags = this.sessionCache.getSessionTags();
        const userFavTags = new Set(
            (activeUser?.favoriteTags || []).map((t) => t.toLowerCase())
        );

        // STAGE 2: Hybrid Scoring + Push into Max-Heap
        const maxHeap = new MaxHeap();

        for (const candidateId of allCandidateIds) {
            const candidatePin = this.pinCatalog.get(candidateId);
            if (!candidatePin) continue;

            const gInfo = graphNeighbors.get(candidateId) || {
                jaccardScore: 0,
                sharedBoardNames: [],
            };
            const tInfo = tagNeighbors.get(candidateId) || {
                tagScore: 0,
                matchedTags: [],
            };

            const matchesUserInterest = candidatePin.tags.some((t) =>
                userFavTags.has(t.toLowerCase())
            );
            const matchesLiveSession = candidatePin.tags.some((t) =>
                sessionTags.has(t.toLowerCase())
            );

            let rawScore =
                0.55 * gInfo.jaccardScore +
                0.35 * tInfo.tagScore +
                (matchesUserInterest ? 0.06 : 0) +
                (matchesLiveSession ? 0.04 : 0);

            if (this.sessionCache.has(candidateId)) {
                rawScore *= 0.85;
            }

            const finalScore = Number(Math.min(rawScore, 0.99).toFixed(2));

            maxHeap.insert({
                pinId: candidateId,
                score: finalScore,
                payload: {
                    pin: candidatePin,
                    score: finalScore,
                    reasons: {
                        jaccardScore: Number(gInfo.jaccardScore.toFixed(2)),
                        tagScore: Number(tInfo.tagScore.toFixed(2)),
                        sharedBoards: gInfo.sharedBoardNames,
                        matchedTags: tInfo.matchedTags,
                        sessionBoost: matchesLiveSession,
                        recentlyViewed: this.sessionCache.has(candidateId),
                    },
                },
            });
        }

        // STAGE 3: Extract Top-K highest-scoring recommendations from Max-Heap
        const recommendations = [];
        while (!maxHeap.isEmpty() && recommendations.length < topK) {
            recommendations.push(maxHeap.extractMax().payload);
        }

        const endTime = performance.now();
        const executionTimeMs = Math.max(endTime - startTime, 0.05).toFixed(2);

        return {
            recommendations,
            xraySubgraph: this.graph.getXRaySubgraph(
                seedPin.id,
                recommendations.map((r) => r.pin.id)
            ),
            metrics: {
                executionTimeMs,
                candidatesEvaluated: allCandidateIds.size,
            },
        };
    }

    /**
     * PERSONALIZED HOME FEED (Supports both Returning Users & Cold-Start New Users)
     */
    recommendHomeFeed(activeUser, allBoards = [], topK = 32) {
        const startTime = performance.now();
        const userBoards = allBoards.filter((b) => b.ownerId === activeUser?.id);
        const savedPinIds = new Set(userBoards.flatMap((b) => b.pinIds));

        const aggregatedGraph = new Map();
        for (const savedId of savedPinIds) {
            const neighbors = this.graph.getTwoHopNeighbors(savedId);
            for (const [candId, info] of neighbors.entries()) {
                if (savedPinIds.has(candId)) continue;
                const prev = aggregatedGraph.get(candId) || {
                    jaccardScore: 0,
                    sharedBoardNames: new Set(),
                };
                prev.jaccardScore = Math.max(prev.jaccardScore, info.jaccardScore);
                info.sharedBoardNames.forEach((name) => prev.sharedBoardNames.add(name));
                aggregatedGraph.set(candId, prev);
            }
        }

        const tagCandidates = this.index.getTagCandidates(activeUser?.favoriteTags || []);
        const sessionTags = this.sessionCache.getSessionTags();
        const maxHeap = new MaxHeap();

        for (const [pinId, pin] of this.pinCatalog.entries()) {
            const gInfo = aggregatedGraph.get(pinId);
            const tInfo = tagCandidates.get(pinId);
            const sessionMatch = pin.tags.some((t) => sessionTags.has(t.toLowerCase()));

            const isColdStart = savedPinIds.size === 0;
            let score = isColdStart
                ? (tInfo?.tagScore || 0.1) * 0.85 + (sessionMatch ? 0.15 : 0)
                : (gInfo?.jaccardScore || 0) * 0.55 +
                (tInfo?.tagScore || 0) * 0.35 +
                (sessionMatch ? 0.1 : 0);

            score += Math.min(pin.saveCount / 1000, 0.08);
            if (this.sessionCache.has(pinId)) score *= 0.9;

            const finalScore = Number(Math.min(score, 0.99).toFixed(2));

            maxHeap.insert({
                pinId,
                score: finalScore,
                payload: {
                    pin,
                    score: finalScore,
                    reasons: {
                        jaccardScore: Number((gInfo?.jaccardScore || 0).toFixed(2)),
                        tagScore: Number((tInfo?.tagScore || 0).toFixed(2)),
                        sharedBoards: gInfo ? Array.from(gInfo.sharedBoardNames) : [],
                        matchedTags: tInfo?.matchedTags || [],
                        sessionBoost: sessionMatch,
                        isColdStartFallback: isColdStart,
                    },
                },
            });
        }

        const feed = [];
        while (!maxHeap.isEmpty() && feed.length < topK) {
            feed.push(maxHeap.extractMax().payload);
        }

        const endTime = performance.now();
        return {
            feed,
            metrics: {
                executionTimeMs: Math.max(endTime - startTime, 0.08).toFixed(2),
                candidatesEvaluated: this.pinCatalog.size,
                mode: savedPinIds.size === 0 ? "Cold-Start Tag Index" : "Hybrid Bipartite Graph + Heap",
            },
        };
    }
}