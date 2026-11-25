/**
 * DATA STRUCTURE: LRU Cache (Doubly Linked List + Hash Map)
 * PURPOSE: Tracks the user's most recently clicked pins in O(1) time to boost live
 *          session interests and prevent repetitive recommendations.
 * COMPLEXITY:
 * - get(key): O(1)
 * - put(key, value): O(1)
 */
class DLLNode {
    constructor(key, value) {
        this.key = key;
        this.value = value;
        this.prev = null;
        this.next = null;
    }
}

export class LRUCache {
    constructor(capacity = 8) {
        this.capacity = capacity;
        this.map = new Map(); // pinId -> DLLNode

        // Dummy head (Most Recently Used) and tail (Least Recently Used) sentinels
        this.head = new DLLNode(null, null);
        this.tail = new DLLNode(null, null);
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }

    has(key) {
        return this.map.has(key);
    }

    get(key) {
        if (!this.map.has(key)) return null;
        const node = this.map.get(key);
        this._removeNode(node);
        this._addToFront(node);
        return node.value;
    }

    put(key, value) {
        if (this.map.has(key)) {
            const existingNode = this.map.get(key);
            existingNode.value = value;
            this._removeNode(existingNode);
            this._addToFront(existingNode);
            return;
        }

        if (this.map.size >= this.capacity) {
            // Evict Least Recently Used node right before dummy tail
            const lruNode = this.tail.prev;
            this._removeNode(lruNode);
            this.map.delete(lruNode.key);
        }

        const newNode = new DLLNode(key, value);
        this._addToFront(newNode);
        this.map.set(key, newNode);
    }

    // Returns recent pins ordered from Most Recent -> Oldest
    getRecentItems() {
        const items = [];
        let current = this.head.next;
        while (current !== this.tail) {
            items.push(current.value);
            current = current.next;
        }
        return items;
    }

    // Extracts dominant tags from the user's live session history
    getSessionTags() {
        const tagSet = new Set();
        for (const pin of this.getRecentItems()) {
            for (const tag of pin.tags || []) {
                tagSet.add(tag.toLowerCase());
            }
        }
        return tagSet;
    }

    _addToFront(node) {
        node.next = this.head.next;
        node.prev = this.head;
        this.head.next.prev = node;
        this.head.next = node;
    }

    _removeNode(node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }
}