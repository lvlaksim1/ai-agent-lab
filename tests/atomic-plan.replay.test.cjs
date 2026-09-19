"use strict";

const assert = require("node:assert/strict");
const { commitAtomicPlan } = require("../.github/scripts/lib/atomic-plan.cjs");

function fakeStore({ head, failUpdate = false }) {
  const calls = [];
  return {
    calls,
    async getHead(){ calls.push(["getHead"]); return head; },
    async getTreeSha(sha){ calls.push(["getTreeSha",sha]); return "tree-base"; },
    async createBlob(content){ calls.push(["createBlob",content]); return "blob-"+calls.length; },
    async createTree(base,entries){ calls.push(["createTree",base,entries]); return "tree-next"; },
    async createCommit(message,tree,parent){ calls.push(["createCommit",message,tree,parent]); return "commit-next"; },
    async updateHead(sha,force){ calls.push(["updateHead",sha,force]); if(failUpdate){const e=new Error("conflict");e.status=409;throw e;} }
  };
}

(async()=>{
  const expected="a".repeat(40);
  const ok=fakeStore({head:expected});
  const commit=await commitAtomicPlan({store:ok,changes:{"z.txt":"z","a.txt":"a"},message:"test",expectedHead:expected});
  assert.equal(commit,"commit-next");
  const treeCall=ok.calls.find((x)=>x[0]==="createTree");
  assert.deepEqual(treeCall[2].map((x)=>x.path),["a.txt","z.txt"],"tree entries must be deterministic");
  const withDelete=fakeStore({head:expected});
  await commitAtomicPlan({store:withDelete,changes:{"delete.txt":null,"keep.txt":"x"},message:"delete",expectedHead:expected});
  const deleteTree=withDelete.calls.find((x)=>x[0]==="createTree");
  const deleteEntry=deleteTree[2].find((x)=>x.path==="delete.txt");
  assert.equal(deleteEntry.sha,null,"null change must become Git tree deletion");
  assert.equal(withDelete.calls.filter((x)=>x[0]==="createBlob").length,1,"deletion must not create a null blob");

  const raced=fakeStore({head:"b".repeat(40)});
  assert.equal(await commitAtomicPlan({store:raced,changes:{"a":"x"},message:"test",expectedHead:expected}),null);
  assert.equal(raced.calls.some((x)=>x[0]==="createBlob"),false,"head mismatch must not create blobs");

  const conflict=fakeStore({head:expected,failUpdate:true});
  assert.equal(await commitAtomicPlan({store:conflict,changes:{"a":"x"},message:"test",expectedHead:expected}),null,"ref CAS conflict must not overwrite branch");

  console.log("Atomic plan replay tests: OK");
})().catch((error)=>{console.error(error);process.exitCode=1;});
