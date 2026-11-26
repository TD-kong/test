(function () {
  'use strict';
  const { U, S } = window.RxApp, { h, icon } = U, $ = (s) => document.querySelector(s);
  let meta = S.loadMeta();
  const first = S.load();
  let list = first.list;
  const st = { status: 'all', rec: '', q: '', sort: 'new' };
  let view = meta.view === 'list' ? 'list' : 'card';
  const LBL = { all: 'すべて', pending: '未調剤', active: '服用中', soon: 'まもなく終了', ended: '終了済み' };
  const BI = { pending: 'clock', active: 'pill', soon: 'alert', ended: 'check' };
  const saveMeta = () => S.saveMeta(meta);

  /* ---------- status ---------- */
  function calc(p, today) {
    const start = U.parseDate(p.prescribedDate), end = U.addDays(start, p.daysSupply - 1);
    if (!p.isDispensed) { // 受取期限: 処方日を含め4日間 (処方日+3日の末日まで)
      const exp = U.addDays(start, 3), r = U.diff(exp, today);
      return { status: 'pending', start, end, exp, r, label: r < 0 ? '期限切れ' + -r + '日' : r === 0 ? '今日まで' : '期限まであと' + r + '日' };
    }
    const r = U.diff(end, today); // 終了予定日(含む)までの残り日数
    if (r < 0) return { status: 'ended', start, end, r, label: '終了から' + -r + '日' };
    return { status: r <= 3 ? 'soon' : 'active', start, end, r, label: r === 0 ? '今日まで' : 'あと' + r + '日' };
  }
  window.RxApp.calc = calc;

  /* ---------- helpers ---------- */
  let tt = null;
  function toast(msg, act, ms) {
    const t = $('#toast'); clearTimeout(tt); t.replaceChildren(h('span', {}, msg));
    if (act) t.append(h('button.btn', { type: 'button', onclick: () => { t.hidden = true; act.fn(); } }, act.t));
    t.hidden = false; tt = setTimeout(() => { t.hidden = true; }, ms || 4000);
  }
  function openD(d) {
    const prev = document.activeElement; d.showModal();
    d.addEventListener('close', () => { if (prev && prev.isConnected) prev.focus(); }, { once: true });
  }
  function ask(msg, btns) {
    return new Promise((res) => {
      const d = $('#dConfirm'), box = $('#cBtns'); let done = false;
      $('#cMsg').textContent = msg; box.replaceChildren();
      const fin = (v) => { if (done) return; done = true; d.close(); res(v); };
      btns.forEach((b, i) => box.append(h('button.btn' + (b.cls ? '.' + b.cls : ''), { type: 'button', onclick: () => fin(i) }, b.t)));
      d.oncancel = (e) => { e.preventDefault(); fin(-1); };
      openD(d); box.firstChild.focus();
    });
  }
  function persist() {
    const r = S.save(list), now = Date.now();
    if (!meta.created) meta.created = now;
    meta.lastUpdate = now; saveMeta();
    if (!r.ok) toast(r.quota ? '保存容量がいっぱいで保存できませんでした。JSONバックアップを書き出し、終了済みの記録を削除してください。' : '保存に失敗しました。JSONバックアップを書き出してください。', null, 9000);
    return r.ok;
  }

  /* ---------- render ---------- */
  const hay = (p) => [p.recipient, p.clinicName, p.pharmacyName, p.department, p.memo, ...p.medicines.map((m) => m.name + ' ' + m.usage)].join('\n').toLowerCase();
  function fillLists() {
    const dl = (id, arr) => $(id).replaceChildren(...arr.map((v) => h('option', { value: v })));
    const meds = list.flatMap((p) => p.medicines);
    dl('#dlRec', U.uniq(['本人', '母', '父', '子', '配偶者', ...list.map((p) => p.recipient)]));
    dl('#dlClinic', U.uniq(list.map((p) => p.clinicName))); dl('#dlPharm', U.uniq(list.map((p) => p.pharmacyName)));
    dl('#dlDept', U.uniq(list.map((p) => p.department))); dl('#dlMed', U.uniq(meds.map((m) => m.name)));
    dl('#dlUsage', U.uniq(['毎食後 1日3回', '朝食後 1日1回', '朝夕食後 1日2回', '就寝前 1日1回', '頓服', ...meds.map((m) => m.usage)]));
    const recs = U.uniq(list.map((p) => p.recipient)); if (st.rec && !recs.includes(st.rec)) st.rec = '';
    $('#fRec').replaceChildren(h('option', { value: '' }, '全服用者'), ...recs.map((r) => h('option', { value: r, selected: r === st.rec }, r)));
  }
  function render() {
    const today = U.today(), all = list.map((p) => ({ p, c: calc(p, today) })), q = st.q.trim().toLowerCase();
    fillLists();
    const base = all.filter((x) => (!st.rec || x.p.recipient === st.rec) && (!q || hay(x.p).includes(q)));
    const cnt = { all: base.length, pending: 0, active: 0, soon: 0, ended: 0 };
    base.forEach((x) => cnt[x.c.status]++);
    $('#summary').replaceChildren(...Object.keys(LBL).map((k) => h('button.sum', { type: 'button', 'aria-pressed': String(st.status === k), onclick: () => { st.status = k; render(); } }, h('span', {}, LBL[k]), h('b', {}, String(cnt[k])))));
    const items = st.status === 'all' ? base.slice() : base.filter((x) => x.c.status === st.status);
    items.sort((a, b) => st.sort === 'old' ? a.c.start - b.c.start : st.sort === 'end' ? a.c.end - b.c.end || b.c.start - a.c.start : b.c.start - a.c.start);
    const box = $('#list'); box.className = view === 'card' ? 'cards' : '';
    box.replaceChildren(...items.map((x) => (view === 'card' ? card(x) : row(x))));
    $('#count').textContent = list.length ? items.length + '件を表示' : '';
    const nEnded = all.filter((x) => x.c.status === 'ended').length, pb = $('#bPurge');
    pb.hidden = !nEnded; pb.replaceChildren(icon('trash'), '終了済みを整理(' + nEnded + ')');
    const em = $('#empty');
    em.hidden = items.length > 0;
    if (!em.hidden) {
      em.replaceChildren(list.length ? h('p', {}, '条件に合う記録がありません。絞り込みや検索語を変えてみてください。') : h('div', {}, h('h2', {}, 'まだ記録がありません'), h('p.muted', {}, '処方箋を登録すると、服用期間と受取期限を自動で数えます。データはこの端末のブラウザ内だけに保存されます。'),
        h('div.acts', {}, h('button.btn', { type: 'button', onclick: addSample }, 'サンプルデータを入れて試す'), h('button.btn.primary', { type: 'button', onclick: () => openForm('new') }, '新規処方箋を登録する'))));
    }
    renderBackup();
  }
  function badge(c) { return h('span.badge.b-' + c.status, {}, icon(BI[c.status]), LBL[c.status] + ' ・ ' + c.label); }
  function actBtns(p) {
    return [
      !p.isDispensed && h('button.btn', { type: 'button', 'aria-label': '調剤済みにする', onclick: () => { p.isDispensed = true; p.updatedAt = new Date().toISOString(); persist(); render(); toast('調剤済みにしました'); } }, icon('check'), '調剤済み'),
      h('button.btn', { type: 'button', 'aria-label': '編集', onclick: () => openForm('edit', p) }, icon('edit'), '編集'),
      h('button.btn', { type: 'button', 'aria-label': '複製して新規作成(リピート処方)', onclick: () => openForm('dup', p) }, icon('copy'), '複製'),
      h('button.btn.danger', { type: 'button', 'aria-label': '削除', onclick: () => del(p) }, icon('trash'))
    ];
  }
  function urlNode(p) {
    if (!p.referenceUrl) return null;
    const u = U.safeUrl(p.referenceUrl);
    return h('div.line', {}, icon('link'), u ? h('a', { href: u, target: '_blank', rel: 'noopener noreferrer' }, p.referenceUrl) : h('span', {}, p.referenceUrl + '(http/https以外のため無効)'));
  }
  function card({ p, c }) {
    const dateLine = '処方日 ' + U.fmt(c.start) + ' ・ ' + p.daysSupply + '日分 ・ 終了予定 ' + U.fmt(c.end) + (c.exp ? ' ・ 受取期限 ' + U.fmt(c.exp) : '');
    return h('article.card.' + c.status, {},
      h('header', {}, h('span.chip', {}, p.recipient), badge(c)),
      h('div.line', {}, icon('hospital'), p.clinicName + (p.department ? '(' + p.department + ')' : '')),
      p.pharmacyName && h('div.line', {}, icon('pill'), p.pharmacyName),
      h('div.line', {}, icon('clock'), dateLine),
      h('ul.tags', {}, p.medicines.map((m) => h('li', {}, [m.name, m.dosage, m.usage, m.quantityOrDays].filter(Boolean).join(' / ') + (m.note ? '(' + m.note + ')' : '')))),
      p.memo && h('div.line', {}, '📝 ' + p.memo), urlNode(p), h('div.acts', {}, actBtns(p)));
  }
  function row({ p, c }) {
    const meds = p.medicines.map((m) => m.name).join('、');
    return h('div.row.' + c.status, {},
      h('div.main', {}, badge(c), h('div', {}, h('b', {}, p.recipient), ' ' + p.clinicName), h('div.sub', {}, meds + ' ・ 終了予定 ' + U.fmt(c.end))),
      h('div.acts', {}, h('button.btn.icon', { type: 'button', 'aria-label': '編集', onclick: () => openForm('edit', p) }, icon('edit')), h('button.btn.icon', { type: 'button', 'aria-label': '複製', onclick: () => openForm('dup', p) }, icon('copy')), h('button.btn.icon.danger', { type: 'button', 'aria-label': '削除', onclick: () => del(p) }, icon('trash'))));
  }
  function renderBackup() {
    const b = $('#backup'), lu = meta.lastUpdate || 0, le = meta.lastExport || 0, base = le || meta.created || lu, d = Math.floor((Date.now() - base) / 864e5);
    const need = list.length && lu > le && d >= 14; b.hidden = !need;
    if (need) b.replaceChildren(h('span', {}, '最後のバックアップから' + d + '日が経過しています。JSONを書き出して保管すると安心です。'), h('button.btn', { type: 'button', onclick: doExport }, '今すぐバックアップ'));
  }

  /* ---------- form ---------- */
  let editing = null, snap = null;
  const F = () => $('#form').elements;
  function medRow(m) {
    m = m || {};
    const f = (k, label, extra) => h('label' + (extra || ''), {}, label, h('input', Object.assign({ 'data-k': k, value: m[k] || '', maxlength: k === 'note' ? 300 : 120 }, k === 'name' ? { list: 'dlMed' } : k === 'usage' ? { list: 'dlUsage' } : {})));
    const r = h('div.mrow', { 'data-id': m.id || U.uid() }, f('name', '薬品名(必須)', '.full'), f('dosage', '用量(例: 60mg)'), f('usage', '用法(例: 毎食後 1日3回)'), f('quantityOrDays', '日数・残数メモ'), f('note', '服用上の注意'),
      h('div.ctl', {},
        h('button.btn', { type: 'button', 'aria-label': '上へ', onclick: () => r.previousElementSibling && r.previousElementSibling.before(r) }, icon('arrup')),
        h('button.btn', { type: 'button', 'aria-label': '下へ', onclick: () => r.nextElementSibling && r.nextElementSibling.after(r) }, icon('arrdn')),
        h('button.btn.danger', { type: 'button', 'aria-label': 'この薬剤を削除', onclick: () => r.remove() }, icon('trash'))));
    return r;
  }
  function readForm() {
    const e = F();
    return { recipient: e.recipient.value.trim(), prescribedDate: e.prescribedDate.value, daysSupply: e.daysSupply.value.trim(), isDispensed: e.isDispensed.checked, clinicName: e.clinicName.value.trim(), department: e.department.value.trim(), pharmacyName: e.pharmacyName.value.trim(), referenceUrl: e.referenceUrl.value.trim(), memo: e.memo.value.trim(),
      medicines: [...document.querySelectorAll('#meds .mrow')].map((r) => { const o = { id: r.dataset.id }; r.querySelectorAll('input').forEach((i) => { o[i.dataset.k] = i.value.trim(); }); return o; }) };
  }
  function openForm(mode, p) {
    editing = mode === 'edit' ? p : null;
    const e = F(), src = p || { recipient: '', daysSupply: 7, isDispensed: false, medicines: [] };
    $('#form').reset(); $('#fErr').hidden = true;
    e.recipient.value = src.recipient; e.clinicName.value = src.clinicName || ''; e.department.value = src.department || ''; e.pharmacyName.value = src.pharmacyName || '';
    if (mode === 'edit') { e.prescribedDate.value = p.prescribedDate; e.daysSupply.value = p.daysSupply; e.isDispensed.checked = p.isDispensed; e.referenceUrl.value = p.referenceUrl; e.memo.value = p.memo; }
    else { e.prescribedDate.value = U.iso(U.today()); e.daysSupply.value = mode === 'dup' ? p.daysSupply : 7; e.isDispensed.checked = false; }
    $('#meds').replaceChildren(...(src.medicines.length ? src.medicines : [{}]).map((m) => medRow(mode === 'dup' ? Object.assign({}, m, { id: U.uid() }) : m)));
    $('#fTitle').textContent = mode === 'edit' ? '処方箋を編集' : mode === 'dup' ? 'リピート処方として登録' : '新規処方箋を登録';
    snap = JSON.stringify(readForm()); openD($('#dForm')); e.recipient.focus();
  }
  async function closeForm() {
    if (JSON.stringify(readForm()) !== snap) { const i = await ask('入力内容が保存されていません。破棄して閉じますか?', [{ t: '編集を続ける' }, { t: '破棄して閉じる', cls: 'danger' }]); if (i !== 1) return; }
    $('#dForm').close();
  }
  function submitForm(ev) {
    ev.preventDefault();
    const d = readForm(), err = (m) => { const b = $('#fErr'); b.textContent = m; b.hidden = false; b.scrollIntoView({ block: 'nearest' }); };
    if (!d.recipient) return err('服用者を入力してください。');
    if (!U.parseDate(d.prescribedDate)) return err('処方日を正しく入力してください。');
    if (!/^\d+$/.test(d.daysSupply) || +d.daysSupply < 1) return err('処方日数は1以上の整数で入力してください。');
    if (!d.clinicName) return err('医療機関名を入力してください。');
    if (d.referenceUrl && !U.safeUrl(d.referenceUrl)) return err('参考URLは http:// または https:// で始まるものだけ登録できます。');
    const meds = d.medicines.filter((m) => m.name || m.dosage || m.usage || m.quantityOrDays || m.note);
    if (meds.some((m) => !m.name)) return err('薬品名が空の薬剤があります。');
    if (!meds.length) return err('薬剤を1件以上入力してください。');
    const now = new Date().toISOString();
    const r = S.normalize(Object.assign({}, d, { daysSupply: +d.daysSupply, medicines: meds, id: editing ? editing.id : U.uid(), createdAt: editing ? editing.createdAt : now, updatedAt: now }));
    if (r.e) return err(r.e);
    if (editing) list[list.findIndex((x) => x.id === editing.id)] = r.v; else list.push(r.v);
    persist(); snap = JSON.stringify(readForm()); $('#dForm').close(); render(); toast('保存しました');
  }

  /* ---------- delete / import / export ---------- */
  function removeItems(ids) {
    const removed = list.map((p, i) => ({ p, i })).filter((x) => ids.includes(x.p.id));
    list = list.filter((p) => !ids.includes(p.id)); persist(); render();
    toast(ids.length + '件を削除しました', { t: '元に戻す', fn: () => { removed.forEach((x) => list.splice(Math.min(x.i, list.length), 0, x.p)); persist(); render(); } }, 7000);
  }
  async function del(p) { if ((await ask('「' + p.recipient + ' / ' + p.clinicName + '」を削除しますか?', [{ t: 'キャンセル' }, { t: '削除する', cls: 'danger' }])) === 1) removeItems([p.id]); }
  async function purge() {
    const t = U.today(), ids = list.filter((p) => calc(p, t).status === 'ended').map((p) => p.id);
    if (ids.length && (await ask('終了済みの記録 ' + ids.length + '件をまとめて削除します。よろしいですか?', [{ t: 'キャンセル' }, { t: ids.length + '件を削除', cls: 'danger' }])) === 1) removeItems(ids);
  }
  function doExport() {
    const a = h('a', { href: URL.createObjectURL(new Blob([S.exportJson(list)], { type: 'application/json' })), download: 'prescription-backup-' + U.stamp(new Date()) + '.json' });
    document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1500);
    meta.lastExport = Date.now(); saveMeta(); renderBackup(); toast('バックアップを書き出しました');
  }
  async function doImport(file) {
    if (!file) return;
    const text = await file.text(), r = S.parseImport(text);
    if (r.e) return toast('読み込めませんでした: ' + r.e, null, 7000);
    const i = await ask(r.v.length + '件の処方箋を読み込みます。どちらで取り込みますか?', [{ t: 'キャンセル' }, { t: '既存データにマージ' }, { t: '全データを置換', cls: 'danger' }]);
    if (i === 2) list = r.v;
    else if (i === 1) {
      r.v.forEach((n) => { const k = list.findIndex((x) => x.id === n.id); if (k < 0) list.push(n); else if (Date.parse(n.updatedAt) > Date.parse(list[k].updatedAt)) list[k] = n; });
    } else return;
    persist(); render(); toast('取り込みました(' + r.v.length + '件)');
  }
  function addSample() {
    const t = U.today(), d = (n) => U.iso(U.addDays(t, -n)), now = new Date().toISOString();
    const mk = (recipient, clinicName, department, pharmacyName, off, days, disp, meds) => ({ id: U.uid(), recipient, clinicName, department, pharmacyName, prescribedDate: d(off), daysSupply: days, isDispensed: disp, memo: '', referenceUrl: '', createdAt: now, updatedAt: now, medicines: meds.map((m) => ({ id: U.uid(), name: m[0], dosage: m[1], usage: m[2], quantityOrDays: '', note: m[3] || '' })) });
    list.push(mk('本人', 'みらいクリニック', '内科', '', 0, 14, false, [['アムロジピン錠', '5mg', '朝食後 1日1回']]),
      mk('母', '青空内科医院', '内科', 'さくら薬局', 5, 7, true, [['ロキソプロフェン錠', '60mg', '毎食後 1日3回', '空腹時を避ける'], ['レバミピド錠', '100mg', '毎食後 1日3回']]),
      mk('父', 'あおば整形外科', '整形外科', 'さくら薬局', 2, 14, true, [['セレコキシブ錠', '100mg', '朝夕食後 1日2回']]),
      mk('子', 'ひだまり小児科', '小児科', 'ひまわり薬局', 20, 5, true, [['アセトアミノフェン', '200mg', '頓服']]));
    persist(); render(); toast('サンプルデータを追加しました');
  }

  /* ---------- settings / help / theme ---------- */
  function openSettings() {
    const le = meta.lastExport ? U.fmt(new Date(meta.lastExport)) : '未実施', row = (a, b) => h('div.setrow', {}, h('span', {}, a), b);
    $('#sBody').replaceChildren(
      row('保存使用量(このブラウザの localStorage)', h('b', {}, S.usageKB() + ' KB')), row('最終バックアップ', h('b', {}, le)), row('登録件数', h('b', {}, list.length + '件')),
      row('JSONバックアップを書き出す', h('button.btn', { type: 'button', onclick: doExport }, icon('down'), '書き出す')),
      row('JSONから読み込む', h('button.btn', { type: 'button', onclick: () => $('#file').click() }, icon('up'), '読み込む')),
      row('全データ初期化(元に戻せません)', h('button.btn.danger', { type: 'button', onclick: resetAll }, icon('trash'), '初期化')),
      h('p.muted', {}, '容量がいっぱいになったら、JSONを書き出してから終了済みの記録を削除してください。'));
    openD($('#dSet'));
  }
  async function resetAll() {
    if ((await ask('すべての処方箋データを削除します。元に戻せません。', [{ t: 'キャンセル' }, { t: '次へ', cls: 'danger' }])) !== 1) return;
    if ((await ask('本当に全データを初期化しますか? 事前にJSONバックアップを書き出すことをおすすめします。', [{ t: 'キャンセル' }, { t: 'すべて削除する', cls: 'danger' }])) !== 1) return;
    S.clearAll(); list = []; meta = { theme: meta.theme, view }; saveMeta(); $('#dSet').close(); render(); toast('全データを初期化しました');
  }
  const STEPS = [['はじめに', '右下の「＋」(PCでは「新規登録」)から処方箋を登録します。服用者・処方日・処方日数・医療機関・薬剤を入力してください。'], ['ステータスの見方', '未調剤は処方日を含む4日間が受取期限です。調剤済みになると、処方日から処方日数分の終了予定日までを数え、残り3日以内で「まもなく終了」、過ぎると「終了済み」になります。'], ['探す・絞り込む', '上のカウントをタップするとステータスで絞り込めます。検索欄は服用者・病院・薬局・薬品名・メモを横断して探します。'], ['リピート処方', '「複製」を押すと、服用者・医療機関・薬剤を引き継ぎ、処方日を今日にした新規登録フォームが開きます。'], ['バックアップ', 'データはこの端末のブラウザにだけ保存されます。書き出しボタンでJSONを保存し、定期的に保管してください。他の端末へは読み込みで移せます。']];
  let step = 0;
  function showStep() {
    $('#hStep').textContent = (step + 1) + ' / ' + STEPS.length; $('#hH').textContent = STEPS[step][0]; $('#hP').textContent = STEPS[step][1];
    $('#hPrev').disabled = step === 0; $('#hNext').textContent = step === STEPS.length - 1 ? '閉じる' : '次へ';
  }
  function applyTheme(t) {
    document.documentElement.dataset.theme = t; const b = $('#bTheme'); b.replaceChildren(icon(t === 'dark' ? 'sun' : 'moon'));
  }
  function setViewIcon() { $('#bView').replaceChildren(icon(view === 'card' ? 'list' : 'card')); $('#bView').setAttribute('aria-label', view === 'card' ? 'リスト表示に切替' : 'カード表示に切替'); }

  /* ---------- init ---------- */
  function init() {
    applyTheme(meta.theme || (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
    const ic = (id, n, t) => $(id).replaceChildren(icon(n), ...(t ? [t] : []));
    ic('#bHelp', 'help'); ic('#bImport', 'up'); ic('#bExport', 'down'); ic('#bSet', 'gear'); ic('#bAdd', 'plus', '新規登録'); ic('#bFab', 'plus'); ic('#fClose', 'x'); ic('#hClose', 'x'); ic('#sClose', 'x'); ic('#bAddMed', 'plus', '薬剤を追加');
    $('#sIco').replaceChildren(icon('search')); setViewIcon();
    $('#bView').onclick = () => { view = view === 'card' ? 'list' : 'card'; meta.view = view; saveMeta(); setViewIcon(); render(); };
    $('#bTheme').onclick = () => { const t = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; meta.theme = t; saveMeta(); applyTheme(t); };
    $('#bHelp').onclick = () => { step = 0; showStep(); openD($('#dHelp')); };
    $('#hPrev').onclick = () => { step--; showStep(); };
    $('#hNext').onclick = () => { if (step === STEPS.length - 1) $('#dHelp').close(); else { step++; showStep(); } };
    $('#hClose').onclick = () => $('#dHelp').close(); $('#sClose').onclick = () => $('#dSet').close();
    $('#bSet').onclick = openSettings; $('#bExport').onclick = doExport; $('#bImport').onclick = () => $('#file').click();
    $('#file').onchange = (e) => { doImport(e.target.files[0]); e.target.value = ''; };
    $('#bAdd').onclick = $('#bFab').onclick = () => openForm('new');
    $('#bPurge').onclick = purge; $('#bAddMed').onclick = () => { const r = medRow(); $('#meds').append(r); r.querySelector('input').focus(); };
    $('#q').oninput = (e) => { st.q = e.target.value; render(); };
    $('#fRec').onchange = (e) => { st.rec = e.target.value; render(); }; $('#fSort').onchange = (e) => { st.sort = e.target.value; render(); };
    $('#form').onsubmit = submitForm; $('#fClose').onclick = $('#fCancel').onclick = closeForm;
    $('#dForm').addEventListener('cancel', (e) => { e.preventDefault(); closeForm(); });
    S.onExternal(() => {
      const r = S.load(); if (r.error) return; list = r.list; meta = Object.assign(S.loadMeta(), { view }); render();
      if ($('#dForm').open) toast('他のタブでデータが更新されました。編集中の内容はそのまま残っています。', null, 6000);
    });
    if (first.error) toast(first.error, null, 8000);
    render();
    setInterval(() => { if (!document.hidden) render(); }, 6e4 * 30);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
