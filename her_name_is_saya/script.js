document.addEventListener("DOMContentLoaded", () => {
  const answers = [
    "こたえ1",
    "こたえ2",
    "こたえ3",
    "こたえ4"
  ];

  const programBoxes = document.querySelectorAll(".program-box");

  console.log("programBoxes:", programBoxes.length);

  if (!programBoxes.length) {
    console.error("program-box が見つかりません。HTMLの class を確認してください。");
    return;
  }

  injectPopupStyles();

  programBoxes.forEach((box, index) => {
    const input = box.querySelector("input");
    const button = box.querySelector("button");

    console.log(`program ${index + 1}`, { input, button });

    if (!input || !button) {
      console.warn(`program-box ${index + 1} に input または button が見つかりません。`);
      return;
    }

    button.addEventListener("click", async () => {
      console.log(`button clicked: ${index + 1}`);

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
      } catch (error) {
        console.error(error);
        alert("エラーが発生しました。console を確認してください。");
      } finally {
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
    `;
    document.head.appendChild(style);
  }

  function createOverlay() {
    const overlay = document.createElement("div");
    overlay.className = "program-overlay";
    document.body.appendChild(overlay);
    return overlay;
  }

  function showMessagePopup(message) {
    return new Promise((resolve) => {
      const overlay = createOverlay();

      overlay.innerHTML = `
        <div class="program-popup">
          <div class="program-popup-header">System</div>
          <div class="program-popup-body">
            <p class="program-popup-message">${escapeHtml(message)}</p>
            <div class="program-message-button-row">
              <button type="button" class="program-message-button">OK</button>
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

  function escapeHtml(text) {
    return String(text)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }
});