const scene = document.getElementById("scene");
const bgLayerA = document.getElementById("bgLayerA");
const bgLayerB = document.getElementById("bgLayerB");
const characterImage = document.getElementById("characterImage");

const textEl = document.getElementById("text");
const textHint = document.getElementById("textHint");
const choicesEl = document.getElementById("choices");

const inputOverlay = document.getElementById("inputOverlay");
const userInput = document.getElementById("userInput");
const submitBtn = document.getElementById("submitBtn");

const endingOverlay = document.getElementById("endingOverlay");
const endingBig = document.getElementById("endingBig");
const endingMid = document.getElementById("endingMid");

let activeBg = "A";
let isTyping = false;
let fullText = "";
let displayedText = "";
let typingTimer = null;
let currentAdvanceHandler = null;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function clearChoices() {
  choicesEl.innerHTML = "";
}

function addChoice(label, callback) {
  const btn = document.createElement("button");
  btn.className = "choice-btn";
  btn.type = "button";
  btn.textContent = label;
  btn.addEventListener("click", callback, { once: true });
  choicesEl.appendChild(btn);
}

function clearAdvanceHandler() {
  if (currentAdvanceHandler) {
    scene.removeEventListener("click", currentAdvanceHandler);
    currentAdvanceHandler = null;
  }
}

function setBlackBackground() {
  bgLayerA.style.backgroundImage = "";
  bgLayerB.style.backgroundImage = "";
  bgLayerA.classList.remove("visible");
  bgLayerB.classList.remove("visible");
  scene.classList.add("scene-black");
}

async function fadeBackground(fileName) {
  scene.classList.remove("scene-black");

  const nextLayer = activeBg === "A" ? bgLayerB : bgLayerA;
  const prevLayer = activeBg === "A" ? bgLayerA : bgLayerB;

  nextLayer.style.backgroundImage = `url('../assets/images/${fileName}')`;
  nextLayer.classList.add("visible");
  prevLayer.classList.remove("visible");

  activeBg = activeBg === "A" ? "B" : "A";

  await wait(1000);
}

function showCharacter(fileName) {
  characterImage.src = `../assets/images/${fileName}`;
  characterImage.classList.remove("hidden");
  requestAnimationFrame(() => {
    characterImage.classList.add("visible");
  });
}

function hideCharacter() {
  characterImage.classList.remove("visible");
  setTimeout(() => {
    characterImage.classList.add("hidden");
    characterImage.src = "";
  }, 400);
}

function setTextInstant(text) {
  fullText = text;
  displayedText = text;
  textEl.textContent = text;
  isTyping = false;
}

function typeText(text) {
  return new Promise((resolve) => {
    clearAdvanceHandler();
    clearChoices();

    fullText = text;
    displayedText = "";
    textEl.textContent = "";
    isTyping = true;

    let index = 0;
    const speed = 34;

    function typeNext() {
      if (index < fullText.length) {
        displayedText += fullText[index];
        textEl.textContent = displayedText;
        index += 1;
        typingTimer = setTimeout(typeNext, speed);
      } else {
        isTyping = false;

        currentAdvanceHandler = () => {
          if (isTyping) return;
          clearAdvanceHandler();
          resolve();
        };

        scene.addEventListener("click", currentAdvanceHandler);
      }
    }

    typeNext();

    currentAdvanceHandler = () => {
      if (!isTyping) return;
      clearTimeout(typingTimer);
      isTyping = false;
      displayedText = fullText;
      textEl.textContent = fullText;
    };

    scene.addEventListener("click", currentAdvanceHandler, { once: true });
  });
}

function showInputOverlay() {
  return new Promise((resolve) => {
    userInput.value = "";
    inputOverlay.classList.remove("hidden");
    userInput.focus();

    function submit() {
      const value = userInput.value.trim();
      if (!value) return;

      cleanup();
      resolve(value);
    }

    function keydownHandler(event) {
      if (event.key === "Enter") {
        event.preventDefault();
        submit();
      }
    }

    function cleanup() {
      submitBtn.removeEventListener("click", submit);
      userInput.removeEventListener("keydown", keydownHandler);
      inputOverlay.classList.add("hidden");
    }

    submitBtn.addEventListener("click", submit);
    userInput.addEventListener("keydown", keydownHandler);
  });
}

