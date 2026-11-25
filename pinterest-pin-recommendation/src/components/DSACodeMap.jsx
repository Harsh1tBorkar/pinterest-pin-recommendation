import React, { useState } from "react";
import { Code2, CheckCircle2, BookOpen } from "lucide-react";

const MODULES = [
    {
        id: "pipeline",
        title: "1. End-to-End Pixie Pipeline",
        file: "src/engine/RecommendationEngine.js",
        complexity: "Retrieval O(V+E) → Ranking O(N log K)",
        analogy:
            "Works like a 3-stage funnel: first gather candidate pins via Graph & Hash Map, score them using Jaccard + Tags + LRU context, then extract the Top-K winners with a Max-Heap.",
        talkingPoints: [
            "Inspired by Pinterest's real-world Pixie graph recommendation architecture.",
            "Combines collaborative filtering (shared boards) with content-based filtering (tags) so new pins and new users never get stuck with a blank feed.",
            "Measures real-time latency using performance.now() in under 1 millisecond.",
        ],
        code: `// Weighted Hybrid Scoring Formula inside RecommendationEngine.js
let rawScore =
  0.55 * gInfo.jaccardScore +   // Bipartite Graph 2-Hop Co-occurrence
  0.35 * tInfo.tagScore +       // Hash Map Inverted Index Tag Overlap
  (matchesUserInterest ? 0.06 : 0) +
  (matchesLiveSession ? 0.04 : 0); // Live LRU Cache Session Boost`,
    },
    {
        id: "graph",
        title: "2. Bipartite Graph & 2-Hop BFS",
        file: "src/ds/BipartiteGraph.js",
        complexity: "Add Edge: O(1) | 2-Hop BFS: O(deg(P) × avg_board_size)",
        analogy:
            "Two separate groups of nodes—Pins on the left, Boards on the right. Edges only connect a Pin to a Board. Jumping Pin → Board → Other Pins finds items humans curated together.",
        talkingPoints: [
            "Stored using two Adjacency Lists (pinToBoards and boardToPins) backed by Hash Maps and Sets.",
            "Uses Jaccard Similarity = |Boards(A) ∩ Boards(B)| / |Boards(A) ∪ Boards(B)| so popular boards don't unfairly dominate scores.",
            "Saving a pin in the UI dynamically adds an undirected edge to the graph in O(1) time.",
        ],
        code: `// 2-Hop BFS Traversal (One-Mode Projection)
for (const boardId of seedBoards) {                  // HOP 1: Pin -> Boards
  const siblingPins = this.boardToPins.get(boardId);
  for (const candidatePinId of siblingPins) {        // HOP 2: Board -> Co-saved Pins
    if (candidatePinId === seedPinId) continue;
    sharedBoardTracker.get(candidatePinId).add(boardId);
  }
}`,
    },
    {
        id: "heap",
        title: "3. Binary Max-Heap (Priority Queue)",
        file: "src/ds/MaxHeap.js",
        complexity: "Insert: O(log N) | ExtractMax: O(log N)",
        analogy:
            "A complete binary tree stored inside a flat array where every parent has a higher recommendation score than its children—so the #1 best pin is always sitting at index 0.",
        talkingPoints: [
            "Avoids sorting the entire catalog when we only need the Top-K pins for the screen.",
            "Uses index math: parent = Math.floor((i - 1) / 2), left = 2i + 1, right = 2i + 2.",
            "bubbleUp() restores heap order on insertion; sinkDown() restores order after popping the root.",
        ],
        code: `extractMax() {
  if (this.heap.length === 1) return this.heap.pop();
  const max = this.heap[0];          // Highest-scoring Pin
  this.heap[0] = this.heap.pop();    // Move last leaf to root
  this.sinkDown(0);                  // Restore Max-Heap property
  return max;
}`,
    },
    {
        id: "trie",
        title: "4. Trie (Prefix Tree) Autocomplete",
        file: "src/ds/Trie.js",
        complexity: "Insert: O(L) | Prefix Search: O(L + M)",
        analogy:
            "A character-by-character decision tree where words sharing a prefix (like 'por' → 'porsche', 'portrait') share the same upper branches.",
        talkingPoints: [
            "Lookup speed depends ONLY on query length L, not on how many thousands of pins exist in the database.",
            "Each end-of-word node stores a frequency counter so more popular tags rank higher in the dropdown.",
        ],
        code: `getSuggestions(prefix) {
  let current = this.root;
  for (const char of prefix) {       // Step 1: Walk prefix in O(L)
    if (!current.children.has(char)) return [];
    current = current.children.get(char);
  }
  const matches = [];
  this._collectWords(current, matches); // Step 2: DFS subtree
  return matches.sort((a, b) => b.frequency - a.frequency);
}`,
    },
    {
        id: "index",
        title: "5. Hash Map Inverted Index",
        file: "src/ds/InvertedIndex.js",
        complexity: "Tag Lookup: O(1) average",
        analogy:
            "Just like the index at the back of a textbook—instead of scanning every page to find 'Porsche', you jump straight to the exact list of Pin IDs.",
        talkingPoints: [
            "Maps every tag string directly to a JavaScript Set of Pin IDs (Map<tag, Set<pinId>>).",
            "Solves the Cold-Start Problem: when a brand-new student signs up with 0 saved boards, the Inverted Index still builds an instant personalized feed from their selected tags.",
        ],
        code: `indexPin(pin) {
  for (const rawTag of pin.tags) {
    const tag = rawTag.toLowerCase().trim();
    if (!this.tagToPins.has(tag)) this.tagToPins.set(tag, new Set());
    this.tagToPins.get(tag).add(pin.id); // O(1) Hash Map insertion
  }
}`,
    },
    {
        id: "lru",
        title: "6. LRU Cache (DLL + Hash Map)",
        file: "src/ds/LRUCache.js",
        complexity: "get(): O(1) | put(): O(1)",
        analogy:
            "A desk tray that holds only your 8 most recently inspected pins. Clicking a pin moves it to the front; when the tray is full, the oldest untouched pin drops off the back.",
        talkingPoints: [
            "Combines a Hash Map (for O(1) node lookup) with a Doubly Linked List (for O(1) pointer rewiring without shifting array elements).",
            "Captures live session intent—if a motorsport fan suddenly clicks two cyberpunk pins, their feed adapts immediately.",
        ],
        code: `put(key, value) {
  if (this.map.has(key)) {
    const node = this.map.get(key);
    this._removeNode(node);
    this._addToFront(node);          // Promote to MRU Head in O(1)
    return;
  }
  if (this.map.size >= this.capacity) {
    const lruNode = this.tail.prev;  // Evict oldest node before tail
    this._removeNode(lruNode);
    this.map.delete(lruNode.key);
  }
}`,
    },
];

