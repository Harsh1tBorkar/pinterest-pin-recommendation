/**
 * DATA STRUCTURE: Binary Max-Heap (Priority Queue)
 * PURPOSE: Efficiently extracts the Top-K highest-scoring pins without sorting the entire catalog.
 * COMPLEXITY:
 * - insert(): O(log N) via bubbleUp
 * - extractMax(): O(log N) via sinkDown
 * - Top-K Extraction: O(N log N) worst-case / O(K log N) extraction
 */
export class MaxHeap {
    constructor() {
        this.heap = []; // Array of { pinId, score, payload }
    }

    size() {
        return this.heap.length;
    }

    isEmpty() {
        return this.heap.length === 0;
    }

    peek() {
        return this.heap.length > 0 ? this.heap[0] : null;
    }

    // Insert a new scored pin candidate and restore Max-Heap property upward
    insert(node) {
        this.heap.push(node);
        this.bubbleUp(this.heap.length - 1);
    }

    // Remove and return the highest-scoring pin (root at index 0)
    extractMax() {
        if (this.isEmpty()) return null;
        if (this.heap.length === 1) return this.heap.pop();

        const max = this.heap[0];
        this.heap[0] = this.heap.pop(); // Move last leaf to root
        this.sinkDown(0);               // Restore Max-Heap property downward
        return max;
    }

    bubbleUp(index) {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this.heap[index].score <= this.heap[parentIndex].score) break;

            // Swap child with parent
            [this.heap[index], this.heap[parentIndex]] = [
                this.heap[parentIndex],
                this.heap[index],
            ];
            index = parentIndex;
        }
    }

    sinkDown(index) {
        const length = this.heap.length;

        while (true) {
            const leftChild = 2 * index + 1;
            const rightChild = 2 * index + 2;
            let largest = index;

            if (leftChild < length && this.heap[leftChild].score > this.heap[largest].score) {
                largest = leftChild;
            }
            if (rightChild < length && this.heap[rightChild].score > this.heap[largest].score) {
                largest = rightChild;
            }
            if (largest === index) break;

            [this.heap[index], this.heap[largest]] = [
                this.heap[largest],
                this.heap[index],
            ];
            index = largest;
        }
    }
}