document.addEventListener("DOMContentLoaded", () => {
  const mainPage = document.getElementById("mainPage");
  const visitorCounter = document.getElementById("visitorCounter");
  const updateButton = document.getElementById("updateButton");
  const effectLayer = document.getElementById("effectLayer");
  const effectContent = document.getElementById("effectContent");
  const girlStage = document.getElementById("girlStage");
  const sayaImage = document.getElementById("sayaImage");
  const dialogWindow = document.getElementById("dialogWindow");
  const dialogText = document.getElementById("dialogText");
  const dialogHint = document.getElementById("dialogHint");

  if (
    !mainPage ||
    !visitorCounter ||
    !updateButton ||
    !effectLayer ||
    !effectContent ||
    !girlStage ||
    !sayaImage ||
    !dialogWindow ||
    !dialogText ||
    !dialogHint
  ) {
    console.error("必要なHTML要素が見つかりません。");
    return;
  }

  const counterDigits = visitorCounter.querySelectorAll("span");
  let hasStarted = false;
  let activeTapHandler = null;

  function setCounter(value) {
    const padded = String(value).padStart(counterDigits.length, "0");
    const chars = padded.split("");
    counterDigits.forEach((digitEl, index) => {
      digitEl.textContent = chars[index];
    });
    visitorCounter.setAttribute("aria-label", `訪問者数 ${value}`);
  }

  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function clearEffectContent() {
    effectContent.innerHTML = "";
    effectLayer.classList.add("hidden");
    girlStage.classList.add("hidden");
    dialogWindow.classList.add("hidden");
    dialogHint.classList.add("hidden");
    dialogText.textContent = "";
  }

  function showEffectLayer() {
    effectLayer.classList.remove("hidden");
  }

  function removeTapHandler() {
    if (activeTapHandler) {
      effectLayer.removeEventListener("click", activeTapHandler);
      activeTapHandler = null;
    }
  }

  function createStaticOverlay() {
    let overlay = document.querySelector(".static-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = "static-overlay";
      document.body.appendChild(overlay);
    }
    return overlay;
  }

  function showWordArtPopup() {
    return new Promise((resolve) => {
      showEffectLayer();
      effectContent.innerHTML = `
        <div class="wordart-popup">
          <p class="wordart-title">おめでとうございます！</p>
          <p class="wordart-subtitle">100人目の訪問者です。</p>
        </div>
      `;

      removeTapHandler();
      activeTapHandler = () => {
        removeTapHandler();
        resolve();
      };
      effectLayer.addEventListener("click", activeTapHandler);
    });
  }

  function showSystemPopup(message, buttons) {
    return new Promise((resolve) => {
      showEffectLayer();

      const buttonsHtml = buttons
        .map(
          (label, index) =>
            `<button type="button" class="system-popup-button" data-index="${index}">${label}</button>`
        )
        .join("");

      effectContent.innerHTML = `
        <div class="system-popup">
          <div class="system-popup-header">System</div>
          <div class="system-popup-body">
            <p class="system-popup-message">${message}</p>
            <div class="system-popup-buttons">${buttonsHtml}</div>
          </div>
        </div>
      `;

      const popupButtons = effectContent.querySelectorAll(".system-popup-button");
      popupButtons.forEach((button) => {
        button.addEventListener("click", () => resolve());
      });
    });
  }

  function showProgressPopup(message, duration, stopAt = 100) {
    return new Promise((resolve) => {
      showEffectLayer();

      effectContent.innerHTML = `
        <div class="progress-popup">
          <div class="progress-popup-header">System</div>
          <div class="progress-popup-body">
            <p class="progress-popup-message">${message}</p>
            <div class="progress-bar-track">
              <div class="progress-bar-fill" id="progressBarFill"></div>
            </div>
            <div class="progress-percent" id="progressPercent">0%</div>
          </div>
        </div>
      `;

      const fill = document.getElementById("progressBarFill");
      const percent = document.getElementById("progressPercent");
      const startTime = performance.now();

      function animate(now) {
        const elapsed = now - startTime;
        const rawProgress = Math.min(elapsed / duration, 1);
        const currentPercent = Math.floor(rawProgress * 100);

        const displayPercent = Math.min(currentPercent, stopAt);
        fill.style.width = `${displayPercent}%`;
        percent.textContent = `${displayPercent}%`;

        if (displayPercent >= stopAt) {
          resolve();
          return;
        }

        requestAnimationFrame(animate);
      }

      requestAnimationFrame(animate);
    });
  }

  function typeText(message) {
    return new Promise((resolve) => {
      dialogWindow.classList.remove("hidden");
      dialogHint.classList.add("hidden");
      dialogText.textContent = "";

      let index = 0;
      const speed = 38;

      function typeNext() {
        if (index < message.length) {
          dialogText.textContent += message[index];
          index += 1;
          setTimeout(typeNext, speed);
        } else {
          dialogHint.classList.remove("hidden");
          removeTapHandler();
          activeTapHandler = () => {
            removeTapHandler();
            dialogHint.classList.add("hidden");
            resolve();
          };
          effectLayer.addEventListener("click", activeTapHandler);
        }
      }

      typeNext();
    });
  }

  function showPlayerPopup(message) {
    return new Promise((resolve) => {
      effectContent.innerHTML = `
        <div class="player-popup">
          <div class="player-popup-header">Player</div>
          <div class="player-popup-body">
            <p class="player-popup-message">${message}</p>
          </div>
        </div>
      `;

      removeTapHandler();
      activeTapHandler = () => {
        removeTapHandler();
        resolve();
      };
      effectLayer.addEventListener("click", activeTapHandler);
    });
  }

  async function runSoftStatic(duration = 3000) {
    const overlay = createStaticOverlay();
    overlay.classList.add("visible");
    mainPage.classList.add("glitch-soft");
    await wait(duration);
    mainPage.classList.remove("glitch-soft");
    overlay.classList.remove("visible");
  }

  async function runHardStatic(duration = 3000) {
    const overlay = createStaticOverlay();
    overlay.classList.add("visible");
    mainPage.classList.add("glitch-hard");
    await wait(duration);
    mainPage.classList.remove("glitch-hard");
    overlay.classList.remove("visible");
  }

  async function showGirlStage() {
    showEffectLayer();
    effectContent.innerHTML = "";
    girlStage.classList.remove("hidden");
    await wait(50);
    sayaImage.classList.add("visible");
    dialogWindow.classList.remove("hidden");
  }

  function showLinePopup() {
    return new Promise((resolve) => {
      showEffectLayer();
      girlStage.classList.add("hidden");
      sayaImage.classList.remove("visible");
      dialogWindow.classList.add("hidden");
      effectContent.innerHTML = `
        <div class="line-popup">
          <div class="line-popup-header">Link</div>
          <div class="line-popup-body">
            <p class="line-popup-message">LINEの友だちになる</p>
            <div class="line-popup-buttons">
              <button type="button" class="line-popup-button" id="lineGoButton">はい</button>
            </div>
          </div>
        </div>
      `;

      const lineGoButton = document.getElementById("lineGoButton");
      lineGoButton.addEventListener("click", () => {
        window.open("https://example.com", "_blank");
        resolve();
      });
    });
  }

  async function startSequence() {
    if (hasStarted) return;
    hasStarted = true;
    updateButton.disabled = true;

    await wait(300);
    setCounter(100);
    visitorCounter.classList.add("is-100");

    await wait(250);
    await showWordArtPopup();

    effectContent.innerHTML = "";
    await showSystemPopup("生体転移プログラムを実行しますか？", ["はい", "YES"]);

    effectContent.innerHTML = "";
    await showProgressPopup("生体データを読み込み中", 3000, 100);

    effectContent.innerHTML = "";
    await showProgressPopup("対象の精神を転移中", 8000, 95);

    await runSoftStatic(1200);
    await showGirlStage();

    await typeText("ふー危なかった！あと少しであなたも電子の海に取り込まれるところだったわ！");
    effectContent.innerHTML = "";
    await showPlayerPopup("電子の海？");

    effectContent.innerHTML = "";
    await typeText("あーいきなり言われてもわからないわよね。信じられないと思うけど、このサイトはあなたの体から精神を取り込んで、ネットの世界の住人にしちゃうの。");

    effectContent.innerHTML = "";
    await typeText("精神が抜き取られた体はおそらくだけど昏睡状態になってしまう。");

    effectContent.innerHTML = "";
    await showPlayerPopup("そんなバカな？");

    effectContent.innerHTML = "";
    await typeText("まぁーそうよね。そんな話わたしもいきなり言われたら信じないけど、実際わたしが精神を奪われてしまったから。");

    effectContent.innerHTML = "";
    await showPlayerPopup("え！？");

    effectContent.innerHTML = "";
    await typeText("わたしもあなたのようにあのサイトでキリ番の訪問者だったわ。おめでとうって言われてポチポチしてたらいつの間にか電子の世界に取り込まれたってわけ。");

    effectContent.innerHTML = "";
    await typeText("ちゃんとメッセージは読むべきって勉強にはなったわ。");

    await runSoftStatic(3000);

    effectContent.innerHTML = "";
    await typeText("チッ！管理者に見つかったか！？ごめん！ここからはLINEで会話しましょう。");

    await runHardStatic(3000);

    girlStage.classList.add("hidden");
    sayaImage.classList.remove("visible");
    dialogWindow.classList.add("hidden");
    effectContent.innerHTML = "";
    await showLinePopup();
  }

  updateButton.addEventListener("click", startSequence);
});
