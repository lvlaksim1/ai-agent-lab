import assert from "node:assert/strict";
import {renderStartReportV2,renderOtkReportV2,validateStartReportV2,validateOtkReportV2} from "../tools/agent-report-contract.mjs";
const start=renderStartReportV2({project:"Example",worker:"Петрович",shift:1,startedAt:"19.09.2026 15:00:00 МСК",predecessorAssessment:"Evidence.",plan:"Plan with success criterion."});
assert.deepEqual(validateStartReportV2(start,"valid start"),[]);
assert.ok(validateStartReportV2("# Смена 1 — Петрович\n\n## ОЦЕНКА ПРЕДШЕСТВЕННИКА\nX\n\n## МОЙ ПЛАН\nY","invalid start").length>0);
const otk=renderOtkReportV2({project:"Example",worker:"Петрович",shift:1,startedAt:"19.09.2026 15:00:00 МСК",completedAt:"19.09.2026 15:05:00 МСК",stopReason:"project_or_phase_complete",planned:"Plan",actual:"Actual",verified:"Verified",boundary:"Boundary",next:"Next",progress:4,engineering:3,efficiency:2,planning:1,total:10,verdict:"APPROVED",rating:"1200 (+10)"});
assert.deepEqual(validateOtkReportV2(otk,"valid OTK"),[]);
console.log("Agent report contract tests: OK");
