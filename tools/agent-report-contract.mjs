import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const contract = require("../.github/scripts/lib/report-contract.cjs");

export const START_V2_MARKERS = contract.START_V2_MARKERS;
export const OTK_V2_MARKERS = contract.OTK_V2_MARKERS;
export const validateStartReportV2 = contract.validateStartReportV2;
export const validateOtkReportV2 = contract.validateOtkReportV2;

function required(value,name){if(value===undefined||value===null||String(value).trim()==="")throw new Error(name+" is required");return String(value).trim();}
export function renderStartReportV2(data){const p=required(data.project,"project"),w=required(data.worker,"worker"),s=required(data.shift,"shift"),t=required(data.startedAt,"startedAt"),a=required(data.predecessorAssessment,"predecessorAssessment"),n=required(data.plan,"plan");return ["Проект: "+p,"Работник: "+w,"Смена: №"+s,"Начало смены: "+t,"","СТАРТОВЫЙ ДОКЛАД:","","ОЦЕНКА ПРЕДШЕСТВЕННИКА:",a,"","МОЙ ПЛАН:",n,""].join("\n");}
export function renderOtkReportV2(data){const f={project:required(data.project,"project"),worker:required(data.worker,"worker"),shift:required(data.shift,"shift"),startedAt:required(data.startedAt,"startedAt"),completedAt:required(data.completedAt,"completedAt"),stopReason:required(data.stopReason,"stopReason"),planned:required(data.planned,"planned"),actual:required(data.actual,"actual"),verified:required(data.verified,"verified"),boundary:required(data.boundary,"boundary"),next:required(data.next,"next"),progress:required(data.progress,"progress"),engineering:required(data.engineering,"engineering"),efficiency:required(data.efficiency,"efficiency"),planning:required(data.planning,"planning"),total:required(data.total,"total"),verdict:required(data.verdict,"verdict"),rating:required(data.rating,"rating")};return ["Проект: "+f.project,"Работник: "+f.worker,"Смена: №"+f.shift,"Начало смены: "+f.startedAt,"Конец смены: "+f.completedAt,"Причина завершения: "+f.stopReason,"","ЗАКЛЮЧЕНИЕ ОТК:","","ЧТО ПЛАНИРОВАЛ:",f.planned,"","ЧТО ФАКТИЧЕСКИ СДЕЛАНО:",f.actual,"","ЧТО ПОДТВЕРЖДЕНО:",f.verified,"","ГДЕ ОСТАНОВИЛСЯ:",f.boundary,"","СЛЕДУЮЩЕМУ:",f.next,"","Оценка ОТК:","Прогресс: "+f.progress+"/4","Инженерное качество: "+f.engineering+"/3","Эффективность/фокус: "+f.efficiency+"/2","Стартовая оценка и план: "+f.planning+"/1","Итого: "+f.total+"/10 — "+f.verdict,"Рейтинг: "+f.rating,""].join("\n");}
