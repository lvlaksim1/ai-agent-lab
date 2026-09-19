"use strict";

function isConflict(error) {
  return error && (error.status === 409 || error.status === 422);
}

async function commitAtomicPlan({ store, changes, message, expectedHead }) {
  if (!store || typeof store.getHead !== "function") throw new Error("atomic store is required");
  if (!changes || typeof changes !== "object" || Array.isArray(changes)) throw new Error("changes map is required");
  const paths = Object.keys(changes).sort();
  if (paths.length === 0) throw new Error("atomic plan must contain at least one change");

  const currentHead = await store.getHead();
  if (currentHead !== expectedHead) return null;

  const baseTreeSha = await store.getTreeSha(expectedHead);
  const entries = [];
  for (const path of paths) {
    const content = changes[path];
    if (content === null) {
      entries.push({ path, mode: "100644", type: "blob", sha: null });
      continue;
    }
    if (typeof content !== "string") throw new Error("atomic change content must be string or null deletion: " + path);
    const blobSha = await store.createBlob(content);
    entries.push({ path, mode: "100644", type: "blob", sha: blobSha });
  }

  const treeSha = await store.createTree(baseTreeSha, entries);
  const commitSha = await store.createCommit(message, treeSha, expectedHead);

  try {
    await store.updateHead(commitSha, false);
  } catch (error) {
    if (isConflict(error)) return null;
    throw error;
  }

  return commitSha;
}

module.exports = { commitAtomicPlan };
