"use strict";

const assert = require("node:assert/strict");
const enqueue = require("../.github/scripts/enqueue-agent-event.cjs");

const parentSha = "a".repeat(40);
const reads = [];
const encode = (value) => ({ type:"file", content:Buffer.from(JSON.stringify(value)).toString("base64"), encoding:"base64" });

const github = {
  rest: {
    git: {
      async getRef(){ return { data:{ object:{ sha:parentSha } } }; },
      async getCommit(){ return { data:{ tree:{ sha:"tree-base" } } }; },
      async createBlob({content}){ return { data:{ sha:"blob-"+Buffer.byteLength(content) } }; },
      async createTree({tree}){ return { data:{ sha:"tree-next", entries:tree } }; },
      async createCommit(){ return { data:{ sha:"commit-next" } }; },
      async updateRef(){ return {}; }
    },
    repos: {
      async getContent({path,ref}) {
        reads.push({path,ref});
        if (path === ".agent/assignment.json") return { data:encode({schema_version:1,active_object:"obj",transfer_state:"working"}) };
        if (path === ".agent/objects/index.json") return { data:encode({schema_version:1,objects:[{id:"obj",repository:"owner/repo"}]}) };
        if (path === ".agent/wake.json") return { data:encode({schema_version:1,pending:false,generation:1,last_event:null,updated_at:null}) };
        if (path === ".agent/queue/pending/event-1.json") {
          const e=new Error("not found"); e.status=404; throw e;
        }
        throw new Error("unexpected path "+path);
      }
    }
  }
};
const notices=[];
const core={notice:(m)=>notices.push(m),warning:()=>{}};
const context={repo:{owner:"owner",repo:"repo"},eventName:"repository_dispatch"};

(async()=>{
  const result=await enqueue({
    github,context,core,branch:"work-webhook-test",
    rawEvent:{id:"event-1",type:"task",priority:50,goal:"snapshot test",target:{repository:"owner/repo",ref:"main"}}
  });
  assert.equal(result.commitSha,"commit-next");
  assert.ok(reads.length>=4);
  assert.deepEqual(new Set(reads.map((row)=>row.ref)),new Set([parentSha]),"all intake reads must use one immutable parent SHA");
  assert.ok(reads.some((row)=>row.path===".agent/queue/pending/event-1.json"));
  console.log("Enqueue snapshot replay test: OK");
})().catch((error)=>{console.error(error);process.exitCode=1;});
