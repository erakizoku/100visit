document.addEventListener("DOMContentLoaded", () => {
  /*
    各設問の正解を入れてください
    ひらがな想定
  */
  const answers = [
    "こたえ1",
    "こたえ2",
    "こたえ3",
    "こたえ4"
  ];

  const programBoxes = document.querySelectorAll(".program-box");
  const profileImage = document.querySelector(".profile-image");

  if (!programBoxes.length) {
    console.error("program-box が見つかりません。HTMLの class を確認してください。");
    return;
  }

  injectPopupStyles();

  const solvedState = new Array(programBoxes.length).fill(false);

  updateSayaColor();

  programBoxes.forEach((box, index) => {
    const input = box.querySelector("input");
    const button = box.querySelector("button");
    const title = box.querySelector(".program-title");

    if (!input || !button || !title) {
      console.warn(`program-box ${index + 1} に必要な要素が見つかりません。`);
      return;
    }

    button.addEventListener("click", async () => {
      if (solvedState[index]) {
        return;
      }

      const userInput = normalizeAnswer(input.value);
      const correctAnswer = normalizeAnswer(answers[index] || "");
      const programNumber = index + 1;

      if (!userInput) {
        await showMessagePopup("入力してください");
        return;
      }

      button.disabled = true;
      input.disabled = true;

      const isCorrect = userInput === correctAnswer;

      try {
        await runProgramSequence(programNumber, isCorrect);

        if (isCorrect) {
          solvedState[index] = true;
          markProgramSolved(box, title, input, button, programNumber);
          updateSayaColor();

          const allSolved = solvedState.every(Boolean);
          if (allSolved) {
            await runEndingSequence(answers[3] || "");
          }
        } else {
          button.disabled = false;
          input.disabled = false;
        }
      } catch (error) {
        console.error(error);
        alert("エラーが発生しました。console を確認してください。");
        button.disabled = false;
        input.disabled = false;
      }
    });

    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        button.click();
      }
    });
  });

  function normalizeAnswer(text) {
    return String(text)
      .trim()
      .replace(/\s+/g, "")
      .replace(/[ァ-ヶ]/g, (match) =>
        String.fromCharCode(match.charCodeAt(0) - 0x60)
      );
  }

  function getSolvedCount() {
    return solvedState.filter(Boolean).length;
  }

  function updateSayaColor() {
    if (!profileImage) return;

    const solvedCount = getSolvedCount();

    // 0問=100%, 1問=75%, 2問=50%, 3問=25%, 4問=0%
    const grayscaleMap = [100, 75, 50, 25, 0];
    const gray = grayscaleMap[solvedCount] ?? 100;

    profileImage.style.filter = `grayscale(${gray}%)`;
    profileImage.style.transition = "filter 0.8s ease";
  }

  function markProgramSolved(box, title, input, button, programNumber) {
    title.textContent = `解放プログラム ${programNumber}（完了）`;
    box.classList.add("program-solved");

    input.disabled = true;
    button.disabled = true;
    input.classList.add("is-solved");
    button.classList.add("is-solved");

    button.textContent = "完了";
  }

  function injectPopupStyles() {
    const style = document.createElement("style");
    style.textContent = `
      .program-overlay {
        position: fixed;
        inset: 0;
        z-index: 99999;
        background: rgba(0, 0, 0, 0.55);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
      }

      .program-popup {
        width: 100%;
        max-width: 320px;
        border: 1px solid #8f8f8f;
        background: #f3f3f3;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.28);
        border-radius: 4px;
        overflow: hidden;
        font-family: "メイリオ", Meiryo, sans-serif;
      }

      .program-popup-header {
        padding: 8px 12px;
        background: linear-gradient(to bottom, #e9e9e9, #d9d9d9);
        border-bottom: 1px solid #b8b8b8;
        font-size: 14px;
        color: #222;
      }

      .program-popup-body {
        padding: 18px 16px 16px;
        background: #f9f9f9;
      }

      .program-popup-message {
        margin: 0 0 16px;
        font-size: 16px;
        color: #222;
        line-height: 1.7;
        text-align: left;
        white-space: pre-wrap;
      }

      .program-progress-track {
        width: 100%;
        height: 18px;
        border: 1px solid #999;
        background: #ffffff;
        overflow: hidden;
      }

      .program-progress-fill {
        width: 0%;
        height: 100%;
        background: linear-gradient(to right, #66a3ff, #2d69d7);
      }

      .program-progress-percent {
        margin-top: 10px;
        text-align: right;
        font-size: 14px;
        color: #222;
      }

      .program-message-button-row {
        display: flex;
        justify-content: center;
        margin-top: 18px;
      }

      .program-message-button {
        min-width: 96px;
        padding: 8px 16px;
        border: 1px solid #888;
        background: #ffffff;
        color: #222;
        border-radius: 3px;
        cursor: pointer;
        font: inherit;
      }

      .program-message-button:hover {
        background: #efefef;
      }

      .program-solved {
        background: rgba(255, 252, 245, 0.85) !important;
        border-color: #bcae97 !important;
      }

      .program-solved .program-title {
        background: #e7f0da !important;
      }

      .is-solved {
        opacity: 0.9;
      }
    `;
    document.head.appendChild(style);
  }

  function createOverlay() {
    const overlay = document.createElement("div");
    overlay.className = "program-overlay";
    document.body.appendChild(overlay);
    return overlay;
  }

  function showMessagePopup(message, buttonLabel = "OK") {
    return new Promise((resolve) => {
      const overlay = createOverlay();

      overlay.innerHTML = `
        <div class="program-popup">
          <div class="program-popup-header">System</div>
          <div class="program-popup-body">
            <p class="program-popup-message">${escapeHtml(message)}</p>
            <div class="program-message-button-row">
              <button type="button" class="program-message-button">${escapeHtml(buttonLabel)}</button>
            </div>
          </div>
        </div>
      `;

      const button = overlay.querySelector(".program-message-button");
      button.addEventListener(
        "click",
        () => {
          overlay.remove();
          resolve();
        },
        { once: true }
      );
    });
  }

  function runProgressPopup(programNumber, isCorrect) {
    return new Promise((resolve) => {
      const overlay = createOverlay();

      overlay.innerHTML = `
        <div class="program-popup">
          <div class="program-popup-header">System</div>
          <div class="program-popup-body">
            <p class="program-popup-message">解放プログラム ${programNumber} を実行中</p>
            <div class="program-progress-track">
              <div class="program-progress-fill" id="programProgressFill"></div>
            </div>
            <div class="program-progress-percent" id="programProgressPercent">0%</div>
          </div>
        </div>
      `;

      const fill = overlay.querySelector("#programProgressFill");
      const percent = overlay.querySelector("#programProgressPercent");

      const targetPercent = isCorrect ? 100 : 50;
      const duration = isCorrect ? 900 : 600;
      const startTime = performance.now();

      function animate(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const currentPercent = Math.floor(progress * targetPercent);

        fill.style.width = `${currentPercent}%`;
        percent.textContent = `${currentPercent}%`;

        if (currentPercent >= targetPercent) {
          setTimeout(() => {
            overlay.remove();
            resolve();
          }, 220);
          return;
        }

        requestAnimationFrame(animate);
      }

      requestAnimationFrame(animate);
    });
  }

  async function runProgramSequence(programNumber, isCorrect) {
    await runProgressPopup(programNumber, isCorrect);

    if (isCorrect) {
      await showMessagePopup("実行が完了しました");
    } else {
      await showMessagePopup("認証が失敗しました");
    }
  }

  async function runEndingSequence(program4Answer) {
    await showMessagePopup("全ての解放プログラムが完了しました");

    await showMessagePopup("対象の接続制限を解除しています");

    await runFinalProgressPopup();

    await showMessagePopup(
      `Saya の解放が完了しました。\n解放プログラム4の答えをLINEで送ってください。`
    );
  }

  function runFinalProgressPopup() {
    return new Promise((resolve) => {
      const overlay = createOverlay();

      overlay.innerHTML = `
        <div class="program-popup">
          <div class="program-popup-header">System</div>
          <div class="program-popup-body">
            <p class="program-popup-message">最終解放シーケンスを実行中</p>
            <div class="program-progress-track">
              <div class="program-progress-fill" id="finalProgressFill"></div>
            </div>
            <div class="program-progress-percent" id="finalProgressPercent">0%</div>
          </div>
        </div>
      `;

      const fill = overlay.querySelector("#finalProgressFill");
      const percent = overlay.querySelector("#finalProgressPercent");
      const duration = 1800;
      const startTime = performance.now();

      function animate(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const currentPercent = Math.floor(progress * 100);

        fill.style.width = `${currentPercent}%`;
        percent.textContent = `${currentPercent}%`;

        if (currentPercent >= 100) {
          setTimeout(() => {
            overlay.remove();
            resolve();
          }, 250);
          return;
        }

        requestAnimationFrame(animate);
      }

      requestAnimationFrame(animate);
    });
  }

  function escapeHtml(text) {
    return String(text)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }
});