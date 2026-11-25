/**
 * DATA STRUCTURE: Trie (Prefix Tree)
 * PURPOSE: Instant real-time search autocomplete for pin tags and keywords.
 * COMPLEXITY:
 * - insert(word): O(L), where L is the length of the word
 * - getSuggestions(prefix): O(L + M), where M is the number of matched nodes in subtree
 */
class TrieNode {
    constructor() {
        this.children = new Map(); // char -> TrieNode
        this.isEndOfWord = false;
        this.word = null;
        this.frequency = 0;        // Tracks popularity of tag for ranked suggestions
    }
}

export class Trie {
    constructor() {
        this.root = new TrieNode();
    }

    insert(rawWord, weight = 1) {
        const word = rawWord.toLowerCase().trim();
        if (!word) return;

        let current = this.root;
        for (const char of word) {
            if (!current.children.has(char)) {
                current.children.set(char, new TrieNode());
            }
            current = current.children.get(char);
        }

        current.isEndOfWord = true;
        current.word = word;
        current.frequency += weight;
    }

    getSuggestions(rawPrefix, limit = 6) {
        const prefix = rawPrefix.toLowerCase().trim();
        if (!prefix) return [];

        // Step 1: Traverse down to the end of the prefix in O(L) time
        let current = this.root;
        for (const char of prefix) {
            if (!current.children.has(char)) {
                return []; // Prefix not found
            }
            current = current.children.get(char);
        }

        // Step 2: DFS from prefix node to collect all complete words
        const matches = [];
        this._collectWords(current, matches);

        // Sort suggestions by frequency (most popular tags first)
        return matches
            .sort((a, b) => b.frequency - a.frequency)
            .slice(0, limit);
    }

    _collectWords(node, matches) {
        if (node.isEndOfWord) {
            matches.push({ word: node.word, frequency: node.frequency });
        }
        for (const childNode of node.children.values()) {
            this._collectWords(childNode, matches);
        }
    }
}