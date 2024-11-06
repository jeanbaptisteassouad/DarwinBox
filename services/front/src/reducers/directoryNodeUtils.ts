import { StateDirectoryNode } from "./types.ts";

// To achieve the best performance in React,
// these functions recreate objects and arrays only when necessary.

export const insertDirectoryNodeById = (
  node: StateDirectoryNode,
  parentId: null | number,
  newNode: StateDirectoryNode,
): StateDirectoryNode => {
  if (parentId === null || parentId === node.id) {
    const subs = [...node.subs, newNode];
    subs.sort((a, b) => a.name.localeCompare(b.name));
    return {
      ...node,
      subs,
    };
  }

  for (const sub of node.subs) {
    const nextSub: StateDirectoryNode = insertDirectoryNodeById(
      sub,
      parentId,
      newNode,
    );
    if (nextSub !== sub) {
      return {
        ...node,
        subs: node.subs.map((sub) => {
          if (sub.id === nextSub.id) {
            return nextSub;
          } else {
            return sub;
          }
        }),
      };
    }
  }

  return node;
};

export const updateDirectoryNodeById = (
  node: StateDirectoryNode,
  id: number,
  updater: (node: StateDirectoryNode) => StateDirectoryNode,
): StateDirectoryNode => {
  for (const sub of node.subs) {
    if (sub.id === id) {
      const nextSub = updater(sub);
      const subs = node.subs.map((sub) => {
        if (sub.id === id) {
          return nextSub;
        } else {
          return sub;
        }
      });
      subs.sort((a, b) => a.name.localeCompare(b.name));
      return {
        ...node,
        subs,
      };
    } else {
      const nextSub: StateDirectoryNode = updateDirectoryNodeById(
        sub,
        id,
        updater,
      );
      if (nextSub !== sub) {
        return {
          ...node,
          subs: node.subs.map((sub) => {
            if (sub.id === nextSub.id) {
              return nextSub;
            } else {
              return sub;
            }
          }),
        };
      }
    }
  }

  return node;
};

export const deleteDirectoryNodeById = (
  node: StateDirectoryNode,
  id: number,
): StateDirectoryNode => {
  for (const sub of node.subs) {
    if (sub.id === id) {
      return {
        ...node,
        subs: node.subs.filter((sub) => {
          return sub.id !== id;
        }),
      };
    } else {
      const nextSub: StateDirectoryNode = deleteDirectoryNodeById(sub, id);
      if (nextSub !== sub) {
        return {
          ...node,
          subs: node.subs.map((sub) => {
            if (sub.id === nextSub.id) {
              return nextSub;
            } else {
              return sub;
            }
          }),
        };
      }
    }
  }

  return node;
};