function showEnding(big, mid) {
  endingBig.textContent = big;
  endingMid.textContent = mid;
  endingOverlay.classList.remove("hidden");
}

async function commonRoute() {
  setBlackBackground();
  await typeText("週末私はサヤが入院しているという病院に向かった。");

  await fadeBackground("hospital_corridor.png");
  await typeText("ナースステーションでサヤの名前を告げても、怪しまれて通してもらえなかった。");
  await typeText("途方に暮れているとどこかサヤに似た女性が話しかけてきた。");

  showCharacter("saya_sister.png");
  await typeText("先程サヤの名前を看護師さんに伝えてましたが、もしかしてサヤの友人ですか？");

  clearChoices();
  await new Promise((resolve) => {
    addChoice("ゲームのことを説明する", resolve);
  });

  await typeText("なるほど。サヤがパソコンでそのゲームを作ってたんですね。");

  clearChoices();
  await new Promise((resolve) => {
    addChoice("サヤさんは？", resolve);
  });

  await typeText("彼女は今眠っています。もう1ヶ月になりますかね。");
  await typeText("でも、時々声をかけてあげると指を動かしたり、ちょっとした反応はあるんです。");
  await typeText("先生曰くオーロラ姫症候群は、外部的な刺激によって回復することがあるみたいなんですが。");
  await typeText("よければサヤに声をかけてみてくれませんか？");

  clearChoices();
  await new Promise((resolve) => {
    addChoice("わかりました", resolve);
  });

  hideCharacter();
  await fadeBackground("hospital_room.png");

  await typeText("目を覚さないことを除けばサヤはあのゲームの見た目のままだった。忠実に自分を再現したのに感心した。");
  await typeText("さて、なんて声をかけようか。");

  const input = await showInputOverlay();
  const normalized = normalizeText(input);

  if (normalized === "さやはここにいる") {
    await routeB();
  } else {
    await routeA(input);
  }
}

function normalizeText(text) {
  return String(text)
    .trim()
    .replace(/\s+/g, "")
    .replace(/[ァ-ヶ]/g, (match) =>
      String.fromCharCode(match.charCodeAt(0) - 0x60)
    );
}

async function routeA(inputText) {
  await typeText(inputText);
  await typeText("サヤの指がかすかに動いた。しかし、それ以外の反応はなく、寝息をたてたままだ。");

  setBlackBackground();
  await wait(500);

  await typeText("その後も何度か思いつく言葉をかけてみたが、反応はなかった。");

  await fadeBackground("hospital_corridor.png");
  showCharacter("saya_sister.png");

  await typeText("そんなに暗い顔しないで。会いに来てくれただけでもあの子は嬉しいよ。");

  clearChoices();
  await new Promise((resolve) => {
    addChoice("ありがとうございます・・・", resolve);
  });

  await typeText("ときどき来てあの子にまた話しかけてあげて！お願いばかりでごめんね。");

  clearChoices();
  await new Promise((resolve) => {
    addChoice("はい！", resolve);
  });

  hideCharacter();
  setBlackBackground();
  await wait(400);

  await typeText("彼女を目覚めせるメッセージはなんだったのだろうか。私には、はなから無理なことだったのだろうか。");

  showEnding(
    "エンディングA  完",
    "サヤとの会話の中からサヤの願いを探してみよう。"
  );
}

async function routeB() {
  await typeText("さやはここにいる");

  await fadeBackground("saya_openeyes.png");
  await typeText("ゲーム完全攻略おめでとう！");

  clearChoices();
  await new Promise((resolve) => {
    addChoice("君のゲーム楽しかったよ！", resolve);
  });

  await typeText("まさに命懸けのゲームだったからね！めでたしめでたし！");

  setBlackBackground();
  await wait(500);

  await typeText("その後主治医来て慌ただしくなったので、本当の連絡先を交換し、病院を後にした。");

  showEnding(
    "エンディングB  完",
    "LINEで「後日談」とメッセージを送ってみてください。"
  );
}

commonRoute();
