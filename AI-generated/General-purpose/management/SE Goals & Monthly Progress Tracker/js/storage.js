/* SE Goal Tracker: persistence, schema normalization and import/export. */
(function () {
  "use strict";
  var KEY = "se_goal_tracker_v1";
  var APP_ID = "se-goal-tracker";
  var VERSION = 1;
  var QUARTERS = ["q1", "q2", "q3", "q4"];
  var STATUSES = ["not_started", "in_progress", "completed"];

  function now() { return new Date().toISOString(); }
  function uid(prefix) {
    return prefix + "_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }
  function text(value, max) {
    if (typeof value !== "string") return "";
    return value.slice(0, max || 5000);
  }
  function validStatus(value) { return STATUSES.indexOf(value) >= 0 ? value : "not_started"; }
  function number(value) {
    var n = Number(value);
    if (!isFinite(n)) return 0;
    return Math.max(0, Math.min(100, Math.round(n)));
  }
  function quarters(source) {
    var out = {};
    source = source && typeof source === "object" ? source : {};
    QUARTERS.forEach(function (q) {
      var v = source[q] || {};
      out[q] = { planned: number(v.planned), actual: number(v.actual) };
    });
    return out;
  }
  function normalizeLong(item) {
    item = item || {};
    return {
      id: text(item.id, 100) || uid("ltg"),
      horizon: ["1y", "3y", "5y"].indexOf(item.horizon) >= 0 ? item.horizon : "1y",
      title: text(item.title, 250),
      description: text(item.description, 5000),
      status: validStatus(item.status),
      createdAt: text(item.createdAt, 80) || now(),
      updatedAt: text(item.updatedAt, 80) || now()
    };
  }
  function normalizeMilestone(item) {
    item = item || {};
    return {
      id: text(item.id, 100) || uid("ms"),
      title: text(item.title, 250),
      status: validStatus(item.status),
      quarters: quarters(item.quarters)
    };
  }
  function normalizeShort(item, longIds) {
    item = item || {};
    var link = text(item.longTermGoalId, 100);
    if (!link || longIds.indexOf(link) < 0) link = null;
    var milestones = Array.isArray(item.milestones) ? item.milestones.slice(0, 100).map(normalizeMilestone) : [];
    return {
      id: text(item.id, 100) || uid("stg"),
      longTermGoalId: link,
      title: text(item.title, 250),
      description: text(item.description, 5000),
      status: validStatus(item.status),
      manualProgressOverride: item.manualProgressOverride === true,
      quarters: quarters(item.quarters),
      milestones: milestones,
      createdAt: text(item.createdAt, 80) || now(),
      updatedAt: text(item.updatedAt, 80) || now()
    };
  }
  function normalizeReport(key, item) {
    item = item || {};
    return {
      yearMonth: /^\d{4}-\d{2}$/.test(item.yearMonth || key) ? (item.yearMonth || key) : key,
      doneThisMonth: text(item.doneThisMonth, 20000),
      planNextMonth: text(item.planNextMonth, 20000),
      consultation: text(item.consultation, 20000),
      updatedAt: text(item.updatedAt, 80) || now()
    };
  }
  function defaultData() {
    return {
      appId: APP_ID,
      schemaVersion: VERSION,
      settings: { fiscalStartMonth: 4, theme: "system", viewMode: "card", lastExportedAt: null },
      longTermGoals: [],
      shortTermGoals: [],
      monthlyReports: {}
    };
  }
  function normalize(raw) {
    var data = defaultData();
    if (!raw || typeof raw !== "object") return data;
    var s = raw.settings || {};
    data.settings.fiscalStartMonth = Math.max(1, Math.min(12, parseInt(s.fiscalStartMonth, 10) || 4));
    data.settings.theme = ["system", "light", "dark"].indexOf(s.theme) >= 0 ? s.theme : "system";
    data.settings.viewMode = s.viewMode === "list" ? "list" : "card";
    data.settings.lastExportedAt = typeof s.lastExportedAt === "string" ? s.lastExportedAt : null;
    data.longTermGoals = Array.isArray(raw.longTermGoals) ? raw.longTermGoals.slice(0, 1000).map(normalizeLong) : [];
    var ids = data.longTermGoals.map(function (g) { return g.id; });
    data.shortTermGoals = Array.isArray(raw.shortTermGoals) ? raw.shortTermGoals.slice(0, 3000).map(function (g) { return normalizeShort(g, ids); }) : [];
    var reports = raw.monthlyReports && typeof raw.monthlyReports === "object" ? raw.monthlyReports : {};
    Object.keys(reports).slice(0, 240).forEach(function (key) {
      if (/^\d{4}-\d{2}$/.test(key)) data.monthlyReports[key] = normalizeReport(key, reports[key]);
    });
    return data;
  }
  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return defaultData();
      return normalize(JSON.parse(raw));
    } catch (e) {
      console.warn("SE Tracker: local data could not be loaded.", e);
      return defaultData();
    }
  }
  function save(data) {
    try {
      localStorage.setItem(KEY, JSON.stringify(normalize(data)));
      return true;
    } catch (e) {
      console.error("SE Tracker: save failed.", e);
      return false;
    }
  }
  function exportJson(data) {
    var out = normalize(data);
    out.settings.lastExportedAt = now();
    save(out);
    return JSON.stringify(out, null, 2);
  }
  function importJson(raw) {
    var parsed;
    try { parsed = typeof raw === "string" ? JSON.parse(raw) : raw; }
    catch (e) { throw new Error("JSONの形式が正しくありません。"); }
    if (!parsed || typeof parsed !== "object" || parsed.appId !== APP_ID) {
      throw new Error("SE TrackerのバックアップJSONではありません。");
    }
    if (parsed.schemaVersion > VERSION) throw new Error("このバックアップは新しいバージョンで作成されています。");
    return normalize(parsed);
  }
  function subscribe(callback) {
    window.addEventListener("storage", function (event) {
      if (event.key === KEY && event.newValue) {
        try { callback(normalize(JSON.parse(event.newValue))); } catch (e) {}
      }
    });
  }
  window.SEStorage = {
    KEY: KEY, APP_ID: APP_ID, uid: uid, now: now, load: load, save: save,
    normalize: normalize, importJson: importJson, exportJson: exportJson,
    subscribe: subscribe, quarters: quarters
  };
})();