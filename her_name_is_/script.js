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

  const counterDigits = visitorCounter.querySelectorAll("span");
  let hasStarted = false;
  let activeTapHandler = null;

  function setCounter(num) {
    const padded = String(num).padStart(4, "0").split("");
    counterDigits.forEach((el, i) => {
      el.textContent = padded[i];
    });
  }

  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function ensureBreakArtifacts() {
    let overlay = document.querySelector(".browser-break-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = "browser-break-overlay";
      document.body.appendChild(overlay);
    }

    let stripe = document.querySelector(".error-stripe");
    if (!stripe) {
      stripe = document.createElement("div");
      stripe.className = "error-stripe";
      document.body.appendChild(stripe);
    }

    let flash = document.querySelector(".flash-white");
    if (!flash) {
      flash = document.createElement("div");
      flash.className = "flash-white";
      document.body.appendChild(flash);
    }

    return { overlay, stripe, flash };
  }

  function showEffectLayer() {
    effectLayer.classList.remove("hidden");
  }

  function hideEffectLayer() {
    effectLayer.classList.add("hidden");
  }

  function clearEffectContent() {
    effectContent.innerHTML = "";
  }

  function removeTapHandler() {
    if (activeTapHandler) {
      effectLayer.removeEventListener("click", activeTapHandler);
      activeTapHandler = null;
    }
  }

  function showWordArt() {
    return new Promise((resolve) => {
      showEffectLayer();
      clearEffectContent();

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

  function systemPopup(message, buttons) {
    return new Promise((resolve) => {
      showEffectLayer();
      clearEffectContent();

      effectContent.innerHTML = `
        <div class="system-popup">
          <div class="system-popup-header">System</div>
          <div class="system-popup-body">
            <p class="system-popup-message">${message}</p>
            <div class="system-popup-buttons">
              ${buttons
                .map(
                  (label) =>
                    `<button type="button" class="system-popup-button">${label}</button>`
                )
                .join("")}
            </div>
          </div>
        </div>
      `;

      document.querySelectorAll(".system-popup-button").forEach((btn) => {
        btn.addEventListener("click", () => resolve(), { once: true });
      });
    });
  }

  function progressPopup(message, duration, stopAt = 100) {
    return new Promise((resolve) => {
      showEffectLayer();
      clearEffectContent();

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
      const start = performance.now();

      function frame(now) {
        const progress = (now - start) / duration;
        const rawPercent = Math.floor(Math.min(progress, 1) * 100);
        const displayPercent = Math.min(rawPercent, stopAt);

        fill.style.width = `${displayPercent}%`;
        percent.textContent = `${displayPercent}%`;

        if (displayPercent >= stopAt) {
          resolve();
          return;
        }

        requestAnimationFrame(frame);
      }

      requestAnimationFrame(frame);
    });
  }

  function typeText(text) {
    return new Promise((resolve) => {
      showEffectLayer();
      clearEffectContent();
      girlStage.classList.remove("hidden");
      dialogWindow.classList.remove("hidden");
      dialogText.textContent = "";

      let i = 0;

      function typeNext() {
        if (i < text.length) {
          dialogText.textContent += text[i];
          i += 1;
          setTimeout(typeNext, 35);
        } else {
          removeTapHandler();
          activeTapHandler = () => {
            removeTapHandler();
            resolve();
          };
          effectLayer.addEventListener("click", activeTapHandler);
        }
      }

      typeNext();
    });
  }

  function playerPopup(text) {
    return new Promise((resolve) => {
      const overlay = document.createElement("div");
      overlay.className = "player-overlay";

      overlay.innerHTML = `
        <div class="player-mask"></div>
        <div class="player-popup">
          <p class="player-popup-message">${text}</p>
        </div>
      `;

      document.body.appendChild(overlay);

      overlay.addEventListener(
        "click",
        () => {
          overlay.remove();
          resolve();
        },
        { once: true }
      );
    });
  }

  async function glitchSoft(duration = 3000) {
    mainPage.classList.add("glitch-soft");
    await wait(duration);
    mainPage.classList.remove("glitch-soft");
  }

  async function glitchHard(duration = 3000) {
    mainPage.classList.add("glitch-hard");
    await wait(duration);
    mainPage.classList.remove("glitch-hard");
  }

  async function browserBreak(duration = 1200) {
    const { overlay, stripe, flash } = ensureBreakArtifacts();

    overlay.classList.add("active");
    stripe.classList.add("visible");
    flash.classList.add("visible");
    mainPage.classList.add("breaking");

    stripe.style.top = `${20 + Math.random() * 60}%`;

    await wait(120);
    flash.classList.remove("visible");

    let moves = 0;
    const moveTimer = setInterval(() => {
      stripe.style.top = `${10 + Math.random() * 75}%`;
      moves += 1;
      if (moves > 10) {
        clearInterval(moveTimer);
      }
    }, 90);

    await wait(duration);

    clearInterval(moveTimer);
    overlay.classList.remove("active");
    stripe.classList.remove("visible");
    mainPage.classList.remove("breaking");
  }

  async function showGirl() {
    showEffectLayer();
    clearEffectContent();
    girlStage.classList.remove("hidden");
    dialogWindow.classList.remove("hidden");

    await wait(100);
    sayaImage.classList.add("visible");
  }

  function hideGirlAndDialog() {
    sayaImage.classList.remove("visible");
    dialogWindow.classList.add("hidden");
    girlStage.classList.add("hidden");
    dialogText.textContent = "";
  }

  function showLinePopup() {
    showEffectLayer();
    clearEffectContent();

    effectContent.innerHTML = `
      <div class="line-popup">
        <div class="line-popup-header">Link</div>
        <div class="line-popup-body">
          <p class="line-popup-message">LINEの友だちになる</p>
          <div class="line-popup-buttons">
            <button type="button" class="line-popup-button" id="lineBtn">はい</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById("lineBtn").addEventListener("click", () => {
      window.open("https://lin.ee/OAd6OLo", "_blank");
    });
  }

  async function start() {
    if (hasStarted) return;
    hasStarted = true;
    updateButton.disabled = true;

    await wait(300);
    setCounter(100);

    await showWordArt();

    await systemPopup("生体転移プログラムを実行しますか？", ["はい", "YES"]);
    await progressPopup("生体データを読み込み中", 3000, 100);
    await progressPopup("対象の精神を転移中", 8000, 95);

    await browserBreak(900);
    await glitchSoft(800);
    await showGirl();

    await typeText("ふー危なかった！あと少しであなたも電子の海に取り込まれるところだったわ！");
    await playerPopup("電子の海？");

    await typeText("あーいきなり言われてもわからないわよね。信じられないと思うけど、このサイトはあなたの体から精神を取り込んで、ネットの世界の住人にしちゃうの。");

    await typeText("精神が抜き取られた体はおそらくだけど昏睡状態になってしまう。");

    await playerPopup("そんなバカな？");

    await typeText("まぁーそうよね。そんな話わたしもいきなり言われたら信じないけど、実際わたしが精神を奪われてしまったから。");

    await playerPopup("え！？");

    await typeText("わたしもあなたのようにあのサイトでキリ番の訪問者だったわ。おめでとうって言われてポチポチしてたらいつの間にか電子の世界に取り込まれたってわけ。");

    await typeText("ちゃんとメッセージは読むべきって勉強にはなったわ。");

    await glitchSoft(3000);

    await typeText("チッ！管理者に見つかったか！？ごめん！ここからはLINEで会話しましょう。");

    hideGirlAndDialog();
    await browserBreak(1200);
    await glitchHard(3000);

    showLinePopup();
  }

  updateButton.addEventListener("click", start);
});