export default function DSACodeMap() {
    const [selectedId, setSelectedId] = useState("pipeline");
    const active = MODULES.find((m) => m.id === selectedId) || MODULES[0];

    return (
        <div className="max-w-6xl mx-auto py-4">
            <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 pb-4 mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                            <Code2 className="w-5 h-5 text-red-600" />
                            Interactive DSA Architecture & Viva Walkthrough
                        </h2>
                        <p className="text-xs text-zinc-500 mt-0.5">
                            Select a module below to inspect its Data Structure, Big-O
                            Complexity, and core implementation during evaluation.
                        </p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                        Zero Black-Box ML • 100% Pure Data Structures
                    </span>
                </div>

                {/* Module Selector Pills */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {MODULES.map((mod) => (
                        <button
                            key={mod.id}
                            onClick={() => setSelectedId(mod.id)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${selectedId === mod.id
                                    ? "bg-zinc-900 text-white shadow-xs"
                                    : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                                }`}
                        >
                            {mod.title}
                        </button>
                    ))}
                </div>

                {/* Selected Module Content */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200">
                            <div className="text-[11px] font-bold text-zinc-400 uppercase">
                                Source File & Time Complexity
                            </div>
                            <div className="font-mono text-xs text-red-600 font-bold mt-1">
                                {active.file}
                            </div>
                            <div className="inline-block mt-2 px-2.5 py-1 rounded-md bg-blue-50 text-blue-800 font-mono text-xs font-semibold">
                                {active.complexity}
                            </div>
                        </div>

                        <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200">
                            <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5 mb-1">
                                <BookOpen className="w-4 h-4" /> Real-World Intuition
                            </div>
                            <p className="text-xs text-amber-950 leading-relaxed">
                                {active.analogy}
                            </p>
                        </div>

                        <div>
                            <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider mb-2">
                                Key Points to Explain to Examiners
                            </h4>
                            <ul className="space-y-2">
                                {active.talkingPoints.map((pt, i) => (
                                    <li
                                        key={i}
                                        className="flex items-start gap-2 text-xs text-zinc-700 leading-relaxed"
                                    >
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                        <span>{pt}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Code Preview */}
                    <div className="rounded-2xl bg-slate-950 text-slate-100 p-4 overflow-x-auto flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-2 mb-3">
                                <span>CORE ALGORITHM IMPLEMENTATION</span>
                                <span>JavaScript (ES6)</span>
                            </div>
                            <pre className="text-xs font-mono leading-relaxed text-cyan-200 whitespace-pre-wrap">
                                {active.code}
                            </pre>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}