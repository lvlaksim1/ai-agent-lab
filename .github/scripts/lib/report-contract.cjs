"use strict";

const START_V2_MARKERS = Object.freeze([
  "Проект:",
  "Работник:",
  "Смена:",
  "Начало смены:",
  "СТАРТОВЫЙ ДОКЛАД:",
  "ОЦЕНКА ПРЕДШЕСТВЕННИКА:",
  "МОЙ ПЛАН:"
]);

const OTK_V2_MARKERS = Object.freeze([
  "Проект:",
  "Работник:",
  "Смена:",
  "Начало смены:",
  "Конец смены:",
  "Причина завершения:",
  "ЗАКЛЮЧЕНИЕ ОТК:",
  "ЧТО ПЛАНИРОВАЛ:",
  "ЧТО ФАКТИЧЕСКИ СДЕЛАНО:",
  "ЧТО ПОДТВЕРЖДЕНО:",
  "ГДЕ ОСТАНОВИЛСЯ:",
  "СЛЕДУЮЩЕМУ:",
  "Оценка ОТК:",
  "Прогресс:",
  "Инженерное качество:",
  "Эффективность/фокус:",
  "Стартовая оценка и план:",
  "Итого:",
  "Рейтинг:"
]);

function missingMarkers(body, markers, label) {
  const errors = [];
  for (const marker of markers) {
    if (!String(body || "").includes(marker)) errors.push(label + " missing marker: " + marker);
  }
  return errors;
}

function validateStartReportV2(body, label = "start report") {
  const errors = missingMarkers(body, START_V2_MARKERS, label);
  if (String(body || "").includes("ЧТО ПОЛУЧИЛОСЬ:")) errors.push(label + " must not contain end-of-shift result");
  if (String(body || "").includes("Оценка ОТК:")) errors.push(label + " must not contain OTK score");
  return errors;
}

function validateOtkReportV2(body, label = "OTK report") {
  return missingMarkers(body, OTK_V2_MARKERS, label);
}

module.exports = {
  START_V2_MARKERS,
  OTK_V2_MARKERS,
  validateStartReportV2,
  validateOtkReportV2
};
