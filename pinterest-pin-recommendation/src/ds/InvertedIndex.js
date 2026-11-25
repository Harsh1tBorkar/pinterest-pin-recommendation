/**
 * DATA STRUCTURE: Hash Map Inverted Index (Tag -> Set<PinID>)
 * PURPOSE: Content-based retrieval in O(1) time & Cold-Start feed generation for new users.
 * COMPLEXITY:
 * - Tag Lookup: O(1) average
 * - Multi-Tag Candidate Scoring: O(T * P), where T = query tags, P = pins per tag
 */
export class InvertedIndex {
    constructor() {
        this.tagToPins = new Map(); // tag (string) -> Set<pinId>
    }

    indexPin(pin) {
        for (const rawTag of pin.tags) {
            const tag = rawTag.toLowerCase().trim();
            if (!this.tagToPins.has(tag)) {
                this.tagToPins.set(tag, new Set());
            }
            this.tagToPins.get(tag).add(pin.id);
        }
    }

    getPinsForTag(tag) {
        return this.tagToPins.get(tag.toLowerCase().trim()) || new Set();
    }

    getAllTags() {
        return Array.from(this.tagToPins.keys()).sort();
    }

    /**
     * Scores candidate pins based on how many tags they share with a target tag list
     */
    getTagCandidates(targetTags = [], excludePinId = null) {
        const cleanTags = targetTags.map((t) => t.toLowerCase().trim());
        const candidateMap = new Map(); // pinId -> { tagScore, matchedTags }

        if (cleanTags.length === 0) return candidateMap;

        for (const tag of cleanTags) {
            const matchingPins = this.getPinsForTag(tag);
            for (const pinId of matchingPins) {
                if (pinId === excludePinId) continue;

                if (!candidateMap.has(pinId)) {
                    candidateMap.set(pinId, {
                        matchedTags: [],
                        tagScore: 0,
                    });
                }
                const entry = candidateMap.get(pinId);
                if (!entry.matchedTags.includes(tag)) {
                    entry.matchedTags.push(tag);
                    entry.tagScore = entry.matchedTags.length / cleanTags.length;
                }
            }
        }

        return candidateMap;
    }
}