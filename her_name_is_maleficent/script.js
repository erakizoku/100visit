document.addEventListener("DOMContentLoaded", () => {
  const QUESTIONS = {
    q1: { answer: "こたえ1", attribute: "fire", damage: 30 },
    q2: { answer: "こたえ2", attribute: "thunder", damage: 30 },
    q3: { answer: "こたえ3", attribute: "ice", damage: 40 },
    q4: { answer: "こたえ4", attribute: "fire", damage: 100 }
  };

  const state = {
    solved: { q1: false, q2: false, q3: false, q4: false },
    phase: 1,
    isBusy: false,
    isAnimating: false,
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
  const choiceWindow = document.getElementById("choiceWindow");
  const choiceButton = document.getElementById("choiceButton");
  const sayaAura = document.getElementById("sayaAura");
  const particleLayer = document.getElementById("particleLayer");

  const bossOverlayStage = document.getElementById("bossOverlayStage");
  const bossOverlayImage = document.getElementById("bossOverlayImage");
  const bossMagicEffect = document.getElementById("bossMagicEffect");
  const bossDialogWindow = document.getElementById("bossDialogWindow");
  const bossDialogText = document.getElementById("bossDialogText");
  const overlayHpBox = document.getElementById("overlayHpBox");
  const overlayHpFill = document.getElementById("overlayHpFill");
  const overlayHpValue = document.getElementById("overlayHpValue");
  const overlayHpName = document.getElementById("overlayHpName");
  const bossDarkAura = document.getElementById("bossDarkAura");

  const animationBlocker = document.getElementById("animationBlocker");

  const q4Input = document.getElementById("input-q4");
  const q4Button = document.querySelector('[data-question="q4"]');
  const q4SolvedLabel = document.getElementById("solved-q4");

  const answerButtons = document.querySelectorAll(".answer-button");
  const answerInputs = document.querySelectorAll(".answer-input");

  let typingTimer = null;
  let typingSkipHandler = null;
  let advanceHandler = null;
  let isTyping = false;
  let fullText = "";
  let displayedText = "";

  updateStatus();
  showOpeningSequence();

  answerButtons.forEach((button) => {
    button.addEventListener("click", () => {
      handleAnswer(button.dataset.question);
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

  async function showOpeningSequence() {
    state.isBusy = true;

    setSayaSprite("../assets/images/saya_standing.png");

    await runSayaDialogue([
      "管理者の正体まで考えてくれてありがとう！",
      "わたしの病気って「眠れる森の美女」のオーロラ姫みたいだから\n正体はマレフィセントってことにしたんだよ！",
      "ちょっと難しいかなって思ったけど、本当にすごいね！",
      "せっかくだからさもう少しわたしのゲームに付き合ってよ。"
    ], { keepMask: true });

    await playSayaTransformation();

    await runChoice("その姿は？");

    await runSayaDialogue([
      "えへへ、ちょっと魔法少女に憧れててね。",
      "ここからは管理者ＶＳ魔法少女って設定だからよろしく！",
      "あれがマレフィセントの正体！？"
    ]);

    await runBossDialogue([
      "ついにここまでたどり着いたか。\nちょうど退屈していたところだ、少し遊んでやろう"
    ]);

    await runSayaDialogue([
      "マレフィセントを倒せば。きっとわたしの願いに近づけるはず！",
      "あなたの力を貸して！謎を解いて封じられた魔法を解放してほしい！"
    ]);

    state.isBusy = false;
  }

  async function handleAnswer(questionKey) {
    if (state.isBusy || state.isAnimating) return;
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

        if (userInput !== correctAnswer) {
          await runBossDialogue(["ふっ不発のようだな"]);
          await runSayaDialogue(["あれ、魔法が出ない…もう一度謎と解いてみて！"]);
          button.disabled = false;
          input.disabled = false;
          state.isBusy = false;
          return;
        }

        hideSayaDialogOnly();
        await playBossMagicSequence(question.attribute);

        state.solved[questionKey] = true;
        solvedLabel.textContent = "完了";
        solvedLabel.classList.remove("locked");
        solvedLabel.classList.add("done");
        box.classList.add("solved");
        button.textContent = "完了";

        if (questionKey === "q1") {
          await animateBossHpTo(70);
        } else if (questionKey === "q2") {
          await animateBossHpTo(40);
        } else if (questionKey === "q3") {
          await animateBossHpTo(1);
        }

        if (state.solved.q1 && state.solved.q2 && state.solved.q3 && state.phase === 1) {
          await runBossDialogue(["ここまでやるとは…そろそろ本気を出すとするか"], { keepOverlayHp: true });

          hideBossOverlayOnly();
          await playBossTransformation();

          await runBossDialogue(["ギャオーーーーン"]);

          setSayaSprite("../assets/images/saya_magic.png");
          await runSayaDialogue([
            "くっすごい魔力…",
            "でも、わたしの究極魔法ならきっと倒せるはず…"
          ]);

          unlockQuestion4();
        } else {
          await runBossDialogue(["ぐわ！なかなか聞いたぞ！"], { keepOverlayHp: true });
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
        await playUltimateBossMagicSequence(question.attribute);
        await animateBossHpTo(0);

        await runBossDialogue([
          "ぐわーーーーーー！…う、自惚れるなよ…私は…三竜王のなかでも最弱…お前の寿命が少し伸びただけのこと"
        ], { keepOverlayHp: true });

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
      state.isAnimating = false;
      unlockAnimation();
    }
  }

  async function runChoice(label) {
    showSayaOverlay();
    choiceButton.textContent = label;
    choiceWindow.classList.remove("hidden");

    await new Promise((resolve) => {
      const handler = (event) => {
        if (state.isAnimating) return;
        event.stopPropagation();
        choiceButton.removeEventListener("click", handler);
        choiceWindow.classList.add("hidden");
        resolve();
      };
      choiceButton.addEventListener("click", handler);
    });
  }

  async function playSayaTransformation() {
    state.isAnimating = true;
    lockAnimation();

    effectOverlay.classList.remove("hidden");
    girlStage.classList.remove("hidden");
    dialogWindow.classList.add("hidden");
    choiceWindow.classList.add("hidden");
    bossOverlayStage.classList.add("hidden");

    sayaImage.classList.add("visible");
    sayaAura.classList.remove("hidden");
    particleLayer.classList.remove("hidden");

    await wait(80);

    sayaAura.classList.add("active");
    particleLayer.classList.add("active");
    await wait(280);

    flashLayer.classList.add("strong");
    await wait(260);

    setSayaSprite("../assets/images/saya_magic.png");
    sayaImage.classList.add("transform-reveal");
    await wait(360);

    flashLayer.classList.remove("strong");
    particleLayer.classList.remove("active");
    sayaAura.classList.remove("active");
    await wait(260);

    sayaImage.classList.remove("transform-reveal");
    particleLayer.classList.add("hidden");
    sayaAura.classList.add("hidden");

    hideOverlayAll();

    unlockAnimation();
    state.isAnimating = false;
  }

  async function playBossTransformation() {
    state.isAnimating = true;
    lockAnimation();

    effectOverlay.classList.remove("hidden");
    bossOverlayStage.classList.remove("hidden");
    bossOverlayImage.classList.remove("hidden");
    showOverlayHp();

    bossDarkAura.classList.remove("hidden");
    bossDarkAura.classList.add("active");

    await wait(220);

    flashLayer.classList.add("strong");
    await wait(260);

    state.phase = 2;
    state.hp = 1;
    bossImage.src = "../assets/images/maleficent_dragon.png";
    bossImage.alt = "マレフィセント（ドラゴン）";
    bossImage.classList.add("dragon-form");

    bossOverlayImage.src = "../assets/images/maleficent_dragon.png";
    bossOverlayImage.alt = "マレフィセント（ドラゴン）";
    bossOverlayImage.classList.add("dragon-form");
    bossOverlayImage.classList.add("transform-reveal");

    await wait(220);

    state.hp = 100;
    updateStatus();
    overlayHpName.textContent = "マレフィセント（ドラゴン）";
    await animateOverlayHpOnly(1, 100);

    await wait(260);

    flashLayer.classList.remove("strong");
    bossDarkAura.classList.remove("active");
    bossDarkAura.classList.add("hidden");
    bossOverlayImage.classList.remove("transform-reveal");

    hideBossOverlayOnly();

    unlockAnimation();
    state.isAnimating = false;
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

  async function playUltimateBossMagicSequence(attribute) {
    state.isAnimating = true;
    lockAnimation();

    showBossOverlayOnly();

    bossMagicEffect.className = `boss-magic-effect ${attribute}`;
    bossMagicEffect.classList.remove("hidden");
    bossMagicEffect.style.width = "140px";
    bossMagicEffect.style.height = "140px";

    for (let i = 0; i < 3; i += 1) {
      flashLayer.classList.add("active");
      await wait(180);
      flashLayer.classList.remove("active");
      await wait(80);
    }

    bossOverlayImage.classList.add("boss-hit");
    await wait(420);
    bossOverlayImage.classList.remove("boss-hit");

    bossMagicEffect.className = "boss-magic-effect hidden";
    bossMagicEffect.style.width = "";
    bossMagicEffect.style.height = "";

    unlockAnimation();
    state.isAnimating = false;
  }

  function lockAnimation() {
    animationBlocker.classList.remove("hidden");
  }

  function unlockAnimation() {
    animationBlocker.classList.add("hidden");
  }

  function unlockQuestion4() {
    q4Input.disabled = false;
    q4Button.disabled = false;
    q4SolvedLabel.textContent = "解放済み";
    q4SolvedLabel.classList.remove("locked");
  }

  async function animateBossHpTo(targetHp) {
    showOverlayHp();
    const start = state.hp;
    const end = targetHp;
    const steps = Math.max(1, Math.abs(start - end));
    const direction = end < start ? -1 : 1;

    for (let i = 0; i < steps; i += 1) {
      state.hp += direction;
      updateStatus();
      syncOverlayHp();
      await wait(14);
    }

    state.hp = targetHp;
    updateStatus();
    syncOverlayHp();
  }

  async function animateOverlayHpOnly(startHp, targetHp) {
    let current = startHp;
    setOverlayHpVisual(current);

    const steps = Math.max(1, Math.abs(startHp - targetHp));
    const direction = targetHp < startHp ? -1 : 1;

    for (let i = 0; i < steps; i += 1) {
      current += direction;
      setOverlayHpVisual(current);
      await wait(10);
    }

    setOverlayHpVisual(targetHp);
  }

  function updateStatus() {
    const hpPercent = Math.max(0, Math.min(100, (state.hp / state.maxHp) * 100));
    hpBarFill.style.width = `${hpPercent}%`;
    hpValue.textContent = `HP ${state.hp} / ${state.maxHp}`;
    hpName.textContent =
      state.phase === 1 ? "マレフィセント" : "マレフィセント（ドラゴン）";
  }

  function showOverlayHp() {
    overlayHpBox.classList.remove("hidden");
    syncOverlayHp();
  }

  function hideOverlayHp() {
    overlayHpBox.classList.add("hidden");
  }

  function syncOverlayHp() {
    overlayHpName.textContent =
      state.phase === 1 ? "マレフィセント" : "マレフィセント（ドラゴン）";
    setOverlayHpVisual(state.hp);
  }

  function setOverlayHpVisual(hp) {
    const hpPercent = Math.max(0, Math.min(100, (hp / state.maxHp) * 100));
    overlayHpFill.style.width = `${hpPercent}%`;
    overlayHpValue.textContent = `HP ${hp} / ${state.maxHp}`;
  }

  async function runSayaDialogue(lines, options = {}) {
    const { keepMask = false } = options;

    showSayaOverlay();

    for (const line of lines) {
      await typeText(line, dialogText);
    }

    if (!keepMask) {
      hideOverlayAll();
    }
  }

  async function runBossDialogue(lines, options = {}) {
    const { keepOverlayHp = false } = options;

    showBossOverlayOnly();
    showBossDialogWindow();

    if (keepOverlayHp) {
      showOverlayHp();
    }

    for (const line of lines) {
      await typeText(line, bossDialogText);
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
    choiceWindow.classList.add("hidden");
    hideOverlayHp();

    requestAnimationFrame(() => {
      sayaImage.classList.add("visible");
    });
  }

  function hideSayaDialogOnly() {
    clearTyping();
    sayaImage.classList.remove("visible");
    dialogWindow.classList.add("hidden");
    choiceWindow.classList.add("hidden");
    dialogText.textContent = "";
  }

  function showBossOverlayOnly() {
    clearTyping();
    effectOverlay.classList.remove("hidden");
    girlStage.classList.add("hidden");
    dialogWindow.classList.add("hidden");
    choiceWindow.classList.add("hidden");

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
    hideOverlayHp();
  }

  function hideOverlayAll() {
    clearTyping();

    sayaImage.classList.remove("visible");
    dialogWindow.classList.add("hidden");
    bossDialogWindow.classList.add("hidden");
    choiceWindow.classList.add("hidden");

    girlStage.classList.add("hidden");
    bossOverlayStage.classList.add("hidden");
    effectOverlay.classList.add("hidden");

    dialogText.textContent = "";
    bossDialogText.textContent = "";
    hideOverlayHp();

    sayaAura.classList.remove("active");
    sayaAura.classList.add("hidden");
    particleLayer.classList.remove("active");
    particleLayer.classList.add("hidden");
    bossDarkAura.classList.remove("active");
    bossDarkAura.classList.add("hidden");
  }

  function typeText(text, targetEl) {
    return new Promise((resolve) => {
      clearTyping();

      fullText = text;
      displayedText = "";
      targetEl.textContent = "";
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
          if (isTyping || state.isAnimating) return;
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
        if (!isTyping || state.isAnimating) return;
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
  }

  function setSayaSprite(src) {
    sayaImage.src = src;
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