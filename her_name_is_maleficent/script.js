document.addEventListener("DOMContentLoaded", () => {
  const QUESTIONS = {
    q1: {
      answer: "こたえ1",
      attribute: "fire"
    },
    q2: {
      answer: "こたえ2",
      attribute: "thunder"
    },
    q3: {
      answer: "こたえ3",
      attribute: "ice"
    },
    q4: {
      answer: "こたえ4"
    }
  };

  const state = {
    solved: {
      q1: false,
      q2: false,
      q3: false,
      q4: false
    },
    phase: 1,
    isBusy: false
  };

  const mainPage = document.getElementById("mainPage");
  const bossImage = document.getElementById("bossImage");
  const effectLayer = document.getElementById("effectLayer");
  const flashLayer = document.getElementById("flashLayer");
  const phaseChip = document.getElementById("phaseChip");
  const progressChip = document.getElementById("progressChip");

  const effectOverlay = document.getElementById("effectOverlay");
  const girlStage = document.getElementById("girlStage");
  const sayaImage = document.getElementById("sayaImage");
  const dialogWindow = document.getElementById("dialogWindow");
  const dialogText = document.getElementById("dialogText");

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

  mainPage.classList.add("page-breath");
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

  await runDialogueSequence([
    "ここが管理者のいる場所……。",
    "ようやくたどり着いたね！",
    "あの管理者……マレフィセントを倒せば、きっと私の願いに近づけるはず！",
    "謎の答えが魔法になるの。力を貸して！"
  ]);

  hideDialogueOverlay();
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
    const box = document.querySelector(`[data-question="${questionKey}"]`).closest(".question-box");

    const userInput = normalizeAnswer(input.value);
    const correctAnswer = normalizeAnswer(question.answer);

    if (!userInput) {
      await runDialogueSequence(["答えを入力してみて！"]);
      return;
    }

    state.isBusy = true;
    button.disabled = true;
    input.disabled = true;

    try {
      if (userInput !== correctAnswer) {
        if (questionKey === "q4") {
          await runDialogueSequence([
            `${input.value.trim()}`,
            "あれ！？うんともスンともだね…"
          ]);
        } else {
          await runDialogueSequence([
            "あれ！？魔法がでない！"
          ]);
        }

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

      if (questionKey === "q1" || questionKey === "q2" || questionKey === "q3") {
        await runDialogueSequence([
          `くらえ！\n${input.value.trim()}！！`
        ]);

        await playAttackEffect(question.attribute);

        const firstThreeSolved = state.solved.q1 && state.solved.q2 && state.solved.q3;

        if (firstThreeSolved && state.phase === 1) {
          await runDialogueSequence([
            "ここまでやるとは…そろそろ本気を出すとするか！"
          ]);

          await transformBossToDragon();

          await runDialogueSequence([
            "クッ…すごい魔力！\nでも、私の究極魔法なら倒せるはず！"
          ]);

          unlockQuestion4();
        } else {
          await runDialogueSequence([
            "ぐわ！なかなか聞いたぞ！"
          ]);
        }
      }

      if (questionKey === "q4") {
        await runDialogueSequence([
          "混沌たる現世に、我の存在をここに示さん。\n究極魔法！\nイグジスタンス・エクスプロージョン（さやはここにいる）"
        ]);

        await playUltimateEffect();

        await runDialogueSequence([
          "ぐわーーーーーー！…う、自惚れるなよ…私は…三竜王のなかでも最弱…お前の寿命が少し伸びただけのこと",
          "やったー倒せたね！おめでとう！",
          "本当にここまで遊んでくれて！ありがとう！\n誰も遊んでくれないと思ってたから、すっごくうれしい！",
          "ちなみに三竜王がなんたらっていうのは\nただ言わせたかっただけだから気にしないで！\n他の王は何一つ考えてないから…",
          "もしよかったら、病室で寝ていると思う私に『さやはここにいる』って声をかけてほしい。",
          "反応できるかわからないけど、とっても喜ぶと思うんだ！\nもしかしたらその一言で目が覚めるかもしれない！",
          "お願い！私を救って！"
        ]);

        hideDialogueOverlay();
      }

      updateStatus();
    } catch (error) {
      console.error(error);
      button.disabled = false;
      input.disabled = false;
    }

    state.isBusy = false;
  }

  function unlockQuestion4() {
    q4Input.disabled = false;
    q4Button.disabled = false;
    q4SolvedLabel.textContent = "解放済み";
    q4SolvedLabel.classList.remove("locked");
  }

  async function transformBossToDragon() {
    state.phase = 2;
    updateStatus();

    flashLayer.classList.add("active");
    await wait(200);

    bossImage.classList.remove("dragon-appear");
    bossImage.classList.add("shake");
    await wait(360);
    bossImage.classList.remove("shake");

    bossImage.src = "../assets/images/maleficent_dragon.png";
    bossImage.alt = "マレフィセント（ドラゴン）";
    bossImage.classList.add("dragon-form");
    bossImage.classList.add("dragon-appear");

    await wait(700);
    bossImage.classList.remove("dragon-appear");
    flashLayer.classList.remove("active");
  }

  async function playAttackEffect(attribute) {
    const burst = document.createElement("div");
    burst.className = `effect-burst ${attribute}`;

    const ring = document.createElement("div");
    ring.className = "effect-ring";

    effectLayer.appendChild(burst);
    effectLayer.appendChild(ring);

    flashLayer.classList.add("active");
    bossImage.classList.add("shake");

    await wait(attribute === "thunder" ? 520 : 650);

    bossImage.classList.remove("shake");
    flashLayer.classList.remove("active");
    burst.remove();
    ring.remove();
  }

  async function playUltimateEffect() {
    const burst = document.createElement("div");
    burst.className = "effect-burst fire";
    burst.style.width = "90px";
    burst.style.height = "90px";

    const ring = document.createElement("div");
    ring.className = "effect-ring";
    ring.style.width = "80px";
    ring.style.height = "80px";
    ring.style.borderWidth = "3px";

    effectLayer.appendChild(burst);
    effectLayer.appendChild(ring);

    for (let i = 0; i < 3; i += 1) {
      flashLayer.classList.add("active");
      bossImage.classList.add("shake");
      await wait(240);
      flashLayer.classList.remove("active");
      await wait(100);
    }

    bossImage.classList.remove("shake");
    burst.remove();
    ring.remove();
  }

  async function runDialogueSequence(lines) {
    showDialogueOverlay();

    for (const line of lines) {
      await typeText(line);
    }
  }

  function showDialogueOverlay() {
    effectOverlay.classList.remove("hidden");
    girlStage.classList.remove("hidden");
    dialogWindow.classList.remove("hidden");

    requestAnimationFrame(() => {
      sayaImage.classList.add("visible");
    });
  }

  function hideDialogueOverlay() {
    clearTimeout(typingTimer);
    clearSceneHandlers();

    sayaImage.classList.remove("visible");
    dialogWindow.classList.add("hidden");
    girlStage.classList.add("hidden");
    effectOverlay.classList.add("hidden");
    dialogText.textContent = "";
    isTyping = false;
  }

  function typeText(text) {
    return new Promise((resolve) => {
      clearTimeout(typingTimer);
      clearSceneHandlers();

      fullText = text;
      displayedText = "";
      dialogText.textContent = "";
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
          clearSceneHandlers();
          resolve();
        };

        effectOverlay.addEventListener("click", advanceHandler);
      }

      function typeNext() {
        if (index < fullText.length) {
          displayedText += fullText[index];
          dialogText.textContent = displayedText;
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
        dialogText.textContent = fullText;
        finishTyping();
      };

      effectOverlay.addEventListener("click", typingSkipHandler);
      typeNext();
    });
  }

  function clearSceneHandlers() {
    if (typingSkipHandler) {
      effectOverlay.removeEventListener("click", typingSkipHandler);
      typingSkipHandler = null;
    }

    if (advanceHandler) {
      effectOverlay.removeEventListener("click", advanceHandler);
      advanceHandler = null;
    }
  }

  function updateStatus() {
    const solvedCount = Object.values(state.solved).filter(Boolean).length;
    progressChip.textContent = `攻略状況 ${solvedCount} / 4`;
    phaseChip.textContent = state.phase === 1 ? "Phase 1 / 人型" : "Phase 2 / ドラゴン";
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
