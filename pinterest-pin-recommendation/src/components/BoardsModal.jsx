import React, { useState } from "react";
import { X, Folder, Plus, Network } from "lucide-react";
import PinVisual from "./PinVisual.jsx";

export default function BoardsModal({
    isOpen,
    onClose,
    activeUser,
    boards,
    pins,
    onCreateBoard,
    onInspectPin,
}) {
    const [newBoardName, setNewBoardName] = useState("");

    if (!isOpen) return null;

    const userBoards = boards.filter((b) => b.ownerId === activeUser?.id);
    const pinMap = new Map(pins.map((p) => [p.id, p]));

    const handleAddBoard = (e) => {
        e.preventDefault();
        if (!newBoardName.trim()) return;
        onCreateBoard(newBoardName.trim());
        setNewBoardName("");
    };

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl border border-zinc-200"
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-zinc-200 pb-4 mb-5">
                    <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-orange-600">
                            BIPARTITE GRAPH NODE SET V (BOARDS)
                        </div>
                        <h2 className="text-xl font-bold text-zinc-900">
                            {activeUser?.name} — Saved Boards ({userBoards.length})
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Create New Board Form */}
                <form onSubmit={handleAddBoard} className="flex gap-2 mb-6">
                    <input
                        type="text"
                        value={newBoardName}
                        onChange={(e) => setNewBoardName(e.target.value)}
                        placeholder="Create new board node (e.g. Endurance Prototypes)..."
                        className="flex-1 px-4 py-2 rounded-full border border-zinc-300 text-xs outline-none focus:border-red-500"
                    />
                    <button
                        type="submit"
                        className="px-4 py-2 rounded-full bg-zinc-900 hover:bg-black text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                        <Plus className="w-3.5 h-3.5" /> Add Board
                    </button>
                </form>

                {/* User Boards List */}
                {userBoards.length === 0 ? (
                    <div className="text-center py-12 bg-zinc-50 rounded-2xl border border-dashed border-zinc-300">
                        <Folder className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-zinc-700">
                            0 Boards Connected (Cold-Start State)
                        </p>
                        <p className="text-xs text-zinc-500 mt-1 max-w-md mx-auto">
                            Save any Pin from the feed or create a board above to add edges to
                            the Bipartite Graph.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {userBoards.map((board) => {
                            const boardPins = board.pinIds
                                .map((id) => pinMap.get(id))
                                .filter(Boolean);

                            return (
                                <div
                                    key={board.id}
                                    className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                                            <h3 className="font-bold text-sm text-zinc-900">
                                                {board.name}
                                            </h3>
                                        </div>
                                        <span className="text-xs font-semibold text-zinc-500">
                                            {boardPins.length} connected pin edges
                                        </span>
                                    </div>

                                    {boardPins.length === 0 ? (
                                        <p className="text-xs text-zinc-400 italic">
                                            No pins saved in this board yet.
                                        </p>
                                    ) : (
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            {boardPins.map((pin) => (
                                                <div
                                                    key={pin.id}
                                                    onClick={() => {
                                                        onClose();
                                                        onInspectPin(pin);
                                                    }}
                                                    className="group rounded-xl overflow-hidden bg-white border border-zinc-200 cursor-pointer hover:shadow-md transition"
                                                >
                                                    <div className="h-24 relative">
                                                        <PinVisual pin={pin} />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                                            <span className="text-[10px] font-bold text-white inline-flex items-center gap-1 bg-black/75 px-2 py-1 rounded-full">
                                                                <Network className="w-3 h-3 text-cyan-400" />{" "}
                                                                X-Ray
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="p-2">
                                                        <p className="text-[11px] font-semibold text-zinc-800 truncate">
                                                            {pin.title}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}