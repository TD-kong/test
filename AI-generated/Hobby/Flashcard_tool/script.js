(function () {
  "use strict";

  var STORAGE_KEY = "simpleFlashcards.v1";
  var TUTORIAL_KEY = "simpleFlashcards.tutorialSeen.v1";
  var cards = [];
  var currentIndex = 0;
  var toastTimer = null;
  var touchStartX = 0;
  var touchStartY = 0;
  var touchActive = false;

  var el = {
    card: document.getElementById("flashcard"),
    front: document.getElementById("frontText"),
    back: document.getElementById("backText"),
    counter: document.getElementById("cardCounter"),
    progress: document.getElementById("progressBar"),
    prev: document.getElementById("prevButton"),
    next: document.getElementById("nextButton"),
    flip: document.getElementById("flipButton"),
    stage: document.getElementById("cardStage"),
    form: document.getElementById("cardForm"),
    word: document.getElementById("wordInput"),
    meaning: document.getElementById("meaningInput"),
    list: document.getElementById("wordList"),
    listCount: document.getElementById("listCount"),
    exportButton: document.getElementById("exportButton"),
    importInput: document.getElementById("importInput"),
    help: document.getElementById("helpButton"),
    modal: document.getElementById("tutorialModal"),
    closeModal: document.getElementById("closeTutorialButton"),
    toast: document.getElementById("toast")
  };

  function sampleCards() {
    return [
      { id: createId(), word: "apple", meaning: "りんご" },
      { id: createId(), word: "book", meaning: "本" },
      { id: createId(), word: "beautiful", meaning: "美しい" }
    ];
  }

  function createId() {
    return String(Date.now()) + "-" + Math.random().toString(36).slice(2, 9);
  }

  function saveCards() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
    } catch (error) {
      showToast("保存できませんでした。ブラウザの容量を確認してください。");
    }
  }

  function loadCards() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved === null) {
        cards = sampleCards();
        saveCards();
        return;
      }
      var parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) {
        throw new Error("データ形式が配列ではありません。");
      }
      cards = parsed.filter(function (item) {
        return item && typeof item.word === "string" && typeof item.meaning === "string";
      }).map(function (item) {
        return { id: item.id ? String(item.id) : createId(), word: item.word, meaning: item.meaning };
      });
      if (cards.length !== parsed.length) {
        showToast("一部読み込めないデータを除外しました。");
        saveCards();
      }
    } catch (error) {
      cards = sampleCards();
      saveCards();
      showToast("保存データを読み込めなかったため、サンプルを表示します。");
    }
  }

  function render() {
    if (currentIndex >= cards.length) currentIndex = Math.max(0, cards.length - 1);
    if (cards.length === 0) currentIndex = 0;

    var hasCards = cards.length > 0;
    var current = hasCards ? cards[currentIndex] : null;
    el.front.textContent = current ? current.word : "単語がありません";
    el.back.textContent = current ? current.meaning : "下のフォームから単語を登録してください";
    el.counter.textContent = hasCards ? (currentIndex + 1) + " / " + cards.length : "0 / 0";
    el.progress.style.width = hasCards ? ((currentIndex + 1) / cards.length * 100) + "%" : "0%";
    el.prev.disabled = !hasCards;
    el.next.disabled = !hasCards;
    el.flip.disabled = !hasCards;
    el.card.disabled = !hasCards;
    el.prev.style.opacity = hasCards ? "1" : ".45";
    el.next.style.opacity = hasCards ? "1" : ".45";
    el.flip.style.opacity = hasCards ? "1" : ".45";
    setFlipped(false);
    renderList();
  }

  function renderList() {
    el.list.textContent = "";
    el.listCount.textContent = cards.length + "件";
    if (cards.length === 0) {
      var empty = document.createElement("div");
      empty.className = "empty-list";
      empty.textContent = "登録された単語はありません。";
      el.list.appendChild(empty);
      return;
    }

    cards.forEach(function (item, index) {
      var row = document.createElement("div");
      row.className = "word-row";

      var main = document.createElement("div");
      main.className = "word-row-main";
      var word = document.createElement("span");
      word.className = "word-row-word";
      word.textContent = item.word;
      var meaning = document.createElement("span");
      meaning.className = "word-row-meaning";
      meaning.textContent = item.meaning;
      main.appendChild(word);
      main.appendChild(meaning);

      var actions = document.createElement("div");
      actions.className = "row-actions";
      var studyButton = document.createElement("button");
      studyButton.type = "button";
      studyButton.className = "mini-button";
      studyButton.textContent = "表示";
      studyButton.setAttribute("aria-label", item.word + "を表示");
      studyButton.addEventListener("click", function () {
        currentIndex = index;
        render();
        document.querySelector(".study-panel").scrollIntoView({ behavior: "smooth", block: "start" });
      });

      var deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "mini-button delete";
      deleteButton.textContent = "削除";
      deleteButton.setAttribute("aria-label", item.word + "を削除");
      deleteButton.addEventListener("click", function () {
        if (!window.confirm("「" + item.word + "」を削除しますか？")) return;
        cards.splice(index, 1);
        if (index < currentIndex) currentIndex--;
        saveCards();
        render();
        showToast("単語を削除しました。");
      });

      actions.appendChild(studyButton);
      actions.appendChild(deleteButton);
      row.appendChild(main);
      row.appendChild(actions);
      el.list.appendChild(row);
    });
  }

  function setFlipped(flipped) {
    el.card.classList.toggle("is-flipped", flipped);
    el.card.setAttribute("aria-pressed", flipped ? "true" : "false");
    el.flip.textContent = flipped ? "単語に戻る" : "答えを見る";
  }

  function toggleFlip() {
    if (cards.length === 0) return;
    setFlipped(!el.card.classList.contains("is-flipped"));
  }

  function moveCard(amount) {
    if (cards.length === 0) return;
    currentIndex = (currentIndex + amount + cards.length) % cards.length;
    render();
  }

  function showToast(message) {
    el.toast.textContent = message;
    el.toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      el.toast.classList.remove("show");
    }, 2300);
  }

  function openTutorial() {
    el.modal.hidden = false;
    el.closeModal.focus();
  }

  function closeTutorial() {
    el.modal.hidden = true;
    try {
      localStorage.setItem(TUTORIAL_KEY, "1");
    } catch (ignore) {}
    el.help.focus();
  }

  el.card.addEventListener("click", toggleFlip);
  el.flip.addEventListener("click", toggleFlip);
  el.prev.addEventListener("click", function () { moveCard(-1); });
  el.next.addEventListener("click", function () { moveCard(1); });

  el.stage.addEventListener("touchstart", function (event) {
    if (event.touches.length !== 1) return;
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
    touchActive = true;
  }, { passive: true });

  el.stage.addEventListener("touchend", function (event) {
    if (!touchActive || !event.changedTouches.length) return;
    var dx = event.changedTouches[0].clientX - touchStartX;
    var dy = event.changedTouches[0].clientY - touchStartY;
    touchActive = false;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.25) {
      if (dx < 0) moveCard(1);
      else moveCard(-1);
    }
  }, { passive: true });

  el.form.addEventListener("submit", function (event) {
    event.preventDefault();
    var word = el.word.value.trim();
    var meaning = el.meaning.value.trim();
    if (!word || !meaning) {
      showToast("単語と意味の両方を入力してください。");
      return;
    }
    cards.push({ id: createId(), word: word, meaning: meaning });
    currentIndex = cards.length - 1;
    saveCards();
    render();
    el.form.reset();
    el.word.focus();
    showToast("単語を追加しました。");
  });

  el.exportButton.addEventListener("click", function () {
    var payload = {
      format: "simple-flashcards",
      version: 1,
      exportedAt: new Date().toISOString(),
      cards: cards
    };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = "flashcards.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast("JSONを書き出しました。");
  });

  el.importInput.addEventListener("change", function () {
    var file = el.importInput.files && el.importInput.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var data = JSON.parse(String(reader.result));
        var imported = Array.isArray(data) ? data : data.cards;
        if (!Array.isArray(imported)) throw new Error("cards配列がありません。");
        var valid = imported.filter(function (item) {
          return item && typeof item.word === "string" && typeof item.meaning === "string";
        }).map(function (item) {
          return { id: item.id ? String(item.id) : createId(), word: item.word.trim(), meaning: item.meaning.trim() };
        }).filter(function (item) {
          return item.word && item.meaning;
        });
        if (valid.length !== imported.length) {
          if (!window.confirm("形式が不正なデータがあります。読み込み可能な " + valid.length + " 件だけを取り込みますか？")) return;
        } else if (!window.confirm("現在の単語 " + cards.length + " 件を、読み込む " + valid.length + " 件で置き換えますか？")) {
          return;
        }
        cards = valid;
        currentIndex = 0;
        saveCards();
        render();
        showToast(valid.length + "件を読み込みました。");
      } catch (error) {
        window.alert("JSONを読み込めませんでした。\n" + error.message);
      } finally {
        el.importInput.value = "";
      }
    };
    reader.onerror = function () {
      window.alert("ファイルを読み込めませんでした。");
      el.importInput.value = "";
    };
    reader.readAsText(file, "UTF-8");
  });

  el.help.addEventListener("click", openTutorial);
  el.closeModal.addEventListener("click", closeTutorial);
  el.modal.addEventListener("click", function (event) {
    if (event.target === el.modal) closeTutorial();
  });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !el.modal.hidden) closeTutorial();
    if (el.modal.hidden && event.target.tagName !== "INPUT" && event.target.tagName !== "TEXTAREA") {
      if (event.key === "ArrowRight") moveCard(1);
      if (event.key === "ArrowLeft") moveCard(-1);
      if (event.key === " " && cards.length > 0) {
        event.preventDefault();
        toggleFlip();
      }
    }
  });

  loadCards();
  render();
  try {
    if (localStorage.getItem(TUTORIAL_KEY) !== "1") openTutorial();
  } catch (ignore) {
    openTutorial();
  }
}());
