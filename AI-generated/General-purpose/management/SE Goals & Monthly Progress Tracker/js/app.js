/* Application state, calculations and interaction. No network calls. */
(function () {
  "use strict";
  var data = SEStorage.load(), currentPage = "dashboard", reportMonth = monthKey(new Date());
  var saveTimer = null, openMilestones = {};
  var $ = function (id) { return document.getElementById(id); };
  var E = SEUI.el;
  var statusNames = { not_started: "未着手", in_progress: "進行中", completed: "達成" };
  var horizonNames = { "1y": "1年後", "3y": "3年後", "5y": "5年後" };
  var quarterNames = { q1: "Q1", q2: "Q2", q3: "Q3", q4: "Q4" };

  function monthKey(date) { return date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0"); }
  function parseMonth(key) { var a = key.split("-"); return new Date(Number(a[0]), Number(a[1]) - 1, 1); }
  function fmtDate(value) {
    if (!value) return "";
    var d = new Date(value); if (isNaN(d.getTime())) return "";
    return d.getFullYear() + "/" + String(d.getMonth() + 1).padStart(2, "0") + "/" + String(d.getDate()).padStart(2, "0");
  }
  function statusTag(status) { return E("span", "status-tag " + status, statusNames[status] || "未着手"); }
  function longById(id) { return data.longTermGoals.find(function (g) { return g.id === id; }) || null; }
  function getQuarterProgress(goal) {
    var vals = ["q1", "q2", "q3", "q4"].map(function (q) { return Number(goal.quarters[q].actual) || 0; });
    return Math.round(vals.reduce(function (a, b) { return a + b; }, 0) / vals.length);
  }
  function setProgressStatus(goal) {
    if (goal.status === "completed") return;
    var p = getQuarterProgress(goal);
    if (p >= 100) goal.status = "completed";
    else if (p > 0 && goal.status === "not_started") goal.status = "in_progress";
  }
  function scheduleSave() {
    $("saveStatus").innerHTML = '<span class="save-dot"></span>保存中…';
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      var ok = SEStorage.save(data);
      $("saveStatus").textContent = ok ? "自動保存済み" : "保存に失敗";
      if (!ok) SEUI.toast("保存できませんでした。データをJSONでバックアップしてください。", true);
    }, 250);
  }
  function saveNow() { if (saveTimer) clearTimeout(saveTimer); var ok = SEStorage.save(data); $("saveStatus").textContent = ok ? "自動保存済み" : "保存に失敗"; return ok; }
  function goPage(page) {
    currentPage = page;
    document.querySelectorAll(".page").forEach(function (p) { p.classList.toggle("active", p.id === "page-" + page); });
    document.querySelectorAll(".nav-item[data-page]").forEach(function (b) { b.classList.toggle("active", b.getAttribute("data-page") === page); });
    var titles = { dashboard: ["OVERVIEW", "ダッシュボード"], long: ["CAREER GOALS", "中長期目標"], short: ["ACTION & PROGRESS", "短期目標・進捗"], monthly: ["MONTHLY REVIEW", "月次報告"] };
    $("pageEyebrow").textContent = titles[page][0]; $("pageTitle").textContent = titles[page][1];
    $("sidebar").classList.remove("open");
    renderAll();
  }
  function renderAll() { renderDashboard(); renderLongGoals(); renderShortGoals(); renderMonthly(); }
  function renderDashboard() {
    var totalLong = data.longTermGoals.length, totalShort = data.shortTermGoals.length;
    var completed = data.shortTermGoals.filter(function (g) { return g.status === "completed"; }).length;
    var average = totalShort ? Math.round(data.shortTermGoals.reduce(function (sum, g) { return sum + getQuarterProgress(g); }, 0) / totalShort) : 0;
    $("dashboardMonth").textContent = parseMonth(reportMonth).getFullYear() + "年" + (parseMonth(reportMonth).getMonth() + 1) + "月";
    var stats = [
      ["中長期目標", totalLong, "キャリアの方向性", "target"],
      ["短期目標", totalShort, "年度内のアクション", "check-square"],
      ["平均進捗", average + "%", "短期目標の実績平均", "grid"],
      ["達成した目標", completed, "短期目標の完了数", "check"]
    ];
    var root = $("dashboardStats"); root.textContent = "";
    stats.forEach(function (s) {
      var card = E("div", "stat-card"), top = E("div", "stat-top"), ico = E("span", "stat-icon");
      ico.appendChild(SEUI.createIcon(s[3])); top.appendChild(E("span", "", s[0])); top.appendChild(ico);
      card.appendChild(top); card.appendChild(E("div", "stat-value", String(s[1]))); card.appendChild(E("div", "stat-foot", s[2])); root.appendChild(card);
    });
    var list = $("dashboardShortList"); list.textContent = "";
    data.shortTermGoals.slice(0, 5).forEach(function (g) {
      var item = E("div", "compact-item"), top = E("div", "");
      top.appendChild(E("div", "compact-name", g.title || "名称未設定"));
      var linked = longById(g.longTermGoalId);
      top.appendChild(E("div", "compact-meta", linked ? linked.title : "中長期目標：未分類"));
      item.appendChild(top); item.appendChild(statusTag(g.status));
      var pr = E("div", "compact-progress"), track = E("div", "progress-track"), fill = E("div", "progress-fill");
      fill.style.width = getQuarterProgress(g) + "%"; track.appendChild(fill); pr.appendChild(track); pr.appendChild(E("span", "progress-label", getQuarterProgress(g) + "%")); item.appendChild(pr); list.appendChild(item);
    });
    if (!data.shortTermGoals.length) list.appendChild(emptyMessage("短期目標はまだありません", "短期目標を登録すると、ここに進捗が表示されます。"));
    var longList = $("dashboardLongList"); longList.textContent = "";
    data.longTermGoals.slice(0, 4).forEach(function (g) {
      var item = E("div", "goal-mini"), mark = E("span", "goal-mini-mark"), copy = E("div", "");
      mark.style.background = g.status === "completed" ? "#34b88b" : g.horizon === "5y" ? "#c4b5fd" : "#a5b4fc";
      copy.appendChild(E("strong", "", g.title || "名称未設定")); copy.appendChild(E("small", "", horizonNames[g.horizon] + " ・ " + statusNames[g.status]));
      item.appendChild(mark); item.appendChild(copy); longList.appendChild(item);
    });
    if (!data.longTermGoals.length) longList.appendChild(emptyMessage("中長期目標はまだありません", "目指す役割やスキルを登録しましょう。"));
  }
  function emptyMessage(title, message) { var box = E("div", "empty-state"); box.appendChild(E("strong", "", title)); box.appendChild(E("p", "", message)); return box; }
  function renderLongGoals() {
    var q = $("longSearch").value.trim().toLowerCase(), horizon = $("longHorizonFilter").value, status = $("longStatusFilter").value;
    var items = data.longTermGoals.filter(function (g) {
      var match = (g.title + " " + g.description).toLowerCase().indexOf(q) >= 0;
      return match && (horizon === "all" || g.horizon === horizon) && (status === "all" || g.status === status);
    });
    $("longSummary").textContent = items.length + "件を表示中（全" + data.longTermGoals.length + "件）";
    var root = $("longGoalList"); root.textContent = "";
    if (!items.length) { root.appendChild(emptyMessage("条件に一致する目標がありません", "検索条件を変えるか、新しい目標を追加してください。")); return; }
    items.forEach(function (g) {
      var card = E("article", "goal-card"), top = E("div", "goal-card-top");
      top.appendChild(E("span", "horizon-tag", horizonNames[g.horizon])); top.appendChild(statusTag(g.status)); card.appendChild(top);
      card.appendChild(E("h3", "", g.title || "名称未設定"));
      if (g.description) card.appendChild(E("p", "", g.description));
      var bottom = E("div", "goal-card-bottom"); bottom.appendChild(E("span", "date-meta", "更新 " + fmtDate(g.updatedAt)));
      var actions = E("div", "card-actions");
      actions.appendChild(actionButton("編集", "edit", function () { openLongForm(g); }));
      actions.appendChild(actionButton("削除", "trash", function () { confirmDelete("中長期目標を削除しますか？", "紐づく短期目標は未分類になります。", function () { data.shortTermGoals.forEach(function (s) { if (s.longTermGoalId === g.id) s.longTermGoalId = null; }); data.longTermGoals = data.longTermGoals.filter(function (x) { return x.id !== g.id; }); scheduleSave(); renderAll(); SEUI.toast("目標を削除しました"); }); }));
      bottom.appendChild(actions); card.appendChild(bottom); root.appendChild(card);
    });
  }
  function actionButton(label, icon, fn) { var b = E("button", "mini-action"); b.type = "button"; b.title = label; b.setAttribute("aria-label", label); b.appendChild(SEUI.createIcon(icon)); b.addEventListener("click", fn); return b; }
  function renderShortGoals() {
    var q = $("shortSearch").value.trim().toLowerCase(), link = $("shortLinkFilter").value, status = $("shortStatusFilter").value;
    var select = $("shortLinkFilter"), selected = select.value;
    select.textContent = ""; select.appendChild(option("all", "すべての中長期目標"));
    select.appendChild(option("unlinked", "未分類"));
    data.longTermGoals.forEach(function (g) { select.appendChild(option(g.id, g.title || "名称未設定")); });
    select.value = Array.prototype.some.call(select.options, function (o) { return o.value === selected; }) ? selected : "all";
    link = select.value;
    var items = data.shortTermGoals.filter(function (g) {
      var l = longById(g.longTermGoalId), hay = g.title + " " + g.description + " " + (l ? l.title : "");
      return hay.toLowerCase().indexOf(q) >= 0 && (link === "all" || (link === "unlinked" ? !g.longTermGoalId : g.longTermGoalId === link)) && (status === "all" || g.status === status);
    });
    var average = data.shortTermGoals.length ? Math.round(data.shortTermGoals.reduce(function (sum, g) { return sum + getQuarterProgress(g); }, 0) / data.shortTermGoals.length) : 0;
    $("shortSummary").textContent = "";
    [["平均進捗", average + "%"], ["目標数", data.shortTermGoals.length + "件"], ["達成", data.shortTermGoals.filter(function (g) { return g.status === "completed"; }).length + "件"], ["表示中", items.length + "件"]].forEach(function (pair, i) {
      if (i) $("shortSummary").appendChild(E("span", "summary-divider"));
      var wrap = E("div", ""), val = E("div", "summary-number", pair[1]); wrap.appendChild(val); wrap.appendChild(E("div", "summary-caption", pair[0])); $("shortSummary").appendChild(wrap);
    });
    var root = $("shortGoalList"); root.textContent = "";
    if (!items.length) { root.appendChild(emptyMessage("短期目標がありません", "短期目標を追加して、四半期ごとの計画と実績を管理しましょう。")); return; }
    items.forEach(function (g) {
      var card = E("article", "short-card"), header = E("div", "short-card-header"), titleWrap = E("div", "short-card-title"), check = E("input", "goal-checkbox");
      check.type = "checkbox"; check.checked = g.status === "completed"; check.title = "達成状態";
      check.addEventListener("change", function () { g.status = check.checked ? "completed" : "in_progress"; g.updatedAt = SEStorage.now(); scheduleSave(); renderAll(); });
      titleWrap.appendChild(check); var copy = E("div", "");
      copy.appendChild(E("h3", "", g.title || "名称未設定")); if (g.description) copy.appendChild(E("p", "", g.description));
      titleWrap.appendChild(copy); header.appendChild(titleWrap);
      var tools = E("div", "short-card-tools"); tools.appendChild(statusTag(g.status));
      tools.appendChild(actionButton("編集", "edit", function () { openShortForm(g); }));
      tools.appendChild(actionButton("削除", "trash", function () { confirmDelete("短期目標を削除しますか？", "この目標と中間目標の進捗が削除されます。", function () { data.shortTermGoals = data.shortTermGoals.filter(function (x) { return x.id !== g.id; }); scheduleSave(); renderAll(); SEUI.toast("短期目標を削除しました"); }); }));
      header.appendChild(tools); card.appendChild(header);
      var p = getQuarterProgress(g), pr = E("div", "short-progress-row"), track = E("div", "progress-track"), fill = E("div", "progress-fill");
      fill.style.width = p + "%"; track.appendChild(fill); pr.appendChild(track); pr.appendChild(E("span", "progress-label", p + "%")); card.appendChild(pr);
      var grid = E("div", "quarter-grid");
      ["q1","q2","q3","q4"].forEach(function (qkey) {
        var cell = E("div", "quarter-cell"); cell.appendChild(E("strong", "", quarterNames[qkey]));
        var values = E("div", "quarter-values");
        [["計画", "planned"], ["実績", "actual"]].forEach(function (pair) {
          var label = E("label", "", pair[0]), input = E("input");
          input.type = "number"; input.min = "0"; input.max = "100"; input.step = "1"; input.value = g.quarters[qkey][pair[1]];
          input.setAttribute("aria-label", quarterNames[qkey] + pair[0] + "（%）");
          input.addEventListener("change", function () {
            var n = parseInt(input.value, 10); if (!isFinite(n)) n = 0; n = Math.max(0, Math.min(100, n)); input.value = n;
            g.quarters[qkey][pair[1]] = n; g.updatedAt = SEStorage.now(); setProgressStatus(g); scheduleSave(); renderAll();
          });
          label.appendChild(input); values.appendChild(label);
        }); cell.appendChild(values); grid.appendChild(cell);
      });
      card.appendChild(grid);
      var footer = E("div", "short-card-footer"), linked = longById(g.longTermGoalId);
      footer.appendChild(E("span", "linked-goal", linked ? "紐づき： " + linked.title : "中長期目標：未分類"));
      var milestoneBtn = E("button", "milestone-toggle", (openMilestones[g.id] ? "中間目標を隠す" : "中間目標 " + g.milestones.length + "件") + " ▾");
      milestoneBtn.addEventListener("click", function () { openMilestones[g.id] = !openMilestones[g.id]; renderShortGoals(); }); footer.appendChild(milestoneBtn); card.appendChild(footer);
      if (openMilestones[g.id]) {
        var ml = E("div", "milestone-list");
        g.milestones.forEach(function (m) {
          var row = E("label", "milestone-row"), cb = E("input"); cb.type = "checkbox"; cb.checked = m.status === "completed";
          cb.addEventListener("change", function () { m.status = cb.checked ? "completed" : "in_progress"; g.updatedAt = SEStorage.now(); scheduleSave(); renderShortGoals(); });
          row.appendChild(cb); row.appendChild(E("span", "milestone-name", m.title)); row.appendChild(statusTag(m.status)); ml.appendChild(row);
        });
        if (!g.milestones.length) ml.appendChild(E("div", "muted", "中間目標はまだありません。編集から追加できます。"));
        card.appendChild(ml);
      }
      root.appendChild(card);
    });
  }
  function option(value, label) { var o = E("option", "", label); o.value = value; return o; }

  function renderMonthly() {
    $("reportMonth").value = reportMonth;
    var report = data.monthlyReports[reportMonth] || { doneThisMonth: "", planNextMonth: "", consultation: "", updatedAt: null };
    $("doneThisMonth").value = report.doneThisMonth; $("planNextMonth").value = report.planNextMonth; $("consultation").value = report.consultation;
    $("reportSavedAt").textContent = report.updatedAt ? "最終更新 " + fmtDate(report.updatedAt) + " ・ 自動保存" : "入力内容は自動保存されます";
    var history = $("reportHistory"); history.textContent = "";
    Object.keys(data.monthlyReports).sort().reverse().slice(0, 6).forEach(function (key) {
      var row = E("div", "history-item"); row.appendChild(E("span", "", key));
      var b = E("button", "", "開く"); b.type = "button"; b.addEventListener("click", function () { reportMonth = key; renderMonthly(); }); row.appendChild(b); history.appendChild(row);
    });
    if (!Object.keys(data.monthlyReports).length) history.appendChild(E("div", "muted", "まだ報告は保存されていません。"));
  }
  function saveReportField(field, value) {
    if (!data.monthlyReports[reportMonth]) data.monthlyReports[reportMonth] = { yearMonth: reportMonth, doneThisMonth: "", planNextMonth: "", consultation: "", updatedAt: null };
    data.monthlyReports[reportMonth][field] = value; data.monthlyReports[reportMonth].updatedAt = SEStorage.now();
    scheduleSave(); $("reportSavedAt").textContent = "最終更新 " + fmtDate(data.monthlyReports[reportMonth].updatedAt) + " ・ 自動保存";
  }
  function field(label, name, value, type, placeholder) {
    var wrap = E("div", "form-field"), l = E("label", "", label); l.htmlFor = name; wrap.appendChild(l);
    var input = type === "textarea" ? E("textarea") : (type === "select" ? E("select") : E("input")); input.id = name;
    if (type === "textarea") { input.rows = 3; } else if (type !== "select") input.type = type || "text";
    input.value = value || ""; if (placeholder) input.placeholder = placeholder;
    wrap.appendChild(input); return { wrap: wrap, input: input };
  }
  function openLongForm(goal) {
    var editing = !!goal, g = goal || { horizon: "1y", title: "", description: "", status: "in_progress" };
    var body = E("div", ""), title = field("目標タイトル（必須）", "longTitle", g.title, "text", "例：設計から開発をリードできるSEになる");
    var horizon = field("目標期間", "longHorizon", "", "select"); horizon.input.textContent = "";
    [["1y","1年後"],["3y","3年後"],["5y","5年後"]].forEach(function (p) { horizon.input.appendChild(option(p[0],p[1])); }); horizon.input.value = g.horizon;
    var status = field("状態", "longStatus", "", "select"); status.input.textContent = "";
    Object.keys(statusNames).forEach(function (k) { status.input.appendChild(option(k,statusNames[k])); }); status.input.value = g.status;
    var desc = field("詳細・背景", "longDesc", g.description, "textarea", "目指す役割、必要なスキル、背景など");
    body.appendChild(title.wrap); var row = E("div","form-grid"); row.appendChild(horizon.wrap); row.appendChild(status.wrap); body.appendChild(row); body.appendChild(desc.wrap);
    var footer = E("div",""); footer.appendChild(SEUI.button("キャンセル","button button-secondary",SEUI.closeModal)); footer.appendChild(SEUI.button(editing ? "変更を保存" : "目標を追加","button button-primary",function () {
      var t = title.input.value.trim(); if (!t) { SEUI.toast("目標タイトルを入力してください",true); title.input.focus(); return; }
      var stamp = SEStorage.now();
      if (editing) { g.title=t; g.horizon=horizon.input.value; g.status=status.input.value; g.description=desc.input.value; g.updatedAt=stamp; }
      else data.longTermGoals.push({ id:SEStorage.uid("ltg"), horizon:horizon.input.value, title:t, description:desc.input.value, status:status.input.value, createdAt:stamp, updatedAt:stamp });
      scheduleSave(); SEUI.closeModal(); renderAll(); SEUI.toast(editing ? "目標を更新しました" : "目標を追加しました");
    }));
    SEUI.openModal(editing ? "中長期目標を編集" : "中長期目標を追加", body, footer);
  }
  function openShortForm(goal) {
    var editing = !!goal, g = goal || { longTermGoalId:null, title:"", description:"", status:"in_progress", quarters:SEStorage.quarters({}), milestones:[] };
    var body = E("div",""), title = field("短期目標タイトル（必須）","shortTitle",g.title,"text","例：担当機能の設計・実装を完了する");
    var link = field("紐づく中長期目標","shortLink","","select"); link.input.appendChild(option("","未分類"));
    data.longTermGoals.forEach(function (x) { link.input.appendChild(option(x.id,x.title || "名称未設定")); }); link.input.value = g.longTermGoalId || "";
    var status = field("状態","shortStatus","","select"); Object.keys(statusNames).forEach(function(k){status.input.appendChild(option(k,statusNames[k]));}); status.input.value=g.status;
    var desc = field("達成基準・メモ","shortDesc",g.description,"textarea","完了条件、具体的な行動、確認方法など");
    body.appendChild(title.wrap); var row=E("div","form-grid"); row.appendChild(link.wrap); row.appendChild(status.wrap); body.appendChild(row); body.appendChild(desc.wrap);
    var msWrap=E("div","form-field"), msLabel=E("label","","中間目標（任意・1行に1件）"), msText=E("textarea"); msText.rows=4; msText.placeholder="例：要件を整理する\n設計レビューを完了する\n単体テストを完了する"; msText.value=(g.milestones||[]).map(function(m){return m.title;}).join("\n"); msWrap.appendChild(msLabel); msWrap.appendChild(msText); body.appendChild(msWrap);
    var footer=E("div",""); footer.appendChild(SEUI.button("キャンセル","button button-secondary",SEUI.closeModal)); footer.appendChild(SEUI.button(editing?"変更を保存":"短期目標を追加","button button-primary",function(){
      var t=title.input.value.trim(); if(!t){SEUI.toast("短期目標タイトルを入力してください",true);title.input.focus();return;}
      var stamp=SEStorage.now(), milestones=msText.value.split(/\r?\n/).map(function(s){return s.trim();}).filter(Boolean).slice(0,100).map(function(name,i){var old=(g.milestones||[]).find(function(m){return m.title===name;});return old||{id:SEStorage.uid("ms"),title:name,status:"not_started",quarters:SEStorage.quarters({})};});
      if(editing){g.title=t;g.longTermGoalId=link.input.value||null;g.status=status.input.value;g.description=desc.input.value;g.milestones=milestones;g.updatedAt=stamp;}
      else data.shortTermGoals.push({id:SEStorage.uid("stg"),longTermGoalId:link.input.value||null,title:t,description:desc.input.value,status:status.input.value,manualProgressOverride:false,quarters:SEStorage.quarters({}),milestones:milestones,createdAt:stamp,updatedAt:stamp});
      scheduleSave();SEUI.closeModal();renderAll();SEUI.toast(editing?"短期目標を更新しました":"短期目標を追加しました");
    }));
    SEUI.openModal(editing?"短期目標を編集":"短期目標を追加",body,footer);
  }
  function confirmDelete(title,message,callback) {
    var body=E("div",""); body.appendChild(E("p","",message));
    var footer=E("div",""); footer.appendChild(SEUI.button("キャンセル","button button-secondary",SEUI.closeModal)); footer.appendChild(SEUI.button("削除する","button button-primary",function(){SEUI.closeModal();callback();}));
    SEUI.openModal(title,body,footer);
  }
  function openSettings() {
    var body=E("div",""), theme=field("テーマ","settingTheme","","select");
    [["system","システム設定に合わせる"],["light","ライト"],["dark","ダーク"]].forEach(function(p){theme.input.appendChild(option(p[0],p[1]));});theme.input.value=data.settings.theme;
    var start=field("年度開始月","settingStart","","select");for(var i=1;i<=12;i++)start.input.appendChild(option(String(i),i+"月"));start.input.value=String(data.settings.fiscalStartMonth);
    body.appendChild(theme.wrap);body.appendChild(start.wrap);
    var exp=E("div","form-field");exp.appendChild(E("label","","データのバックアップ"));exp.appendChild(E("p","hint","全目標・進捗・月次報告をJSONファイルとして保存します。"));
    exp.appendChild(SEUI.button("JSONを書き出す","button button-secondary",exportData,"download"));body.appendChild(exp);
    var imp=E("div","form-field");imp.appendChild(E("label","","バックアップを復元"));imp.appendChild(E("p","hint","インポートすると現在のデータを置き換えます。先にバックアップを推奨します。"));
    var file=E("input");file.type="file";file.accept=".json,application/json";imp.appendChild(file);imp.appendChild(SEUI.button("JSONをインポート","button button-secondary",function(){if(!file.files||!file.files[0]){SEUI.toast("JSONファイルを選択してください",true);return;}var reader=new FileReader();reader.onload=function(){try{var imported=SEStorage.importJson(String(reader.result));confirmDelete("バックアップを復元しますか？","現在のデータをインポート内容で置き換えます。",function(){data=imported;saveNow();applyTheme();SEUI.closeModal();renderAll();SEUI.toast("バックアップを復元しました");});}catch(e){SEUI.toast(e.message,true);}};reader.readAsText(file.files[0],"UTF-8");},"upload"));body.appendChild(imp);
    var footer=E("div","");footer.appendChild(SEUI.button("閉じる","button button-secondary",SEUI.closeModal));footer.appendChild(SEUI.button("設定を保存","button button-primary",function(){data.settings.theme=theme.input.value;data.settings.fiscalStartMonth=parseInt(start.input.value,10);scheduleSave();applyTheme();SEUI.closeModal();SEUI.toast("設定を保存しました");}));
    SEUI.openModal("設定・データ管理",body,footer);
  }
  function exportData() {
    var content=SEStorage.exportJson(data), blob=new Blob([content],{type:"application/json;charset=utf-8"}), url=URL.createObjectURL(blob), a=E("a");
    a.href=url;a.download="se-goal-tracker-backup-"+monthKey(new Date())+".json";document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
    data.settings.lastExportedAt=SEStorage.now();scheduleSave();SEUI.toast("JSONを書き出しました");
  }
  function applyTheme() {
    var theme=data.settings.theme;
    var dark=theme==="dark"||(theme==="system"&&window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.body.classList.toggle("theme-dark",dark);
  }
  function transferProgress() {
    var lines=data.shortTermGoals.filter(function(g){return g.status!=="not_started"||getQuarterProgress(g)>0;}).map(function(g){return "・"+g.title+"（進捗 "+getQuarterProgress(g)+"%）";});
    if(!lines.length){SEUI.toast("転記できる進捗がありません");return;}
    var addition="【短期目標の進捗】\n"+lines.join("\n"), existing=$("doneThisMonth").value;
    $("doneThisMonth").value=existing?(existing+"\n\n"+addition):addition;
    saveReportField("doneThisMonth",$("doneThisMonth").value);SEUI.toast("短期目標の実績を下書きに追加しました");
  }
  function copyReport() {
    var parts=["【"+reportMonth+" 月次報告】","■ 今月やったこと",$("doneThisMonth").value.trim(),"","■ 来月やること",$("planNextMonth").value.trim(),"","■ 相談したいこと",$("consultation").value.trim()];
    var text=parts.join("\n");
    if(!text.trim()){SEUI.toast("報告内容を入力してください",true);return;}
    if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text).then(function(){SEUI.toast("月次報告をコピーしました");}).catch(function(){fallbackCopy(text);});}else fallbackCopy(text);
  }
  function fallbackCopy(text) {
    var area=E("textarea");area.value=text;area.style.position="fixed";area.style.opacity="0";document.body.appendChild(area);area.select();
    try{document.execCommand("copy");SEUI.toast("月次報告をコピーしました");}catch(e){SEUI.toast("コピーできませんでした",true);}area.remove();
  }
  function bind() {
    document.querySelectorAll(".nav-item[data-page]").forEach(function(b){b.addEventListener("click",function(){goPage(b.getAttribute("data-page"));});});
    document.querySelectorAll("[data-goto]").forEach(function(b){b.addEventListener("click",function(){goPage(b.getAttribute("data-goto"));});});
    $("quickAddBtn").addEventListener("click",function(){openShortForm(null);});
    $("addLongBtn").addEventListener("click",function(){openLongForm(null);});
    $("addShortBtn").addEventListener("click",function(){openShortForm(null);});
    ["longSearch","longHorizonFilter","longStatusFilter"].forEach(function(id){$(id).addEventListener("input",renderLongGoals);});
    ["shortSearch","shortLinkFilter","shortStatusFilter"].forEach(function(id){$(id).addEventListener("input",renderShortGoals);});
    $("reportMonth").addEventListener("change",function(){if(/^\d{4}-\d{2}$/.test(this.value)){reportMonth=this.value;renderMonthly();}});
    $("prevMonthBtn").addEventListener("click",function(){var d=parseMonth(reportMonth);d.setMonth(d.getMonth()-1);reportMonth=monthKey(d);renderMonthly();});
    $("nextMonthBtn").addEventListener("click",function(){var d=parseMonth(reportMonth);d.setMonth(d.getMonth()+1);reportMonth=monthKey(d);renderMonthly();});
    $("doneThisMonth").addEventListener("input",function(){saveReportField("doneThisMonth",this.value);});
    $("planNextMonth").addEventListener("input",function(){saveReportField("planNextMonth",this.value);});
    $("consultation").addEventListener("input",function(){saveReportField("consultation",this.value);});
    $("copyReportBtn").addEventListener("click",copyReport);$("transferProgressBtn").addEventListener("click",transferProgress);
    $("settingsBtn").addEventListener("click",openSettings);$("tutorialBtn").addEventListener("click",function(){SEUI.showTutorial(0);});
    $("mobileMenuBtn").addEventListener("click",function(){$("sidebar").classList.toggle("open");});
    document.addEventListener("keydown",function(e){if(e.key==="Escape"){SEUI.closeModal();$("sidebar").classList.remove("open");}});
  }
  document.addEventListener("DOMContentLoaded",function(){
    bind();applyTheme();renderAll();
    SEStorage.subscribe(function(updated){data=updated;applyTheme();renderAll();SEUI.toast("別のタブで更新されたデータを同期しました");});
  });
})();