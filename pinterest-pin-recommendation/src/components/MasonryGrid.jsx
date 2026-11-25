import React from "react";
import { Bookmark, Check, Network, Sparkles } from "lucide-react";
import PinVisual from "./PinVisual.jsx";

function PinCard({ item, isSaved, onSelectPin, onSavePin, onInspectPin }) {
    const { pin, score, reasons } = item;

    const primaryReason =
        reasons?.sharedBoards?.length > 0
            ? `Board: ${reasons.sharedBoards[0]}`
            : reasons?.matchedTags?.length > 0
                ? `Tags: #${reasons.matchedTags.slice(0, 2).join(" #")}`
                : "Popular Discovery";

    return (
        <div className="break-inside-avoid mb-4 group relative rounded-2xl overflow-hidden bg-white border border-zinc-200/80 shadow-xs hover:shadow-lg transition-all duration-200">
            {/* Thematic Vector Artwork */}
            <div
                onClick={() => onSelectPin(pin)}
                className={`relative w-full ${pin.aspectClass || "h-64"} cursor-pointer overflow-hidden`}
            >
                <div className="w-full h-full group-hover:scale-105 transition-transform duration-300">
                    <PinVisual pin={pin} />
                </div>

                {/* Top Hover Controls */}
                <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-between">
                    <div className="flex items-center justify-between gap-2">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onInspectPin(pin);
                            }}
                            className="px-2.5 py-1.5 rounded-full bg-zinc-900/90 hover:bg-black text-white text-[11px] font-semibold inline-flex items-center gap-1 shadow cursor-pointer"
                            title="Open Algorithm X-Ray for this Pin"
                        >
                            <Network className="w-3 h-3 text-cyan-400" /> X-Ray
                        </button>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onSavePin(pin);
                            }}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-bold inline-flex items-center gap-1 shadow cursor-pointer transition ${isSaved
                                    ? "bg-zinc-900 text-white"
                                    : "bg-red-600 hover:bg-red-700 text-white"
                                }`}
                        >
                            {isSaved ? (
                                <>
                                    <Check className="w-3.5 h-3.5" /> Saved
                                </>
                            ) : (
                                <>
                                    <Bookmark className="w-3.5 h-3.5" /> Save
                                </>
                            )}
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-full bg-black/75 text-white text-[11px] font-semibold">
                            Heap Score: {Math.round((score || 0.5) * 100)}%
                        </span>
                    </div>
                </div>
            </div>

            {/* Card Footer Metadata */}
            <div className="p-3">
                <h3
                    onClick={() => onSelectPin(pin)}
                    className="font-semibold text-zinc-900 text-sm leading-snug hover:text-red-600 cursor-pointer line-clamp-2"
                >
                    {pin.title}
                </h3>

                <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 truncate">
                        <Sparkles className="w-3 h-3 text-red-500 shrink-0" />
                        <span className="truncate">{primaryReason}</span>
                    </span>

                    <button
                        onClick={() => onInspectPin(pin)}
                        className="text-[11px] font-semibold text-blue-600 hover:underline shrink-0 cursor-pointer"
                    >
                        Why?
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function MasonryGrid({
    items = [],
    savedPinIds = new Set(),
    onSelectPin,
    onSavePin,
    onInspectPin,
}) {
    if (items.length === 0) {
        return (
            <div className="text-center py-16 bg-white rounded-2xl border border-zinc-200">
                <p className="text-zinc-500 text-sm">No matching pins found.</p>
            </div>
        );
    }

    return (
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4">
            {items.map((item) => (
                <PinCard
                    key={item.pin.id}
                    item={item}
                    isSaved={savedPinIds.has(item.pin.id)}
                    onSelectPin={onSelectPin}
                    onSavePin={onSavePin}
                    onInspectPin={onInspectPin}
                />
            ))}
        </div>
    );
}