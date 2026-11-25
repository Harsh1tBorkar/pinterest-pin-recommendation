import React from "react";
import { X, Network, Cpu, Layers, Clock, ArrowRight } from "lucide-react";

export default function GraphXRayDrawer({
    isOpen,
    onClose,
    seedPin,
    xrayData,
    lruItems = [],
}) {
    if (!isOpen || !seedPin || !xrayData) return null;

    const { recommendations = [], xraySubgraph, metrics } = xrayData;
    const boards = xraySubgraph?.boards || [];
    const neighbors = xraySubgraph?.neighbors || [];

    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end">
            <div className="bg-white w-full max-w-2xl h-full overflow-y-auto shadow-2xl border-l border-zinc-200 p-6 flex flex-col gap-6">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-zinc-200 pb-4">
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-50 text-cyan-800 text-xs font-bold mb-1">
                            <Network className="w-3.5 h-3.5" /> ALGORITHM X-RAY INSPECTOR
                        </div>
                        <h2 className="text-xl font-bold text-zinc-900">
                            Why recommendations appeared for "{seedPin.title}"
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Live Telemetry Strip */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200">
                        <div className="text-[11px] font-semibold text-zinc-500 flex items-center gap-1">
                            <Cpu className="w-3.5 h-3.5 text-emerald-600" /> EXECUTION TIME
                        </div>
                        <div className="text-lg font-bold text-zinc-900 mt-0.5">
                            {metrics?.executionTimeMs} ms
                        </div>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200">
                        <div className="text-[11px] font-semibold text-zinc-500 flex items-center gap-1">
                            <Layers className="w-3.5 h-3.5 text-blue-600" /> CANDIDATES SCORED
                        </div>
                        <div className="text-lg font-bold text-zinc-900 mt-0.5">
                            {metrics?.candidatesEvaluated} Pins
                        </div>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200">
                        <div className="text-[11px] font-semibold text-zinc-500 flex items-center gap-1">
                            <Network className="w-3.5 h-3.5 text-orange-600" /> CONNECTED BOARDS
                        </div>
                        <div className="text-lg font-bold text-zinc-900 mt-0.5">
                            {boards.length} Boards
                        </div>
                    </div>
                </div>

                {/* Interactive 3-Stage Bipartite Traversal Diagram */}
                <div className="rounded-2xl border border-zinc-200 bg-slate-950 text-white p-4">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold tracking-wider text-cyan-400 uppercase">
                            2-Hop Bipartite Graph Traversal (One-Mode Projection)
                        </span>
                        <span className="text-[11px] text-slate-400">
                            Pin (U) → Board (V) → Co-Saved Pin (U)
                        </span>
                    </div>

                    {boards.length === 0 ? (
                        <div className="text-xs text-slate-300 py-6 text-center bg-slate-900 rounded-xl">
                            This pin has no saved boards yet. Save it to a board to watch 2-Hop
                            Bipartite edges appear live!
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-3 items-center text-xs">
                            {/* Column 1: Seed Pin */}
                            <div className="bg-blue-600/20 border border-blue-400 rounded-xl p-3">
                                <div className="text-[10px] font-bold text-blue-300 uppercase mb-1">
                                    Seed Pin (Hop 0)
                                </div>
                                <div className="font-semibold text-white leading-snug">
                                    {seedPin.title}
                                </div>
                                <div className="text-[10px] text-blue-200 mt-1">
                                    #{seedPin.tags.slice(0, 2).join(" #")}
                                </div>
                            </div>

                            {/* Column 2: Shared Boards */}
                            <div className="space-y-2">
                                <div className="text-[10px] font-bold text-orange-300 uppercase text-center">
                                    Shared Boards (Hop 1)
                                </div>
                                {boards.map((b) => (
                                    <div
                                        key={b.id}
                                        className="bg-orange-500/20 border border-orange-400 rounded-lg p-2 text-center font-medium text-orange-100 flex items-center justify-between gap-1"
                                    >
                                        <ArrowRight className="w-3 h-3 text-orange-400 shrink-0" />
                                        <span className="truncate">{b.name}</span>
                                        <ArrowRight className="w-3 h-3 text-orange-400 shrink-0" />
                                    </div>
                                ))}
                            </div>

                            {/* Column 3: 2-Hop Recommended Pins */}
                            <div className="space-y-2">
                                <div className="text-[10px] font-bold text-emerald-300 uppercase text-center">
                                    2-Hop Neighbors (Hop 2)
                                </div>
                                {neighbors.slice(0, 4).map((n) => (
                                    <div
                                        key={n.id}
                                        className="bg-emerald-500/20 border border-emerald-400 rounded-lg p-2 text-emerald-100"
                                    >
                                        <div className="font-semibold truncate">{n.title}</div>
                                        <div className="text-[10px] text-emerald-300">
                                            via {n.connectedBoardIds.length} shared board(s)
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Max-Heap Top-K Ranking Math Table */}
                <div>
                    <h3 className="text-sm font-bold text-zinc-900 mb-2">
                        Max-Heap Top-5 Score Breakdown (55% Jaccard + 35% Tags + 10% Session)
                    </h3>
                    <div className="overflow-x-auto border border-zinc-200 rounded-xl">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600">
                                <tr>
                                    <th className="p-2.5">Rank & Pin</th>
                                    <th className="p-2.5">Jaccard (Graph)</th>
                                    <th className="p-2.5">Tag Overlap</th>
                                    <th className="p-2.5">Heap Score</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {recommendations.slice(0, 5).map((rec, idx) => (
                                    <tr key={rec.pin.id} className="hover:bg-zinc-50">
                                        <td className="p-2.5 font-medium text-zinc-900">
                                            <span className="inline-block w-5 text-red-600 font-bold">
                                                #{idx + 1}
                                            </span>
                                            {rec.pin.title}
                                        </td>
                                        <td className="p-2.5 text-zinc-600">
                                            {rec.reasons.jaccardScore} (
                                            {rec.reasons.sharedBoards.length} boards)
                                        </td>
                                        <td className="p-2.5 text-zinc-600">
                                            {rec.reasons.tagScore} (#
                                            {rec.reasons.matchedTags.slice(0, 2).join(", ") || "none"})
                                        </td>
                                        <td className="p-2.5 font-bold text-emerald-700">
                                            {rec.score}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Live LRU Cache Doubly Linked List Strip */}
                <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200">
                    <div className="text-xs font-bold text-zinc-800 flex items-center gap-1.5 mb-2">
                        <Clock className="w-4 h-4 text-purple-600" /> LIVE LRU CACHE (DOUBLY
                        LINKED LIST + HASH MAP — O(1))
                    </div>
                    {lruItems.length === 0 ? (
                        <p className="text-xs text-zinc-500">
                            Click any pin card to insert it at the HEAD (Most Recently Used)
                            of the LRU Cache.
                        </p>
                    ) : (
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="px-2 py-0.5 rounded bg-purple-600 text-white font-bold text-[10px]">
                                HEAD (MRU)
                            </span>
                            {lruItems.map((item) => (
                                <React.Fragment key={item.id}>
                                    <span className="px-2.5 py-1 rounded-lg bg-white border border-zinc-300 font-medium text-zinc-800">
                                        {item.title}
                                    </span>
                                    <span className="text-zinc-400">⇄</span>
                                </React.Fragment>
                            ))}
                            <span className="px-2 py-0.5 rounded bg-zinc-700 text-white font-bold text-[10px]">
                                TAIL (LRU)
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}