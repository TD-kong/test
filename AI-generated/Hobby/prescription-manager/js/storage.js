(function () {
  'use strict';
  const { U } = window.RxApp;
  const KEY = 'rx.data', META = 'rx.meta', SCHEMA = 1;
  const str = (v, n = 500) => (typeof v === 'string' ? v.slice(0, n) : '');

  function normalize(p) {
    if (!p || typeof p !== 'object' || Array.isArray(p)) return { e: '処方箋の形式が不正です' };
    const recipient = str(p.recipient, 60).trim(), clinic = str(p.clinicName, 120).trim();
    if (!recipient) return { e: '服用者が空です' };
    if (!clinic) return { e: '医療機関名が空です' };
    if (!U.parseDate(p.prescribedDate)) return { e: '処方日が不正です: ' + str(p.prescribedDate, 20) };
    const days = p.daysSupply;
    if (!Number.isInteger(days) || days < 1 || days > 3650) return { e: '処方日数は1以上の整数にしてください' };
    if (typeof p.isDispensed !== 'boolean') return { e: '調剤済みフラグが不正です' };
    if (!Array.isArray(p.medicines)) return { e: '薬剤リストが不正です' };
    const meds = [];
    for (const m of p.medicines.slice(0, 100)) {
      if (!m || typeof m !== 'object' || !str(m.name, 120).trim()) return { e: '薬品名が空の薬剤があります' };
      meds.push({ id: str(m.id, 40) || U.uid(), name: str(m.name, 120).trim(), dosage: str(m.dosage, 60), usage: str(m.usage, 120), quantityOrDays: str(m.quantityOrDays, 60), note: str(m.note, 300) });
    }
    const now = new Date().toISOString(), ok = (t) => typeof t === 'string' && !isNaN(Date.parse(t));
    return { v: {
      id: str(p.id, 40) || U.uid(), recipient, prescribedDate: p.prescribedDate, daysSupply: days, isDispensed: p.isDispensed,
      clinicName: clinic, department: str(p.department, 60), pharmacyName: str(p.pharmacyName, 120), memo: str(p.memo, 1000),
      referenceUrl: str(p.referenceUrl, 500), medicines: meds, createdAt: ok(p.createdAt) ? p.createdAt : now, updatedAt: ok(p.updatedAt) ? p.updatedAt : now
    } };
  }
  function normalizeList(arr) {
    const out = [], seen = new Set();
    for (let i = 0; i < arr.length; i++) {
      const r = normalize(arr[i]);
      if (r.e) return { e: (i + 1) + '件目: ' + r.e };
      if (seen.has(r.v.id)) r.v.id = U.uid();
      seen.add(r.v.id); out.push(r.v);
    }
    return { v: out };
  }
  const S = {
    KEY, normalize,
    load() {
      try {
        const raw = localStorage.getItem(KEY);
        if (!raw) return { list: [] };
        const d = JSON.parse(raw), arr = Array.isArray(d) ? d : d && d.prescriptions; // v0 (bare array) migration
        if (!Array.isArray(arr)) return { list: [], error: '保存データが壊れています' };
        const r = normalizeList(arr);
        return r.e ? { list: [], error: '保存データを読み込めません(' + r.e + ')' } : { list: r.v };
      } catch (e) { return { list: [], error: '保存データを読み込めません' }; }
    },
    save(list) {
      try { localStorage.setItem(KEY, JSON.stringify({ schemaVersion: SCHEMA, prescriptions: list })); return { ok: true }; }
      catch (e) { return { ok: false, quota: e && (e.name === 'QuotaExceededError' || e.code === 22 || e.code === 1014) }; }
    },
    loadMeta() { try { return JSON.parse(localStorage.getItem(META)) || {}; } catch (e) { return {}; } },
    saveMeta(m) { try { localStorage.setItem(META, JSON.stringify(m)); return true; } catch (e) { return false; } },
    usageKB() {
      let b = 0;
      try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); b += (k.length + (localStorage.getItem(k) || '').length) * 2; } } catch (e) {}
      return (b / 1024).toFixed(1);
    },
    clearAll() { try { localStorage.removeItem(KEY); localStorage.removeItem(META); return true; } catch (e) { return false; } },
    exportJson(list) {
      return JSON.stringify({ app: 'prescription-manager', schemaVersion: SCHEMA, exportedAt: new Date().toISOString(), prescriptions: list }, null, 2);
    },
    parseImport(text) {
      let d;
      try { d = JSON.parse(text); } catch (e) { return { e: 'JSONとして読み込めません' }; }
      if (!d || d.app !== 'prescription-manager') return { e: 'このアプリのバックアップではありません' };
      if (typeof d.schemaVersion !== 'number' || d.schemaVersion > SCHEMA) return { e: '未対応のスキーマバージョンです' };
      if (!Array.isArray(d.prescriptions)) return { e: 'prescriptions が配列ではありません' };
      return normalizeList(d.prescriptions);
    },
    onExternal(cb) { window.addEventListener('storage', (e) => { if (e.key === KEY || e.key === null) cb(); }); }
  };
  window.RxApp.S = S;
})();
