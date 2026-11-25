import React, { useState, useMemo } from "react";
import { INITIAL_PINS, INITIAL_BOARDS, INITIAL_USERS } from "./data/seedData.js";
import { RecommendationEngine } from "./engine/RecommendationEngine.js";
import NavbarAndAuth from "./components/NavbarAndAuth.jsx";
import MasonryGrid from "./components/MasonryGrid.jsx";
import GraphXRayDrawer from "./components/GraphXRayDrawer.jsx";
import DSACodeMap from "./components/DSACodeMap.jsx";
import PinVisual from "./components/PinVisual.jsx";
import { X, Network, Bookmark, Check, Sparkles, Tag } from "lucide-react";

export default function App() {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [boards, setBoards] = useState(INITIAL_BOARDS);
  const [activeUserId, setActiveUserId] = useState(INITIAL_USERS[0].id);
  const [activeTab, setActiveTab] = useState("feed");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTagFilter, setSelectedTagFilter] = useState("");
  const [selectedPin, setSelectedPin] = useState(null);
  const [xrayPin, setXrayPin] = useState(null);
  const [toastMsg, setToastMsg] = useState("");
  const [engineVersion, setEngineVersion] = useState(0);

  // Initialize RecommendationEngine once with seeded Pins & Boards
  const engine = useMemo(() => {
    return new RecommendationEngine(INITIAL_PINS, INITIAL_BOARDS);
  }, []);

  const activeUser = useMemo(
    () => users.find((u) => u.id === activeUserId) || users[0],
    [users, activeUserId]
  );

  // All Pin IDs currently saved on the active user's boards
  const savedPinIds = useMemo(() => {
    const userBoards = boards.filter((b) => b.ownerId === activeUser.id);
    return new Set(userBoards.flatMap((b) => b.pinIds));
  }, [boards, activeUser]);

  // Compute Personalized Home Feed (or Tag-Filtered Feed)
  const homeData = useMemo(() => {
    void engineVersion; // Recompute whenever graph edges or LRU cache update
    if (selectedTagFilter) {
      const matchingSet = engine.index.getPinsForTag(selectedTagFilter);
      const filtered = INITIAL_PINS.filter((p) => matchingSet.has(p.id)).map(
        (pin) => ({
          pin,
          score: 0.95,
          reasons: {
            matchedTags: [selectedTagFilter],
            sharedBoards: [],
          },
        })
      );
      return {
        feed: filtered,
        metrics: {
          executionTimeMs: "0.04",
          candidatesEvaluated: matchingSet.size,
          mode: `Inverted Index O(1) Lookup (#${selectedTagFilter})`,
        },
      };
    }

    return engine.recommendHomeFeed(activeUser, boards, 28);
  }, [engine, activeUser, boards, selectedTagFilter, engineVersion]);

  // Compute "More Like This" & X-Ray Subgraph for the active modal/drawer pin
  const activePinXray = useMemo(() => {
    void engineVersion;
    const target = xrayPin || selectedPin;
    if (!target) return null;
    return engine.recommendForPin(target, activeUser, 8);
  }, [engine, xrayPin, selectedPin, activeUser, engineVersion]);

  const trieSuggestions = useMemo(() => {
    return engine.searchAutocomplete(searchQuery);
  }, [engine, searchQuery]);

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3200);
  };

  // Handle clicking a Pin card -> Updates O(1) LRU Cache & opens Detail Modal
  const handleSelectPin = (pin) => {
    engine.recordPinInteraction(pin);
    setEngineVersion((v) => v + 1);
    setSelectedPin(pin);
  };

  // Handle saving a Pin -> Dynamically adds a new edge in BipartiteGraph
  const handleSavePin = (pin) => {
    if (savedPinIds.has(pin.id)) {
      triggerToast(`"${pin.title}" is already in your Bipartite Graph boards.`);
      return;
    }

    let updatedBoards = [...boards];
    let targetBoard = updatedBoards.find((b) => b.ownerId === activeUser.id);

    if (!targetBoard) {
      targetBoard = {
        id: `board_${Date.now()}`,
        name: `${activeUser.name.split(" ")[0]}'s Saved Board`,
        ownerId: activeUser.id,
        pinIds: [],
      };
      updatedBoards.push(targetBoard);
    }

    updatedBoards = updatedBoards.map((b) =>
      b.id === targetBoard.id ? { ...b, pinIds: [...b.pinIds, pin.id] } : b
    );

    // Mutate live Bipartite Graph edge
    engine.savePinToBoard(pin.id, targetBoard);
    setBoards(updatedBoards);
    setEngineVersion((v) => v + 1);

    triggerToast(
      `Saved to "${targetBoard.name}" — Added live Pin↔Board edge in Bipartite Graph!`
    );
  };

  // Create a brand-new Cold-Start user
  const handleCreateUser = (name, favoriteTags) => {
    const newUser = {
      id: `user_${Date.now()}`,
      name: `${name} (New)`,
      role: "Cold-Start User • 0 Boards",
      favoriteTags,
    };
    setUsers((prev) => [...prev, newUser]);
    setActiveUserId(newUser.id);
    setSelectedTagFilter("");
    triggerToast(
      `Created ${name}! Running Cold-Start Inverted Index on #${favoriteTags.join(", #")}`
    );
  };

  const handleResetDemo = () => {
    setUsers(INITIAL_USERS);
    setBoards(INITIAL_BOARDS);
    setActiveUserId(INITIAL_USERS[0].id);
    setSelectedTagFilter("");
    setSearchQuery("");
    setSelectedPin(null);
    setXrayPin(null);
    engine.initialize(INITIAL_PINS, INITIAL_BOARDS);
    setEngineVersion((v) => v + 1);
    triggerToast("Demo state reset to original Bipartite Graph.");
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <NavbarAndAuth
        users={users}
        activeUser={activeUser}
        onSwitchUser={(id) => {
          setActiveUserId(id);
          setSelectedTagFilter("");
        }}
        onCreateUser={handleCreateUser}
        onResetDemo={handleResetDemo}
        searchQuery={searchQuery}
        onSearchChange={(val) => {
          setSearchQuery(val);
          if (!val) setSelectedTagFilter("");
        }}
        trieSuggestions={trieSuggestions}
        onSelectTag={(tag) => {
          setSelectedTagFilter(tag);
          setSearchQuery(tag);
          setActiveTab("feed");
        }}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        metrics={homeData.metrics}
        availableTags={engine.index.getAllTags()}
      />

      {/* Live Graph Mutation Toast */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 bg-zinc-900 text-white px-4 py-3 rounded-2xl shadow-xl text-xs font-medium flex items-center gap-2 border border-zinc-700">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === "codemap" ? (
          <DSACodeMap />
        ) : (
          <>
            {/* Active Persona & Filter Status Banner */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5 bg-white px-4 py-3 rounded-2xl border border-zinc-200/80 shadow-2xs">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-bold text-zinc-900">
                  Active Persona: {activeUser.name}
                </span>
                <span className="text-zinc-400">|</span>
                <span className="text-zinc-600">
                  Saved Pins in Graph:{" "}
                  <strong className="text-zinc-900">{savedPinIds.size}</strong>
                </span>
                <span className="text-zinc-400">|</span>
                <span className="text-zinc-600">
                  Interests:{" "}
                  {activeUser.favoriteTags.map((t) => (
                    <span
                      key={t}
                      className="inline-block bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded-full mr-1 font-medium"
                    >
                      #{t}
                    </span>
                  ))}
                </span>
              </div>

              {selectedTagFilter && (
                <button
                  onClick={() => {
                    setSelectedTagFilter("");
                    setSearchQuery("");
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold hover:bg-red-100 cursor-pointer"
                >
                  <Tag className="w-3 h-3" /> Filter: #{selectedTagFilter}
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Main Masonry Pin Feed */}
            <MasonryGrid
              items={homeData.feed}
              savedPinIds={savedPinIds}
              onSelectPin={handleSelectPin}
              onSavePin={handleSavePin}
              onInspectPin={(pin) => {
                engine.recordPinInteraction(pin);
                setEngineVersion((v) => v + 1);
                setXrayPin(pin);
              }}
            />
          </>
        )}
      </main>

      {/* Pin Detail + "More Like This" Modal */}
      {selectedPin && activePinXray && (
        <div
          onClick={() => setSelectedPin(null)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs overflow-y-auto p-4 sm:p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl border border-zinc-200 overflow-hidden"
          >
            {/* Top Selected Pin Hero */}
            <div className="grid grid-cols-1 md:grid-cols-2 border-b border-zinc-200">
              <div className="h-72 md:h-full min-h-[280px]">
                <PinVisual pin={selectedPin} />
              </div>

              <div className="p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <button
                      onClick={() => setXrayPin(selectedPin)}
                      className="px-3.5 py-2 rounded-full bg-cyan-950 hover:bg-cyan-900 text-cyan-200 text-xs font-bold inline-flex items-center gap-1.5 shadow cursor-pointer"
                    >
                      <Network className="w-4 h-4 text-cyan-400" /> Open
                      Algorithm X-Ray
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSavePin(selectedPin)}
                        className={`px-4 py-2 rounded-full text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer ${savedPinIds.has(selectedPin.id)
                            ? "bg-zinc-900 text-white"
                            : "bg-red-600 hover:bg-red-700 text-white"
                          }`}
                      >
                        {savedPinIds.has(selectedPin.id) ? (
                          <>
                            <Check className="w-4 h-4" /> Saved
                          </>
                        ) : (
                          <>
                            <Bookmark className="w-4 h-4" /> Save to Board
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => setSelectedPin(null)}
                        className="p-2 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <h2 className="text-2xl font-bold text-zinc-900">
                    {selectedPin.title}
                  </h2>

                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {selectedPin.tags.map((t) => (
                      <span
                        key={t}
                        className="px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-700 text-xs font-medium"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-600">
                  <strong>Live Telemetry:</strong> Evaluated{" "}
                  <strong>{activePinXray.metrics.candidatesEvaluated}</strong>{" "}
                  graph & tag candidates in{" "}
                  <strong className="text-emerald-700">
                    {activePinXray.metrics.executionTimeMs} ms
                  </strong>{" "}
                  and extracted Top-{activePinXray.recommendations.length} via{" "}
                  <strong>Binary Max-Heap</strong>.
                </div>
              </div>
            </div>

            {/* Bottom "More Like This" Section */}
            <div className="p-6 bg-zinc-50/70">
              <h3 className="text-base font-bold text-zinc-900 mb-4">
                More Like This (Ranked by Bipartite Graph + Max-Heap)
              </h3>
              <MasonryGrid
                items={activePinXray.recommendations}
                savedPinIds={savedPinIds}
                onSelectPin={handleSelectPin}
                onSavePin={handleSavePin}
                onInspectPin={(pin) => setXrayPin(pin)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Algorithm X-Ray Drawer */}
      <GraphXRayDrawer
        isOpen={Boolean(xrayPin)}
        onClose={() => setXrayPin(null)}
        seedPin={xrayPin}
        xrayData={activePinXray}
        lruItems={engine.sessionCache.getRecentItems()}
      />
    </div>
  );
}