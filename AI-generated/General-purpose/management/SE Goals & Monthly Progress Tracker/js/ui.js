/* Safe DOM helpers, SVG icon library, dialogs, toast and guided tour. */
(function () {
  "use strict";
  var icons = {
    grid:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    'check-square':'<rect x="3" y="3" width="18" height="18" rx="3"/><path d="m7 12 3 3 7-7"/>',
    calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
    help:'<circle cx="12" cy="12" r="9"/><path d="M9.6 9a2.5 2.5 0 1 1 4.2 1.8c-1.2 1-1.8 1.3-1.8 2.7M12 17.5h.01"/>',
    settings:'<circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.7a8 8 0 0 1-1.6.9l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.6-.9l-1.7.7-1.4-2.4 1.4-1.1a7 7 0 0 1 0-1.9l-1.4-1.1 1.4-2.4 1.7.7a8 8 0 0 1 1.6-.9l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.6.9l1.7-.7 1.4 2.4-1.4 1.1a7 7 0 0 1 0 1.9z"/>',
    plus:'<path d="M12 5v14M5 12h14"/>', search:'<circle cx="10.8" cy="10.8" r="7.2"/><path d="m16 16 5 5"/>',
    'arrow-right':'<path d="M5 12h14M13 6l6 6-6 6"/>', notebook:'<path d="M5 3h14v18H5zM8 3v18M11 7h5M11 11h5M11 15h4"/>',
    copy:'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
    'chevron-left':'<path d="m15 18-6-6 6-6"/>','chevron-right':'<path d="m9 18 6-6-6-6"/>',
    x:'<path d="m18 6-12 12M6 6l12 12"/>', edit:'<path d="m4 16.5-.8 4.3 4.3-.8L20 7.5 16.5 4z"/><path d="m14.8 5.7 3.5 3.5"/>',
    trash:'<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 10v6M14 10v6"/>',
    menu:'<path d="M4 6h16M4 12h16M4 18h16"/>', check:'<path d="m5 12 4 4L19 6"/>',
    'arrow-down':'<path d="M12 5v14M6 13l6 6 6-6"/>', download:'<path d="M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4"/>',
    upload:'<path d="M12 16V4m-5 5 5-5 5 5M4 17v4h16v-4"/>', sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon:'<path d="M20.5 14A8.5 8.5 0 0 1 10 3.5 8.5 8.5 0 1 0 20.5 14z"/>'
  };
  function icon(name) {
    var body = icons[name] || icons.grid;
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + body + '</svg>';
  }
  function renderIcons(root) {
    (root || document).querySelectorAll("[data-icon]").forEach(function (el) {
      var name = el.getAttribute("data-icon");
      el.textContent = "";
      el.appendChild(createIcon(name));
    });
  }
  function createIcon(name) {
    var ns = "http://www.w3.org/2000/svg", svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 24 24"); svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor"); svg.setAttribute("stroke-width", "1.8");
    svg.setAttribute("stroke-linecap", "round"); svg.setAttribute("stroke-linejoin", "round");
    svg.setAttribute("aria-hidden", "true");
    var template = document.createElement("template");
    template.innerHTML = icon(name);
    var source = template.content.firstChild;
    Array.prototype.slice.call(source.childNodes).forEach(function (node) { svg.appendChild(node.cloneNode(true)); });
    return svg;
  }
  function el(tag, cls, content) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (content !== undefined) node.textContent = content;
    return node;
  }
  function safeText(node, value) { node.textContent = value == null ? "" : String(value); return node; }
  function button(label, cls, handler, iconName) {
    var b = el("button", cls || "button button-secondary");
    b.type = "button";
    if (iconName) b.appendChild(createIcon(iconName));
    b.appendChild(document.createTextNode(label));
    if (handler) b.addEventListener("click", handler);
    return b;
  }
  function toast(message, error) {
    var region = document.getElementById("toastRegion"), node = el("div", "toast" + (error ? " error" : ""), message);
    region.appendChild(node);
    window.setTimeout(function () { if (node.parentNode) node.parentNode.removeChild(node); }, 3200);
  }
  function openModal(title, body, footer) {
    document.getElementById("modalTitle").textContent = title;
    var b = document.getElementById("modalBody"), f = document.getElementById("modalFooter");
    b.textContent = ""; f.textContent = "";
    b.appendChild(body); f.appendChild(footer);
    document.getElementById("modalBackdrop").hidden = false;
    var first = b.querySelector("input,textarea,select,button");
    if (first) window.setTimeout(function () { first.focus(); }, 30);
  }
  function closeModal() { document.getElementById("modalBackdrop").hidden = true; }
  var tutorial = [
    ["中長期目標を決める","1年・3年・5年後に目指す役割やスキルを登録します。目標は後から編集でき、短期目標との紐づけも可能です。"],
    ["短期目標と四半期計画","年度内の行動を短期目標として登録し、各四半期の計画値・実績値を0〜100%で入力します。進捗は実績値の平均で自動計算します。"],
    ["月次報告を作成","月次報告では成果、来月の計画、相談事項を入力します。短期目標の実績を下書きへ転記し、報告文をコピーできます。"],
    ["データのバックアップ","設定・データ管理からJSONを書き出せます。別端末やブラウザへ移す場合は、JSONをインポートしてください。データはこのブラウザ内に保存されます。"]
  ];
  var tutorialIndex = 0;
  function showTutorial(index) {
    tutorialIndex = index || 0;
    document.getElementById("tutorialOverlay").hidden = false;
    paintTutorial();
  }
  function paintTutorial() {
    var step = tutorial[tutorialIndex], target = document.getElementById("tutorialStep");
    target.textContent = "";
    target.appendChild(el("div", "step-count", "GUIDE  " + (tutorialIndex + 1) + " / " + tutorial.length));
    target.appendChild(el("h2", "", step[0]));
    target.appendChild(el("p", "", step[1]));
    document.getElementById("tutorialNextBtn").textContent = tutorialIndex === tutorial.length - 1 ? "完了" : "次へ";
  }
  function closeTutorial() { document.getElementById("tutorialOverlay").hidden = true; }
  document.addEventListener("DOMContentLoaded", function () {
    renderIcons();
    document.getElementById("modalCloseBtn").addEventListener("click", closeModal);
    document.getElementById("modalBackdrop").addEventListener("click", function (e) { if (e.target.id === "modalBackdrop") closeModal(); });
    document.getElementById("tutorialCloseBtn").addEventListener("click", closeTutorial);
    document.getElementById("tutorialSkipBtn").addEventListener("click", closeTutorial);
    document.getElementById("tutorialNextBtn").addEventListener("click", function () {
      if (tutorialIndex >= tutorial.length - 1) closeTutorial(); else { tutorialIndex++; paintTutorial(); }
    });
  });
  window.SEUI = { icon: icon, createIcon: createIcon, renderIcons: renderIcons, el: el, safeText: safeText, button: button, toast: toast, openModal: openModal, closeModal: closeModal, showTutorial: showTutorial };
})();