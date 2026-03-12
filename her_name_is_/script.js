document.addEventListener("DOMContentLoaded", () => {
  const visitorCounter = document.getElementById("visitorCounter");
  const updateButton = document.getElementById("updateButton");

  if (!visitorCounter || !updateButton) {
    console.error("必要なHTML要素が見つかりません。");
    return;
  }

  const counterDigits = visitorCounter.querySelectorAll("span");
  let hasStarted = false;

  function setCounter(value) {
    const padded = String(value).padStart(counterDigits.length, "0");
    const chars = padded.split("");

    counterDigits.forEach((digitEl, index) => {
      digitEl.textContent = chars[index];
    });

    visitorCounter.setAttribute("aria-label", `訪問者数 ${value}`);
  }

  function createOverlay(extraClass = "") {
    const overlay = document.createElement("div");
    overlay.className = `popup-overlay ${extraClass}`.trim();
    document.body.appendChild(overlay);
    return overlay;
  }

  function wait(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  function showWordArtPopup() {
    return new Promise((resolve) => {
      const overlay = createOverlay("tap-anywhere");

      const popup = document.createElement("div");
      popup.className = "wordart-popup";

      popup.innerHTML = `
        <p class="wordart-title">おめでとうございます！</p>
        <p class="wordart-subtitle">100人目の訪問者です。</p>
      `;

      overlay.appendChild(popup);

      const close = () => {
        overlay.remove();
        resolve();
      };

      overlay.addEventListener("click", close, { once: true });
    });
  }

  function showSystemPopup() {
    return new Promise((resolve) => {
      const overlay = createOverlay();

      const popup = document.createElement("div");
      popup.className = "system-popup";

      popup.innerHTML = `
        <div class="system-popup-header">System</div>
        <div class="system-popup-body">
          <p class="system-popup-message">生体転移プログラムを実行しますか？</p>
          <div class="system-popup-buttons">
            <button type="button" class="system-popup-button" data-next="yes-ja">はい</button>
            <button type="button" class="system-popup-button" data-next="yes-en">YES</button>
          </div>
        </div>
      `;

      overlay.appendChild(popup);

      popup.querySelectorAll(".system-popup-button").forEach((button) => {
        button.addEventListener("click", () => {
          overlay.remove();
          resolve();
        });
      });
    });
  }

  function showProgressPopup() {
    return new Promise((resolve) => {
      const overlay = createOverlay();

      const popup = document.createElement("div");
      popup.className = "progress-popup";

      popup.innerHTML = `
        <div class="progress-popup-header">System</div>
        <div class="progress-popup-body">
          <p class="progress-popup-message">生体データを読み込み中</p>
          <div class="progress-bar-track">
            <div class="progress-bar-fill" id="progressBarFill"></div>
          </div>
          <div class="progress-percent" id="progressPercent">0%</div>
        </div>
      `;

      overlay.appendChild(popup);

      const fill = popup.querySelector("#progressBarFill");
      const percent = popup.querySelector("#progressPercent");

      const duration = 3000; // 3秒
      const startTime = performance.now();

      function animate(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const progressPercent = Math.floor(progress * 100);

        fill.style.width = `${progress * 100}%`;
        percent.textContent = `${progressPercent}%`;

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setTimeout(() => {
            overlay.remove();
            resolve();
          }, 200);
        }
      }

      requestAnimationFrame(animate);
    });
  }

  async function startSequence() {
    if (hasStarted) {
      return;
    }

    hasStarted = true;
    updateButton.disabled = true;

    await wait(300);
    setCounter(100);
    visitorCounter.classList.add("is-100");

    await wait(250);
    await showWordArtPopup();
    await showSystemPopup();
    await showProgressPopup();

    // ここから先は後で追加
    console.log("ここから次の演出を追加できます。");
  }

  updateButton.addEventListener("click", startSequence);
});