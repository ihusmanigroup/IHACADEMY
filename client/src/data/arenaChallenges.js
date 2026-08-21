// ============================================================
// IH Academy — Competitive Coding Arena Challenge Catalog
// Realistic XP economy (5 – 30 XP max):
//   EASY   5–10 XP     |  MEDIUM 15–20 XP
//   HARD   25–30 XP    |  INSANE 30 XP (max)
//
// Every challenge ships a unit-test suite (testCases) split into
// PUBLIC cases (visible inputs/outputs) and HIDDEN cases (stress
// sizes + edge cases). XP is awarded ONLY when 100% of cases pass.
// requiredComplexity is enforced via 2s per-test timeouts on large
// hidden inputs — brute-force / copy-paste solutions time out.
//
// type: 'function' — input spread-calls solution(...input)
//       'class'    — input[0] = capacity, input[1] = op list
//                    [[method, ...args], ...] -> outputs array
// compare: 'exact' | 'pair' (order-insensitive 2-element array)
//          | 'unordered' (top-level multiset compare)
// ============================================================

export const ARENA_CATEGORIES = ['All', 'Algorithms & DSA', 'Web Architecture', 'System Optimization']

export const DIFFICULTY_META = {
  Easy: { xpRange: '5–10 XP', cls: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30', glow: 'border-emerald-500/20 hover:border-emerald-500/50 hover:shadow-emerald-500/10' },
  Medium: { xpRange: '15–20 XP', cls: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30', glow: 'border-amber-500/20 hover:border-amber-500/50 hover:shadow-amber-500/10' },
  Hard: { xpRange: '25–30 XP', cls: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30', glow: 'border-rose-500/20 hover:border-rose-500/50 hover:shadow-rose-500/10' },
  Insane: { xpRange: '30 XP', cls: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30', glow: 'border-purple-500/20 hover:border-purple-500/50 hover:shadow-purple-500/10' },
}

const defaultStarters = {
  javascript: (fn) => `function ${fn}(/* args */) {\n  // Write your code here\n  \n}`,
  python: (fn) => `def ${fn}(*args):\n    # Write your code here\n    pass`,
  cpp: (fn) => `// Implement ${fn} below\n// (in-browser execution supports JavaScript — switch to JS to run tests)`,
}

export const arenaChallenges = [
  // ================= EASY — 50–70 XP =================
  {
    id: 1,
    title: 'Two Sum',
    difficulty: 'Easy',
    xp: 10,
    category: 'Algorithms & DSA',
    requiredComplexity: 'O(n)',
    functionName: 'twoSum',
    type: 'function',
    compare: 'pair',
    desc: 'Find two numbers in an array that add up to a target value.',
    statement: `Given an array of integers nums and an integer target, return the indices of the two numbers that add up to target.

You may assume that each input has exactly one solution when one exists, and you may not use the same element twice.

Return the indices in any order. If no pair exists, return null.`,
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
    ],
    examples: [
      { input: 'twoSum([2, 7, 11, 15], 9)', output: '[0, 1]', explanation: 'nums[0] + nums[1] = 2 + 7 = 9' },
      { input: 'twoSum([3, 2, 4], 6)', output: '[1, 2]', explanation: 'nums[1] + nums[2] = 2 + 4 = 6' },
    ],
    testCases: [
      { input: [[2, 7, 11, 15], 9], expectedOutput: [0, 1], hidden: false },
      { input: [[3, 2, 4], 6], expectedOutput: [1, 2], hidden: false },
      { input: [[3, 3], 6], expectedOutput: [0, 1], hidden: false },
      { input: [[-1, -2, -3, -4, -5], -8], expectedOutput: [2, 4], hidden: false },
      { input: [[1, 2, 3, 4, 5], 10], expectedOutput: null, hidden: false },
      { input: [Array.from({ length: 50000 }, (_, i) => i), 99997], expectedOutput: [49998, 49999], hidden: true },
      { input: [[5, 3, 8, 1, 9, 2, 7, 4, 6, 10], 19], expectedOutput: [4, 9], hidden: true },
      { input: [[1000000, -1000000, 0, 500000, -500000, 250000, -250000], -500000], expectedOutput: [1, 3], hidden: true },
    ],
    starterCode: {
      javascript: `function twoSum(nums, target) {
  // Write your code here
  
}`,
      python: `def twoSum(nums: list[int], target: int) -> list[int] | None:
    # Write your code here
    pass`,
      cpp: `#include <vector>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    // Write your code here
    
}`,
    },
  },
  {
    id: 2,
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    xp: 8,
    category: 'Algorithms & DSA',
    requiredComplexity: 'O(n)',
    functionName: 'isValid',
    type: 'function',
    compare: 'exact',
    desc: 'Check if a string of brackets is correctly balanced.',
    statement: `Given a string s containing just the characters ( ) { } [ ], determine if the input string is valid.

A string is valid if every opening bracket is closed by the same type of bracket, in the correct order.`,
    constraints: ['1 <= s.length <= 10^4', 's consists of parentheses, braces and brackets only'],
    examples: [
      { input: 'isValid("()[]{}")', output: 'true', explanation: 'Every bracket closes in order' },
      { input: 'isValid("([)]")', output: 'false', explanation: 'Brackets are nested incorrectly' },
    ],
    testCases: [
      { input: ['()'], expectedOutput: true, hidden: false },
      { input: ['()[]{}'], expectedOutput: true, hidden: false },
      { input: ['(]'], expectedOutput: false, hidden: false },
      { input: ['([)]'], expectedOutput: false, hidden: false },
      { input: ['{[]}'], expectedOutput: true, hidden: false },
      { input: [''], expectedOutput: true, hidden: false },
      { input: ['('.repeat(10000) + ')'.repeat(10000)], expectedOutput: true, hidden: true },
      { input: ['['.repeat(10000) + ')'.repeat(10000)], expectedOutput: false, hidden: true },
      { input: ['([{'.repeat(1000) + '}])'.repeat(1000)], expectedOutput: true, hidden: true },
    ],
    starterCode: {
      javascript: `function isValid(s) {
  // Write your code here
  
}`,
      python: `def isValid(s: str) -> bool:
    # Write your code here
    pass`,
      cpp: `#include <string>
using namespace std;

bool isValid(string s) {
    // Write your code here
    
}`,
    },
  },
  {
    id: 3,
    title: 'Contains Duplicate',
    difficulty: 'Easy',
    xp: 5,
    category: 'Algorithms & DSA',
    requiredComplexity: 'O(n)',
    functionName: 'containsDuplicate',
    type: 'function',
    compare: 'exact',
    desc: 'Return true if any value appears at least twice in the array.',
    statement: `Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.`,
    constraints: ['1 <= nums.length <= 10^5', '-10^9 <= nums[i] <= 10^9'],
    examples: [
      { input: 'containsDuplicate([1, 2, 3, 1])', output: 'true', explanation: '1 appears twice' },
      { input: 'containsDuplicate([1, 2, 3, 4])', output: 'false', explanation: 'All values are distinct' },
    ],
    testCases: [
      { input: [[1, 2, 3, 1]], expectedOutput: true, hidden: false },
      { input: [[1, 2, 3, 4]], expectedOutput: false, hidden: false },
      { input: [[1, 1, 1, 3, 3, 4, 3, 2, 4, 2]], expectedOutput: true, hidden: false },
      { input: [[]], expectedOutput: false, hidden: false },
      { input: [[42]], expectedOutput: false, hidden: false },
      { input: [Array.from({ length: 50000 }, (_, i) => i)], expectedOutput: false, hidden: true },
      { input: [Array.from({ length: 50000 }, (_, i) => i).concat([49999])], expectedOutput: true, hidden: true },
      { input: [[-1000000, 1000000, 0, -1, 1, -1000000]], expectedOutput: true, hidden: true },
    ],
    starterCode: {
      javascript: `function containsDuplicate(nums) {
  // Write your code here
  
}`,
      python: `def containsDuplicate(nums: list[int]) -> bool:
    # Write your code here
    pass`,
      cpp: `#include <vector>
using namespace std;

bool containsDuplicate(vector<int>& nums) {
    // Write your code here
    
}`,
    },
  },

  // ================= MEDIUM — 120–160 XP =================
  {
    id: 4,
    title: 'Merge Intervals',
    difficulty: 'Medium',
    xp: 20,
    category: 'Algorithms & DSA',
    requiredComplexity: 'O(n log n)',
    functionName: 'merge',
    type: 'function',
    compare: 'exact',
    desc: 'Merge all overlapping intervals into non-overlapping ones.',
    statement: `Given an array of intervals where intervals[i] = [start, end], merge all overlapping intervals and return an array of the non-overlapping intervals that cover all the intervals in the input.`,
    constraints: ['1 <= intervals.length <= 10^4', 'intervals[i].length === 2', '0 <= start <= end <= 10^4'],
    examples: [
      { input: 'merge([[1,3],[2,6],[8,10],[15,18]])', output: '[[1,6],[8,10],[15,18]]', explanation: '[1,3] and [2,6] overlap → [1,6]' },
      { input: 'merge([[1,4],[4,5]])', output: '[[1,5]]', explanation: 'Touching intervals merge (4 >= 4)' },
    ],
    testCases: [
      { input: [[[1, 3], [2, 6], [8, 10], [15, 18]]], expectedOutput: [[1, 6], [8, 10], [15, 18]], hidden: false },
      { input: [[[1, 4], [4, 5]]], expectedOutput: [[1, 5]], hidden: false },
      { input: [[[1, 4], [0, 4]]], expectedOutput: [[0, 4]], hidden: false },
      { input: [[]], expectedOutput: [], hidden: false },
      { input: [[[1, 4]]], expectedOutput: [[1, 4]], hidden: false },
      { input: [[[2, 3], [4, 5], [6, 7], [8, 9], [1, 10]]], expectedOutput: [[1, 10]], hidden: false },
      { input: [Array.from({ length: 10000 }, (_, i) => [i, i])], expectedOutput: Array.from({ length: 10000 }, (_, i) => [i, i]), hidden: true },
      { input: [Array.from({ length: 10000 }, (_, i) => [0, i])], expectedOutput: [[0, 9999]], hidden: true },
      { input: [Array.from({ length: 5000 }, (_, i) => [i * 2, i * 2 + 1])], expectedOutput: Array.from({ length: 5000 }, (_, i) => [i * 2, i * 2 + 1]), hidden: true },
    ],
    starterCode: {
      javascript: `function merge(intervals) {
  // Write your code here
  
}`,
      python: `def merge(intervals: list[list[int]]) -> list[list[int]]:
    # Write your code here
    pass`,
      cpp: `#include <vector>
using namespace std;

vector<vector<int>> merge(vector<vector<int>>& intervals) {
    // Write your code here
    
}`,
    },
  },
  {
    id: 5,
    title: 'Group Anagrams',
    difficulty: 'Medium',
    xp: 15,
    category: 'Algorithms & DSA',
    requiredComplexity: 'O(n · k log k)',
    functionName: 'groupAnagrams',
    type: 'function',
    compare: 'unordered',
    desc: 'Group strings that are anagrams of each other.',
    statement: `Given an array of strings strs, group the anagrams together. Two strings are anagrams if one can be rearranged into the other.

Return an array of groups. The order of groups and the order within each group does not matter.`,
    constraints: ['1 <= strs.length <= 10^4', '0 <= strs[i].length <= 100'],
    examples: [
      { input: 'groupAnagrams(["eat","tea","tan","ate","nat","bat"])', output: '[["bat"],["nat","tan"],["ate","eat","tea"]]', explanation: 'Each group shares the same sorted signature' },
    ],
    testCases: [
      {
        input: [['eat', 'tea', 'tan', 'ate', 'nat', 'bat']],
        expectedOutput: [['ate', 'eat', 'tea'], ['nat', 'tan'], ['bat']],
        hidden: false,
      },
      { input: [['']], expectedOutput: [['']], hidden: false },
      { input: [['a']], expectedOutput: [['a']], hidden: false },
      { input: [['ab', 'ba', 'abc', 'cab', 'bca']], expectedOutput: [['ab', 'ba'], ['abc', 'cab', 'bca']], hidden: false },
      { input: [['x', 'y', 'z', 'x']], expectedOutput: [['x', 'x'], ['y'], ['z']], hidden: false },
      { input: [Array.from({ length: 2000 }, (_, i) => 'a'.repeat(i % 50))], expectedOutput: Array.from({ length: 50 }, (_, k) => Array(40).fill('a'.repeat(k))), hidden: true },
      { input: [Array.from({ length: 1000 }, (_, i) => 'ab'.repeat(i % 100))], expectedOutput: Array.from({ length: 100 }, (_, k) => Array(10).fill('ab'.repeat(k))), hidden: true },
    ],
    starterCode: {
      javascript: `function groupAnagrams(strs) {
  // Write your code here
  
}`,
      python: `def groupAnagrams(strs: list[str]) -> list[list[str]]:
    # Write your code here
    pass`,
      cpp: `#include <vector>
#include <string>
using namespace std;

vector<vector<string>> groupAnagrams(vector<string>& strs) {
    // Write your code here
    
}`,
    },
  },
  {
    id: 6,
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'Medium',
    xp: 18,
    category: 'Algorithms & DSA',
    requiredComplexity: 'O(n)',
    functionName: 'lengthOfLongestSubstring',
    type: 'function',
    compare: 'exact',
    desc: 'Return the length of the longest substring without repeating characters.',
    statement: `Given a string s, find the length of the longest substring that contains no repeating characters.`,
    constraints: ['0 <= s.length <= 5 * 10^4', 's consists of English letters, digits, symbols and spaces'],
    examples: [
      { input: 'lengthOfLongestSubstring("abcabcbb")', output: '3', explanation: 'The answer is "abc"' },
      { input: 'lengthOfLongestSubstring("pwwkew")', output: '3', explanation: 'The answer is "wke"' },
    ],
    testCases: [
      { input: ['abcabcbb'], expectedOutput: 3, hidden: false },
      { input: ['bbbbb'], expectedOutput: 1, hidden: false },
      { input: ['pwwkew'], expectedOutput: 3, hidden: false },
      { input: [''], expectedOutput: 0, hidden: false },
      { input: ['au'], expectedOutput: 2, hidden: false },
      { input: ['dvdf'], expectedOutput: 3, hidden: false },
      { input: ['a'.repeat(50000)], expectedOutput: 1, hidden: true },
      { input: ['ab'.repeat(25000)], expectedOutput: 2, hidden: true },
      { input: ['abcdefghijklmnopqrstuvwxyz'.repeat(1923)], expectedOutput: 26, hidden: true },
    ],
    starterCode: {
      javascript: `function lengthOfLongestSubstring(s) {
  // Write your code here
  
}`,
      python: `def lengthOfLongestSubstring(s: str) -> int:
    # Write your code here
    pass`,
      cpp: `#include <string>
using namespace std;

int lengthOfLongestSubstring(string s) {
    // Write your code here
    
}`,
    },
  },

  // ================= HARD — 240–300 XP =================
  {
    id: 7,
    title: 'Sliding Window Maximum',
    difficulty: 'Hard',
    xp: 30,
    category: 'Algorithms & DSA',
    requiredComplexity: 'O(n) — monotonic deque',
    functionName: 'maxSlidingWindow',
    type: 'function',
    compare: 'exact',
    desc: 'Return the maximum value of every k-sized window in O(n).',
    statement: `You are given an array of integers nums and a sliding window of size k moving from the far left to the far right. You can only see the k numbers in the window.

Return an array of the maximum of each window, in order.`,
    constraints: ['1 <= nums.length <= 10^5', '1 <= k <= nums.length'],
    examples: [
      { input: 'maxSlidingWindow([1,3,-1,-3,5,3,6,7], 3)', output: '[3,3,5,5,6,7]', explanation: 'Windows: [1,3,-1]→3, [3,-1,-3]→3, [-1,-3,5]→5, ...' },
    ],
    testCases: [
      { input: [[1, 3, -1, -3, 5, 3, 6, 7], 3], expectedOutput: [3, 3, 5, 5, 6, 7], hidden: false },
      { input: [[1], 1], expectedOutput: [1], hidden: false },
      { input: [[1, -1], 1], expectedOutput: [1, -1], hidden: false },
      { input: [[9, 11], 2], expectedOutput: [11], hidden: false },
      { input: [[4, -2], 2], expectedOutput: [4], hidden: false },
      { input: [[7, 2, 4], 2], expectedOutput: [7, 4], hidden: false },
      { input: [Array.from({ length: 50000 }, (_, i) => i), 1000], expectedOutput: Array.from({ length: 49001 }, (_, i) => i + 999), hidden: true },
      { input: [Array.from({ length: 20000 }, (_, i) => -i), 500], expectedOutput: Array.from({ length: 19501 }, (_, i) => -i), hidden: true },
      { input: [Array.from({ length: 10000 }, () => 7), 100], expectedOutput: Array(9901).fill(7), hidden: true },
    ],
    starterCode: {
      javascript: `function maxSlidingWindow(nums, k) {
  // Write your code here
  
}`,
      python: `def maxSlidingWindow(nums: list[int], k: int) -> list[int]:
    # Write your code here
    pass`,
      cpp: `#include <vector>
using namespace std;

vector<int> maxSlidingWindow(vector<int>& nums, int k) {
    // Write your code here
    
}`,
    },
  },
  {
    id: 8,
    title: 'LRU Cache',
    difficulty: 'Hard',
    xp: 25,
    category: 'System Optimization',
    requiredComplexity: 'O(1) per operation',
    functionName: 'LRUCache',
    type: 'class',
    compare: 'exact',
    desc: 'Design a least-recently-used cache with O(1) get and put.',
    statement: `Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.

Implement the LRUCache class:
- constructor(capacity): initialize the cache with a positive capacity
- get(key): return the value, or -1 if not present
- put(key, value): upsert the key; if full, evict the least recently used key

Test input format: [capacity, ops] where ops = [["get"|"put", ...args], ...]. The runner returns the result of every get.`,
    constraints: ['1 <= capacity <= 3000', '0 <= key <= 10^4', '0 <= value <= 10^5', 'O(1) average time for both operations'],
    examples: [
      {
        input: 'LRUCache(2) → put(1,1), put(2,2), get(1), put(3,3), get(2), put(4,4), get(1), get(3), get(4)',
        output: '[1, -1, -1, 3, 4]',
        explanation: 'put(3,3) evicts key 2; put(4,4) evicts key 1',
      },
    ],
    testCases: [
      {
        input: [2, [['put', 1, 1], ['put', 2, 2], ['get', 1], ['put', 3, 3], ['get', 2], ['put', 4, 4], ['get', 1], ['get', 3], ['get', 4]]],
        expectedOutput: [1, -1, -1, 3, 4],
        hidden: false,
      },
      {
        input: [1, [['put', 2, 1], ['get', 2], ['put', 3, 2], ['get', 2], ['get', 3]]],
        expectedOutput: [1, -1, 2],
        hidden: false,
      },
      {
        input: [3, [['put', 1, 10], ['put', 2, 20], ['put', 3, 30], ['get', 1], ['get', 2], ['get', 3]]],
        expectedOutput: [10, 20, 30],
        hidden: false,
      },
      {
        input: [2, [['get', 99]]],
        expectedOutput: [-1],
        hidden: false,
      },
      {
        input: [2, [['put', 1, 1], ['get', 1], ['put', 2, 2], ['put', 3, 3], ['get', 1], ['get', 2], ['get', 3]]],
        expectedOutput: [1, -1, 2, 3],
        hidden: false,
      },
      {
        input: [1000, Array.from({ length: 1000 }, (_, i) => ['put', i, i]).concat(Array.from({ length: 1000 }, (_, i) => ['get', i]))],
        expectedOutput: Array.from({ length: 1000 }, (_, i) => i),
        hidden: true,
      },
      {
        input: [50, Array.from({ length: 5000 }, (_, i) => ['put', i % 100, i]).concat([['get', 0]])],
        expectedOutput: [-1],
        hidden: true,
      },
    ],
    starterCode: {
      javascript: `class LRUCache {
  constructor(capacity) {
    // Write your code here
    
  }

  get(key) {
    // Write your code here
    
  }

  put(key, value) {
    // Write your code here
    
  }
}`,
      python: `class LRUCache:
    def __init__(self, capacity: int):
        # Write your code here
        pass

    def get(self, key: int) -> int:
        # Write your code here
        pass

    def put(self, key: int, value: int) -> None:
        # Write your code here
        pass`,
      cpp: `class LRUCache {
public:
    LRUCache(int capacity) {
        // Write your code here
        
    }

    int get(int key) {
        // Write your code here
        
    }

    void put(int key, int value) {
        // Write your code here
        
    }
};`,
    },
  },
  {
    id: 9,
    title: 'Course Schedule',
    difficulty: 'Hard',
    xp: 28,
    category: 'Algorithms & DSA',
    requiredComplexity: 'O(V + E) topological sort',
    functionName: 'canFinish',
    type: 'function',
    compare: 'exact',
    desc: 'Detect cycles in a course prerequisite graph.',
    statement: `There are a total of numCourses courses you have to take, labeled from 0 to numCourses - 1.

You are given an array prerequisites where prerequisites[i] = [a, b] means you must take course b before course a.

Return true if you can finish all courses (the graph is acyclic), false otherwise.`,
    constraints: ['1 <= numCourses <= 2000', '0 <= prerequisites.length <= 5000', 'prerequisites[i] = [a, b] with 0 <= a, b < numCourses'],
    examples: [
      { input: 'canFinish(2, [[1,0]])', output: 'true', explanation: 'Take 0, then 1' },
      { input: 'canFinish(2, [[1,0],[0,1]])', output: 'false', explanation: 'Circular dependency' },
    ],
    testCases: [
      { input: [2, [[1, 0]]], expectedOutput: true, hidden: false },
      { input: [2, [[1, 0], [0, 1]]], expectedOutput: false, hidden: false },
      { input: [4, [[1, 0], [2, 1], [3, 2]]], expectedOutput: true, hidden: false },
      { input: [5, [[0, 1], [1, 2], [2, 0], [3, 4]]], expectedOutput: false, hidden: false },
      { input: [1, []], expectedOutput: true, hidden: false },
      { input: [3, [[0, 1], [0, 2], [1, 2]]], expectedOutput: true, hidden: false },
      { input: [1000, Array.from({ length: 999 }, (_, i) => [i + 1, i])], expectedOutput: true, hidden: true },
      { input: [1000, Array.from({ length: 1000 }, (_, i) => [i, (i + 1) % 1000])], expectedOutput: false, hidden: true },
      { input: [1000, []], expectedOutput: true, hidden: true },
    ],
    starterCode: {
      javascript: `function canFinish(numCourses, prerequisites) {
  // Write your code here
  
}`,
      python: `def canFinish(numCourses: int, prerequisites: list[list[int]]) -> bool:
    # Write your code here
    pass`,
      cpp: `#include <vector>
using namespace std;

bool canFinish(int numCourses, vector<vector<int>>& prerequisites) {
    // Write your code here
    
}`,
    },
  },

  // ================= INSANE — 400–500 XP =================
  {
    id: 10,
    title: 'Trapping Rain Water',
    difficulty: 'Insane',
    xp: 30,
    category: 'Algorithms & DSA',
    requiredComplexity: 'O(n) — two pointers',
    functionName: 'trap',
    type: 'function',
    compare: 'exact',
    desc: 'Compute how much water can be trapped between elevation bars.',
    statement: `Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.

Water is trapped when a bar sits between two taller bars.`,
    constraints: ['n == height.length', '1 <= n <= 2 * 10^4', '0 <= height[i] <= 10^5'],
    examples: [
      { input: 'trap([0,1,0,2,1,0,1,3,2,1,2,1])', output: '6', explanation: '6 units of water are trapped between the bars' },
    ],
    testCases: [
      { input: [[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]], expectedOutput: 6, hidden: false },
      { input: [[4, 2, 0, 3, 2, 5]], expectedOutput: 9, hidden: false },
      { input: [[]], expectedOutput: 0, hidden: false },
      { input: [[5]], expectedOutput: 0, hidden: false },
      { input: [[3, 0, 0, 2, 0, 4]], expectedOutput: 10, hidden: false },
      { input: [[2, 0, 2]], expectedOutput: 2, hidden: false },
      { input: [Array.from({ length: 20000 }, (_, i) => [3, 0, 0, 2, 0, 4][i % 6])], expectedOutput: 49990, hidden: true },
      { input: [Array.from({ length: 50000 }, (_, i) => (i % 2 === 0 ? 1 : 0))], expectedOutput: 24999, hidden: true },
      { input: [Array.from({ length: 10000 }, (_, i) => i)], expectedOutput: 0, hidden: true },
    ],
    starterCode: {
      javascript: `function trap(height) {
  // Write your code here
  
}`,
      python: `def trap(height: list[int]) -> int:
    # Write your code here
    pass`,
      cpp: `#include <vector>
using namespace std;

int trap(vector<int>& height) {
    // Write your code here
    
}`,
    },
  },
  {
    id: 11,
    title: 'Median of Two Sorted Arrays',
    difficulty: 'Insane',
    xp: 30,
    category: 'Algorithms & DSA',
    requiredComplexity: 'O(log(min(m, n))) binary search',
    functionName: 'findMedianSortedArrays',
    type: 'function',
    compare: 'exact',
    desc: 'Return the median of two sorted arrays in O(log(n + m)).',
    statement: `Given two sorted arrays nums1 and nums2 of sizes m and n, return the median of the two sorted arrays.

The overall run time complexity must be O(log(m + n)).`,
    constraints: ['0 <= m, n <= 1000', '1 <= m + n <= 2000', '-10^6 <= nums1[i], nums2[i] <= 10^6'],
    examples: [
      { input: 'findMedianSortedArrays([1,3], [2])', output: '2', explanation: 'Merged: [1,2,3], median 2' },
      { input: 'findMedianSortedArrays([1,2], [3,4])', output: '2.5', explanation: 'Merged: [1,2,3,4], median (2+3)/2' },
    ],
    testCases: [
      { input: [[1, 3], [2]], expectedOutput: 2, hidden: false },
      { input: [[1, 2], [3, 4]], expectedOutput: 2.5, hidden: false },
      { input: [[], [1]], expectedOutput: 1, hidden: false },
      { input: [[0, 0], [0, 0]], expectedOutput: 0, hidden: false },
      { input: [[1, 2, 3], [4, 5, 6]], expectedOutput: 3.5, hidden: false },
      { input: [[2], []], expectedOutput: 2, hidden: false },
      { input: [Array.from({ length: 10000 }, (_, i) => i * 2), Array.from({ length: 10000 }, (_, i) => i * 2 + 1)], expectedOutput: 9999.5, hidden: true },
      { input: [[], Array.from({ length: 1000 }, (_, i) => i)], expectedOutput: 499.5, hidden: true },
      { input: [[5], [1, 2, 3, 4, 6, 7, 8, 9]], expectedOutput: 5, hidden: true },
    ],
    starterCode: {
      javascript: `function findMedianSortedArrays(nums1, nums2) {
  // Write your code here
  
}`,
      python: `def findMedianSortedArrays(nums1: list[int], nums2: list[int]) -> float:
    # Write your code here
    pass`,
      cpp: `#include <vector>
using namespace std;

double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {
    // Write your code here
    
}`,
    },
  },
  {
    id: 12,
    title: 'Virtual DOM Diffing Engine',
    difficulty: 'Insane',
    xp: 30,
    category: 'Web Architecture',
    requiredComplexity: 'O(max(m, n)) recursive diff',
    functionName: 'diffVdom',
    type: 'function',
    compare: 'exact',
    desc: 'Compute the minimal patch operations between two virtual DOM trees.',
    statement: `Write the engine that powers a reactive UI framework: compute the minimal set of patch operations between two virtual DOM children lists.

A node is { tag: string, children?: Node[] } (a node with no children is a leaf).

diffVdom(oldChildren, newChildren) returns an array of operations:
- ['r', path, node]  replace the node at path
- ['x', path]        remove the node at path
- ['a', path, node]  add the node at path
- ['u', path, ops]   recurse into children of the node at path

path is an array of child indexes from the root. Apply ops in array order — later paths refer to the tree as patched by earlier ops.`,
    constraints: [
      'Trees are plain objects: { tag, children? }',
      'Two nodes are replaced when their tags differ',
      'Matching tags recurse (u) instead of replacing',
    ],
    examples: [
      {
        input: 'diffVdom([{tag:"p"},{tag:"span"}], [{tag:"p"},{tag:"strong"}])',
        output: '[["r",[1],{tag:"strong"}]]',
        explanation: 'The span at index 1 became a strong',
      },
    ],
    testCases: [
      {
        input: [[{ tag: 'p' }, { tag: 'span' }], [{ tag: 'p' }, { tag: 'strong' }]],
        expectedOutput: [['r', [1], { tag: 'strong' }]],
        hidden: false,
      },
      {
        input: [[{ tag: 'p' }, { tag: 'span' }], [{ tag: 'p' }]],
        expectedOutput: [['x', [1]]],
        hidden: false,
      },
      {
        input: [[{ tag: 'p' }], [{ tag: 'p' }, { tag: 'div' }]],
        expectedOutput: [['a', [1], { tag: 'div' }]],
        hidden: false,
      },
      {
        input: [
          [{ tag: 'div', children: [{ tag: 'p' }] }, { tag: 'span' }],
          [{ tag: 'div', children: [{ tag: 'strong' }] }, { tag: 'span' }],
        ],
        expectedOutput: [['u', [0], [['r', [0], { tag: 'strong' }]]]],
        hidden: false,
      },
      {
        input: [[], []],
        expectedOutput: [],
        hidden: false,
      },
      {
        input: [
          [{ tag: 'ul', children: [{ tag: 'li' }, { tag: 'li' }] }],
          [{ tag: 'ul', children: [{ tag: 'li' }, { tag: 'li', children: [{ tag: 'a' }] }] }],
        ],
        expectedOutput: [['u', [0], [['u', [1], [['a', [0], { tag: 'a' }]]]]]],
        hidden: false,
      },
      {
        input: [Array.from({ length: 5000 }, () => ({ tag: 'p' })), Array.from({ length: 5000 }, () => ({ tag: 'strong' }))],
        expectedOutput: Array.from({ length: 5000 }, (_, i) => ['r', [i], { tag: 'strong' }]),
        hidden: true,
      },
      {
        input: [
          [{ tag: 'div', children: Array.from({ length: 100 }, (_, i) => ({ tag: 'span', children: [{ tag: `c${i}` }] })) }],
          [{ tag: 'div', children: Array.from({ length: 100 }, (_, i) => ({ tag: 'span', children: [{ tag: `c${i}` }] })) }],
        ],
        expectedOutput: [],
        hidden: true,
      },
    ],
    starterCode: {
      javascript: `function diffVdom(oldChildren, newChildren) {
  // Write your code here
  
}`,
      python: `def diffVdom(old_children: list[dict], new_children: list[dict]) -> list:
    # Write your code here
    pass`,
      cpp: `#include <string>
#include <vector>
using namespace std;

struct Node {
    string tag;
    vector<Node> children;
};

// Each patch op: { char type ('r'|'x'|'a'|'u'); vector<int> path; Node node; vector<Op> nested; }
// Define Op, then implement diffVdom below.
// vector<Op> diffVdom(vector<Node>& oldChildren, vector<Node>& newChildren) {
//     // Write your code here
// }`,
    },
  },
]

export const starterFallbacks = defaultStarters

export const challengeById = (id) => arenaChallenges.find((c) => String(c.id) === String(id))

const hashSeed = (s) => {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

const mulberry32 = (seed) => {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Deterministic daily rotation: every user sees the SAME 6 challenges on any
// given date (YYYY-MM-DD), and they rotate automatically every 24 hours.
// Balance: 2 Easy + 2 Medium + 2 Hard/Insane.
export const getDailyChallenges = (dateStr) => {
  const rng = mulberry32(hashSeed(dateStr))
  const pick = (pool, n) => {
    const arr = pool.slice()
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1))
      const tmp = arr[i]
      arr[i] = arr[j]
      arr[j] = tmp
    }
    return arr.slice(0, n)
  }
  const easy = pick(arenaChallenges.filter((c) => c.difficulty === 'Easy'), 2)
  const medium = pick(arenaChallenges.filter((c) => c.difficulty === 'Medium'), 2)
  const hardInsane = pick(
    arenaChallenges.filter((c) => c.difficulty === 'Hard' || c.difficulty === 'Insane'),
    2
  )
  return [...easy, ...medium, ...hardInsane]
}
