/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const dateCache = new Map();

/**
 * Caches Date instances by timestamp (ms) to maintain reference equality across renders
 */
export const getCachedDate = (dateVal) => {
  if (!dateVal) return null;
  const ms = new Date(dateVal).getTime();
  if (Number.isNaN(ms)) return null;
  if (!dateCache.has(ms)) {
    dateCache.set(ms, new Date(ms));
  }
  return dateCache.get(ms);
};

/**
 * Cycle detection helper (BFS/DFS) to prevent circular card dependencies
 */
export const hasCircularDependency = (cardId, newDependencyId, dependenciesMap) => {
  if (String(cardId) === String(newDependencyId)) {
    return true;
  }

  const visited = new Set();
  const queue = [String(newDependencyId)];

  while (queue.length > 0) {
    const current = queue.shift();
    if (current === String(cardId)) {
      return true;
    }
    if (!visited.has(current)) {
      visited.add(current);
      const deps = dependenciesMap[current] || [];
      deps.forEach((depId) => {
        if (!visited.has(String(depId))) {
          queue.push(String(depId));
        }
      });
    }
  }

  return false;
};
