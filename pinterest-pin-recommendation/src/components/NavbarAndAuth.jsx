import React, { useState } from "react";
import {
    Search,
    Sparkles,
    Code2,
    UserPlus,
    Users,
    RotateCcw,
    Zap,
    X,
    Check,
} from "lucide-react";

export default function NavbarAndAuth({
    users,
    activeUser,
    onSwitchUser,
    onCreateUser,
    onResetDemo,
    searchQuery,
    onSearchChange,
    trieSuggestions,
    onSelectTag,
    activeTab,
    setActiveTab,
    metrics,
    availableTags,
}) {
    const [showDropdown, setShowDropdown] = useState(false);
    const [showSignupModal, setShowSignupModal] = useState(false);
    const [newName, setNewName] = useState("");
    const [selectedTags, setSelectedTags] = useState(["motorsport", "cyberpunk"]);

    const toggleSignupTag = (tag) => {
        setSelectedTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag].slice(0, 4)
        );
    };

    const handleSignupSubmit = (e) => {
        e.preventDefault();
        if (!newName.trim() || selectedTags.length === 0) return;
        onCreateUser(newName.trim(), selectedTags);
        setNewName("");
        setShowSignupModal(false);
    };

    return (
        <>
            <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-zinc-200 px-4 py-3 shadow-xs">
                <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
                    {/* Brand Title */}
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-red-600 text-white font-bold flex items-center justify-center text-lg shadow-xs">
                            P
                        </div>
                        <div>
                            <h1 className="font-bold text-zinc-900 text-base sm:text-lg leading-tight">
                                Pinterest - Pin recommendation
                            </h1>
                            <div className="flex items-center gap-2 text-xs text-zinc-500">
                                <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                                    <Zap className="w-3 h-3" /> {metrics?.executionTimeMs || "0.12"} ms
                                </span>
                                <span>•</span>
                                <span className="truncate max-w-[180px] sm:max-w-none">
                                    {metrics?.mode || "Hybrid Graph + Heap"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Trie Autocomplete Search Bar */}
                    <div className="relative flex-1 min-w-[220px] max-w-md order-3 md:order-2 w-full">
                        <div className="relative flex items-center">
                            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5" />
                            <input
                                type="text"
                                value={searchQuery}
                                onFocus={() => setShowDropdown(true)}
                                onBlur={() => setTimeout(() => setShowDropdown(false), 180)}
                                onChange={(e) => {
                                    onSearchChange(e.target.value);
                                    setShowDropdown(true);
                                }}
                                placeholder="Trie Search: try 'por', 'min', 'cyb', 'sne'..."
                                className="w-full pl-10 pr-8 py-2 bg-zinc-100 hover:bg-zinc-200/70 focus:bg-white border border-transparent focus:border-red-500 rounded-full text-sm outline-none transition"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => onSearchChange("")}
                                    className="absolute right-3 text-zinc-400 hover:text-zinc-700"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Live Trie Prefix Suggestions Dropdown */}
                        {showDropdown && searchQuery.trim() && (
                            <div className="absolute left-0 right-0 mt-1.5 bg-white border border-zinc-200 rounded-2xl shadow-xl overflow-hidden z-40">
                                <div className="px-3 py-1.5 bg-zinc-50 border-b border-zinc-100 text-[11px] font-semibold text-zinc-500 flex justify-between">
                                    <span>TRIE PREFIX MATCHES (O(L) LOOKUP)</span>
                                    <span>FREQ</span>
                                </div>
                                {trieSuggestions.length > 0 ? (
                                    trieSuggestions.map((item) => (
                                        <button
                                            key={item.word}
                                            onMouseDown={() => {
                                                onSelectTag(item.word);
                                                setShowDropdown(false);
                                            }}
                                            className="w-full px-3.5 py-2 text-left text-sm hover:bg-red-50 flex items-center justify-between transition"
                                        >
                                            <span className="font-medium text-zinc-800">
                                                #{item.word}
                                            </span>
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600">
                                                {item.frequency} pins
                                            </span>
                                        </button>
                                    ))
                                ) : (
                                    <div className="px-3.5 py-2.5 text-xs text-zinc-400">
                                        No prefix match in Trie for "{searchQuery}"
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Navigation Tabs & Persona Switcher */}
                    <div className="flex items-center gap-2 order-2 md:order-3">
                        <button
                            onClick={() => setActiveTab("feed")}
                            className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition cursor-pointer ${activeTab === "feed"
                                    ? "bg-zinc-900 text-white"
                                    : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                                }`}
                        >
                            <Sparkles className="w-3.5 h-3.5" /> Feed
                        </button>

                        <button
                            onClick={() => setActiveTab("codemap")}
                            className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition cursor-pointer ${activeTab === "codemap"
                                    ? "bg-red-600 text-white"
                                    : "bg-red-50 text-red-700 hover:bg-red-100"
                                }`}
                        >
                            <Code2 className="w-3.5 h-3.5" /> DSA Code Map
                        </button>

                        {/* 1-Click Persona Switcher */}
                        <div className="flex items-center bg-zinc-100 rounded-full px-2.5 py-1 border border-zinc-200">
                            <Users className="w-3.5 h-3.5 text-zinc-500 mr-1.5 shrink-0" />
                            <select
                                value={activeUser?.id || ""}
                                onChange={(e) => onSwitchUser(e.target.value)}
                                className="bg-transparent text-xs font-semibold text-zinc-800 outline-none cursor-pointer max-w-[125px] sm:max-w-[155px]"
                                title="Switch User Persona to test Bipartite Graph personalization"
                            >
                                {users.map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* New Cold-Start User Signup */}
                        <button
                            onClick={() => setShowSignupModal(true)}
                            className="p-2 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition cursor-pointer"
                            title="Create New User (Test Cold-Start Onboarding)"
                        >
                            <UserPlus className="w-4 h-4" />
                        </button>

                        {/* Reset Demo State */}
                        <button
                            onClick={onResetDemo}
                            className="p-2 rounded-full bg-zinc-100 hover:bg-red-50 text-zinc-600 hover:text-red-600 transition cursor-pointer"
                            title="Reset Demo Graph & Cache"
                        >
                            <RotateCcw className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Cold-Start New User Signup Modal */}
            {showSignupModal && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-zinc-200">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-lg font-bold text-zinc-900">
                                Create New User (Cold-Start Demo)
                            </h2>
                            <button
                                onClick={() => setShowSignupModal(false)}
                                className="text-zinc-400 hover:text-zinc-700"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-xs text-zinc-600 mb-4 leading-relaxed">
                            A brand-new user has <strong>0 saved boards</strong> in the Bipartite Graph.
                            Pick 1–4 starter interests below to test how our{" "}
                            <strong>Inverted Index Hash Map</strong> solves the Cold-Start problem!
                        </p>

                        <form onSubmit={handleSignupSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                                    Student / Demo Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    placeholder="e.g. Harshit (New User)"
                                    className="w-full px-3.5 py-2 border border-zinc-300 rounded-xl text-sm outline-none focus:border-red-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                                    Select Starter Tags ({selectedTags.length}/4)
                                </label>
                                <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-2 bg-zinc-50 rounded-xl border border-zinc-200">
                                    {availableTags.map((tag) => {
                                        const active = selectedTags.includes(tag);
                                        return (
                                            <button
                                                type="button"
                                                key={tag}
                                                onClick={() => toggleSignupTag(tag)}
                                                className={`px-2.5 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 transition cursor-pointer ${active
                                                        ? "bg-red-600 text-white"
                                                        : "bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-100"
                                                    }`}
                                            >
                                                {active && <Check className="w-3 h-3" />}#{tag}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowSignupModal(false)}
                                    className="px-4 py-2 rounded-full text-xs font-semibold text-zinc-600 hover:bg-zinc-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 rounded-full text-xs font-semibold bg-red-600 hover:bg-red-700 text-white shadow-sm cursor-pointer"
                                >
                                    Generate Cold-Start Feed
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}