document.addEventListener("DOMContentLoaded", () => {
  const QUESTIONS = {
    q1: { answer: "こたえ1", attribute: "fire", damage: 30 },
    q2: { answer: "こたえ2", attribute: "thunder", damage: 30 },
    q3: { answer: "こたえ3", attribute: "ice", damage: 40 },
    q4: { answer: "こたえ4", attribute: "fire", damage: 100 }
  };

  const state = {
    solved: {
      q1: false,
      q2: false,
      q3: false,
      q4: false
    },
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
  const bossDialogWindow = document.getElementById("bossDialogWindow");
  const bossDialogText = document.getElementById("bossDialogText");

  const q4Input = document.getElementById("input-q4");
  const q4Button = document.querySelector('[data-question="q4"]');
  const q4SolvedLabel = document.getElementById("solved-q4");

  const answerButtons = document.querySelectorAll(".answer-button");
  const answerInputs = document.querySelectorAll(".answer-input");

  let typingTimer = null;
  let typingSkipHandler = null;
  let advanceHandler = null;
  let currentTypeTarget = null;
  let isTyping = false;
  let fullText = "";
  let displayedText = "";

  updateStatus();
  showInitialStory();

  answerButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const questionKey = button.dataset.question;
      handleAnswer(questionKey);
    });
  });

  answerInputs.forEach((input) => {
    input.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") return;
      event.preventDefault();

      const button = input.parentElement.querySelector(".answer-button");
      if (button && !button.disabled) {
        button.click();
      }
    });
  });

  async function showInitialStory() {
    state.isBusy = true;

    await runSayaDialogue([
      "ここが管理者のいる場所……。",
      "ようやくたどり着いたね！",
      "あの管理者……マレフィセントを倒せば、きっと私の願いに近づけるはず！",
      "謎の答えが魔法になるの！力を貸して！"
    ]);

    state.isBusy = false;
  }

  async function handleAnswer(questionKey) {
    if (state.isBusy) return;
    if (state.solved[questionKey]) return;

    const question = QUESTIONS[questionKey];
    if (!question) return;

    const input = document.getElementById(`input-${questionKey}`);
    const button = document.querySelector(`[data-question="${questionKey}"]`);
    const solvedLabel = document.getElementById(`solved-${questionKey}`);
    const box = button.closest(".question-box");

    const rawInput = input.value.trim();
    const userInput = normalizeAnswer(rawInput);
    const correctAnswer = normalizeAnswer(question.answer);

    if (!userInput) {
      state.isBusy = true;
      await runSayaDialogue(["答えを入力してみて！"]);
      state.isBusy = false;
      return;
    }

    state.isBusy = true;
    button.disabled = true;
    input.disabled = true;

    try {
      if (questionKey === "q1" || questionKey === "q2" || questionKey === "q3") {
        await runSayaDialogue([`くらえ！\n${rawInput}！！`], { keepMask: true });

        hideSayaDialogOnly();
        await playBossMagicSequence(question.attribute);

        if (userInput !== correctAnswer) {
          await runBossDialogue(["あれ！？魔法がでない！"]);
          button.disabled = false;
          input.disabled = false;
          state.isBusy = false;
          return;
        }

        state.solved[questionKey] = true;
        solvedLabel.textContent = "完了";
        solvedLabel.classList.remove("locked");
        solvedLabel.classList.add("done");
        box.classList.add("solved");
        button.textContent = "完了";

        damageBoss(question.damage);

        const allFirstThreeSolved =
          state.solved.q1 && state.solved.q2 && state.solved.q3;

        if (allFirstThreeSolved && state.phase === 1) {
          await runBossDialogue(["ここまでやるとは…そろそろ本気を出すとするか！"]);

          hideBossOverlayOnly();
          await transformBossToDragon();

          await runSayaDialogue([
            "クッ…すごい魔力！",
            "でも、私の究極魔法なら倒せるはず！"
          ]);

          unlockQuestion4();
        } else {
          await runBossDialogue(["ぐわ！なかなか聞いたぞ！"]);
        }

        updateStatus();
        state.isBusy = false;
        return;
      }

      if (questionKey === "q4") {
        if (userInput !== correctAnswer) {
          await runSayaDialogue([
            `${rawInput}`,
            "あれ！？うんともスンともだね…"
          ]);
          button.disabled = false;
          input.disabled = false;
          state.isBusy = false;
          return;
        }

        state.solved[questionKey] = true;
        solvedLabel.textContent = "完了";
        solvedLabel.classList.remove("locked");
        solvedLabel.classList.add("done");
        box.classList.add("solved");
        button.textContent = "完了";

        await runSayaDialogue([
          "混沌たる現世に、我の存在をここに示さん。",
          "究極魔法！",
          "イグジスタンス・エクスプロージョン（さやはここにいる）"
        ], { keepMask: true });

        hideSayaDialogOnly();
        await playBossMagicSequence(question.attribute);

        damageBoss(question.damage);

        await runBossDialogue([
          "ぐわーーーーーー！…う、自惚れるなよ…私は…三竜王のなかでも最弱…お前の寿命が少し伸びただけのこと"
        ]);

        await runSayaDialogue([
          "やったー倒せたね！おめでとう！",
          "本当にここまで遊んでくれて！ありがとう！\n誰も遊んでくれないと思ってたから、すっごくうれしい！",
          "ちなみに三竜王がなんたらっていうのは\nただ言わせたかっただけだから気にしないで！\n他の王は何一つ考えてないから…",
          "もしよかったら、病室で寝ていると思う私に『さやはここにいる』って声をかけてほしい。",
          "反応できるかわからないけど、とっても喜ぶと思うんだ！\nもしかしたらその一言で目が覚めるかもしれない！",
          "お願い！私を救って！"
        ]);

        updateStatus();
        state.isBusy = false;
        return;
      }
    } catch (error) {
      console.error(error);
      button.disabled = false;
      input.disabled = false;
      state.isBusy = false;
    }
  }

  function unlockQuestion4() {
    q4Input.disabled = false;
    q4Button.disabled = false;
    q4SolvedLabel.textContent = "解放済み";
    q4SolvedLabel.classList.remove("locked");
  }

  function damageBoss(amount) {
    state.hp = Math.max(0, state.hp - amount);
    updateStatus();
  }

  function resetBossHp() {
    state.hp = state.maxHp;
    updateStatus();
  }

  async function transformBossToDragon() {
    state.phase = 2;
    resetBossHp();

    flashLayer.classList.add("active");
    await wait(180);

    bossImage.src = "../assets/images/maleficent_dragon.png";
    bossImage.alt = "マレフィセント（ドラゴン）";
    bossImage.classList.add("dragon-form");
    bossImage.classList.add("dragon-appear");

    await wait(700);

    bossImage.classList.remove("dragon-appear");
    flashLayer.classList.remove("active");
  }

  function updateStatus() {
    const hpPercent = Math.max(0, Math.min(100, (state.hp / state.maxHp) * 100));
    hpBarFill.style.width = `${hpPercent}%`;
    hpValue.textContent = `HP ${state.hp} / ${state.maxHp}`;
    hpName.textContent =
      state.phase === 1 ? "マレフィセント" : "マレフィセント（ドラゴン）";
  }

  async function playBossMagicSequence(attribute) {
    showBossOverlayOnly();

    bossMagicEffect.className = `boss-magic-effect ${attribute}`;
    bossMagicEffect.classList.remove("hidden");

    await wait(420);

    bossOverlayImage.classList.add("boss-hit");
    await wait(420);

    bossOverlayImage.classList.remove("boss-hit");
    bossMagicEffect.className = "boss-magic-effect hidden";
  }

  async function runSayaDialogue(lines, options = {}) {
    const { keepMask = false } = options;

    showSayaOverlay();

    for (const line of lines) {
      await typeText(line, dialogText, "saya");
    }

    if (!keepMask) {
      hideOverlayAll();
    }
  }

  async function runBossDialogue(lines) {
    showBossOverlayOnly();
    showBossDialogWindow();

    for (const line of lines) {
      await typeText(line, bossDialogText, "boss");
    }

    hideOverlayAll();
  }

  function showSayaOverlay() {
    clearTyping();
    effectOverlay.classList.remove("hidden");
    girlStage.classList.remove("hidden");
    dialogWindow.classList.remove("hidden");
    bossOverlayStage.classList.add("hidden");
    bossDialogWindow.classList.add("hidden");

    requestAnimationFrame(() => {
      sayaImage.classList.add("visible");
    });
  }

  function hideSayaDialogOnly() {
    clearTyping();
    sayaImage.classList.remove("visible");
    dialogWindow.classList.add("hidden");
    dialogText.textContent = "";
  }

  function showBossOverlayOnly() {
    clearTyping();
    effectOverlay.classList.remove("hidden");
    girlStage.classList.add("hidden");
    dialogWindow.classList.add("hidden");
    bossOverlayStage.classList.remove("hidden");
    bossOverlayImage.classList.remove("hidden");
    bossDialogWindow.classList.add("hidden");

    bossOverlayImage.src =
      state.phase === 1
        ? "../assets/images/maleficent_human.png"
        : "../assets/images/maleficent_dragon.png";

    bossOverlayImage.alt =
      state.phase === 1
        ? "マレフィセント"
        : "マレフィセント（ドラゴン）";

    bossOverlayImage.classList.toggle("dragon-form", state.phase === 2);
  }

  function showBossDialogWindow() {
    bossDialogWindow.classList.remove("hidden");
    bossDialogText.textContent = "";
  }

  function hideBossOverlayOnly() {
    clearTyping();
    bossDialogWindow.classList.add("hidden");
    bossOverlayImage.classList.add("hidden");
    bossOverlayStage.classList.add("hidden");
    bossDialogText.textContent = "";
  }

  function hideOverlayAll() {
    clearTyping();

    sayaImage.classList.remove("visible");
    dialogWindow.classList.add("hidden");
    bossDialogWindow.classList.add("hidden");

    girlStage.classList.add("hidden");
    bossOverlayStage.classList.add("hidden");
    effectOverlay.classList.add("hidden");

    dialogText.textContent = "";
    bossDialogText.textContent = "";
  }

  function typeText(text, targetEl, mode) {
    return new Promise((resolve) => {
      clearTyping();

      fullText = text;
      displayedText = "";
      targetEl.textContent = "";
      currentTypeTarget = targetEl;
      isTyping = true;

      let index = 0;
      const speed = 34;

      function finishTyping() {
        isTyping = false;

        if (typingSkipHandler) {
          effectOverlay.removeEventListener("click", typingSkipHandler);
          typingSkipHandler = null;
        }

        advanceHandler = () => {
          if (isTyping) return;
          clearTypingHandlers();
          resolve();
        };

        effectOverlay.addEventListener("click", advanceHandler);
      }

      function typeNext() {
        if (index < fullText.length) {
          displayedText += fullText[index];
          targetEl.textContent = displayedText;
          index += 1;
          typingTimer = setTimeout(typeNext, speed);
        } else {
          finishTyping();
        }
      }

      typingSkipHandler = () => {
        if (!isTyping) return;
        clearTimeout(typingTimer);
        displayedText = fullText;
        targetEl.textContent = fullText;
        finishTyping();
      };

      effectOverlay.addEventListener("click", typingSkipHandler);
      typeNext();
    });
  }

  function clearTypingHandlers() {
    if (typingSkipHandler) {
      effectOverlay.removeEventListener("click", typingSkipHandler);
      typingSkipHandler = null;
    }

    if (advanceHandler) {
      effectOverlay.removeEventListener("click", advanceHandler);
      advanceHandler = null;
    }
  }

  function clearTyping() {
    clearTimeout(typingTimer);
    clearTypingHandlers();
    isTyping = false;
    fullText = "";
    displayedText = "";
    currentTypeTarget = null;
  }

  function normalizeAnswer(text) {
    return String(text)
      .trim()
      .replace(/\s+/g, "")
      .replace(/[ァ-ヶ]/g, (match) =>
        String.fromCharCode(match.charCodeAt(0) - 0x60)
      );
  }

  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
});
