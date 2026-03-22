document.addEventListener("DOMContentLoaded", () => {
  const QUESTIONS = {
    q1: { answer: "こたえ1", attribute: "fire", damage: 30 },
    q2: { answer: "こたえ2", attribute: "thunder", damage: 30 },
    q3: { answer: "こたえ3", attribute: "ice", damage: 40 },
    q4: { answer: "こたえ4", damage: 100 }
  };

  const state = {
    solved: { q1: false, q2: false, q3: false, q4: false },
    phase: 1,
    isBusy: false,
    hp: 100,
    maxHp: 100
  };

  const bossImage = document.getElementById("bossImage");
  const flashLayer = document.getElementById("flashLayer");

  const hpBarFill = document.getElementById("hpBarFill");
  const hpValue = document.getElementById("hpValue");
  const hpName = document.getElementById("hpName");

  const effectOverlay = document.getElementById("effectOverlay");
  const girlStage = document.getElementById("girlStage");
  const sayaImage = document.getElementById("sayaImage");
  const dialogWindow = document.getElementById("dialogWindow");
  const dialogText = document.getElementById("dialogText");

  const bossOverlayStage = document.getElementById("bossOverlayStage");
  const bossOverlayImage = document.getElementById("bossOverlayImage");
  const bossMagicEffect = document.getElementById("bossMagicEffect");

  const answerButtons = document.querySelectorAll(".answer-button");

  let typingTimer = null;
  let typingSkipHandler = null;
  let advanceHandler = null;
  let isTyping = false;
  let fullText = "";
  let displayedText = "";

  updateStatus();
  showInitialStory();

  answerButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      handleAnswer(btn.dataset.question);
    });
  });

  async function showInitialStory() {
    state.isBusy = true;
    await runDialogueSequence([
      "ここが管理者のいる場所……。",
      "ようやくたどり着いたね！",
      "マレフィセントを倒そう！",
      "謎の答えが魔法になるの！力を貸して！"
    ]);
    state.isBusy = false;
  }

  async function handleAnswer(q) {
    if (state.isBusy) return;

    const input = document.getElementById(`input-${q}`);
    const value = input.value.trim();
    const norm = normalize(value);
    const correct = normalize(QUESTIONS[q].answer);

    state.isBusy = true;

    // ★ ここ重要：正誤関係なく必ず先に出す
    await runDialogueSequence([`くらえ！\n${value}！！`], { keepMask: true });

    hideSayaDialogOnly();
    await playBossMagicSequence(QUESTIONS[q].attribute);

    if (norm !== correct) {
      showDialogueOverlay();
      await runDialogueSequence(["あれ！？魔法がでない！"]);
      state.isBusy = false;
      return;
    }

    state.solved[q] = true;
    damageBoss(QUESTIONS[q].damage);

    showDialogueOverlay();
    showBossOverlay();

    if (q !== "q4") {
      const all = state.solved.q1 && state.solved.q2 && state.solved.q3;

      if (all && state.phase === 1) {
        await runDialogueSequence(["ここまでやるとは…本気を出す！"], { keepBossVisible: true });
        hideDialogueOverlay();
        hideBossOverlay();
        await transformBoss();
        await runDialogueSequence(["ドラゴン形態…！"]);
        unlockQ4();
      } else {
        await runDialogueSequence(["ぐわ！効いたぞ！"], { keepBossVisible: true });
        hideBossOverlay();
      }
    } else {
      await runDialogueSequence(["究極魔法発動！"], { keepBossVisible: true });
      hideBossOverlay();

      await runDialogueSequence([
        "やったー！",
        "『さやはここにいる』って伝えて！"
      ]);
    }

    updateStatus();
    state.isBusy = false;
  }

  function unlockQ4() {
    document.getElementById("input-q4").disabled = false;
    document.querySelector('[data-question="q4"]').disabled = false;
  }

  function damageBoss(dmg) {
    state.hp = Math.max(0, state.hp - dmg);
    updateStatus();
  }

  function resetHp() {
    state.hp = state.maxHp;
    updateStatus();
  }

  async function transformBoss() {
    state.phase = 2;
    resetHp();

    flashLayer.classList.add("active");
    await wait(200);

    bossImage.src = "../assets/images/maleficent_dragon.png";
    bossImage.classList.add("dragon-form");

    await wait(500);
    flashLayer.classList.remove("active");
  }

  function updateStatus() {
    const p = (state.hp / state.maxHp) * 100;
    hpBarFill.style.width = `${p}%`;
    hpValue.textContent = `HP ${state.hp} / ${state.maxHp}`;
    hpName.textContent = state.phase === 1 ? "マレフィセント" : "ドラゴン";
  }

  async function playBossMagicSequence(type) {
    showBossOverlay();

    bossMagicEffect.className = `boss-magic-effect ${type}`;
    bossMagicEffect.classList.remove("hidden");

    await wait(300);

    bossOverlayImage.classList.add("boss-hit");
    await wait(300);

    bossOverlayImage.classList.remove("boss-hit");
    bossMagicEffect.classList.add("hidden");
  }

  function showBossOverlay() {
    bossOverlayStage.classList.remove("hidden");
    bossOverlayImage.classList.remove("hidden");

    bossOverlayImage.src =
      state.phase === 1
        ? "../assets/images/maleficent_human.png"
        : "../assets/images/maleficent_dragon.png";
  }

  function hideBossOverlay() {
    bossOverlayStage.classList.add("hidden");
  }

  function showDialogueOverlay() {
    effectOverlay.classList.remove("hidden");
    girlStage.classList.remove("hidden");
    dialogWindow.classList.remove("hidden");
    sayaImage.classList.add("visible");
  }

  function hideDialogueOverlay() {
    effectOverlay.classList.add("hidden");
  }

  function hideSayaDialogOnly() {
    sayaImage.classList.remove("visible");
    dialogWindow.classList.add("hidden");
  }

  async function runDialogueSequence(lines, opt = {}) {
    const { keepMask = false, keepBossVisible = false } = opt;

    showDialogueOverlay();
    if (keepBossVisible) showBossOverlay();

    for (const l of lines) {
      await typeText(l);
    }

    if (!keepMask) hideDialogueOverlay();
  }

  function typeText(text) {
    return new Promise((resolve) => {
      clearHandlers();

      fullText = text;
      displayedText = "";
      dialogText.textContent = "";
      isTyping = true;

      let i = 0;

      function next() {
        if (i < fullText.length) {
          displayedText += fullText[i];
          dialogText.textContent = displayedText;
          i++;
          typingTimer = setTimeout(next, 30);
        } else finish();
      }

      function finish() {
        isTyping = false;
        advanceHandler = () => {
          clearHandlers();
          resolve();
        };
        effectOverlay.addEventListener("click", advanceHandler);
      }

      typingSkipHandler = () => {
        if (!isTyping) return;
        clearTimeout(typingTimer);
        dialogText.textContent = fullText;
        finish();
      };

      effectOverlay.addEventListener("click", typingSkipHandler);
      next();
    });
  }

  function clearHandlers() {
    if (typingSkipHandler) {
      effectOverlay.removeEventListener("click", typingSkipHandler);
      typingSkipHandler = null;
    }
    if (advanceHandler) {
      effectOverlay.removeEventListener("click", advanceHandler);
      advanceHandler = null;
    }
  }

  function normalize(t) {
    return t.trim().replace(/[ァ-ヶ]/g, (c) =>
      String.fromCharCode(c.charCodeAt(0) - 0x60)
    );
  }

  function wait(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }
});
