document.addEventListener("DOMContentLoaded", () => {
  const counterDisplay = document.querySelector(".counter-display");
  const counterSpans = counterDisplay ? counterDisplay.querySelectorAll("span") : [];
  const updateButton = document.querySelector(".update-button");

  if (!counterDisplay || counterSpans.length === 0 || !updateButton) {
    console.error("必要な要素が見つかりませんでした。HTML構造を確認してください。");
    return;
  }

  let hasReached100 = false;

  // ポップアップをJSで生成
  const popupOverlay = document.createElement("div");
  popupOverlay.className = "js-popup-overlay hidden";

  const popupBox = document.createElement("div");
  popupBox.className = "js-popup-box";

  const popupMessage = document.createElement("p");
  popupMessage.className = "js-popup-message";

  const popupCloseButton = document.createElement("button");
  popupCloseButton.type = "button";
  popupCloseButton.className = "js-popup-close";
  popupCloseButton.textContent = "閉じる";

  popupBox.appendChild(popupMessage);
  popupBox.appendChild(popupCloseButton);
  popupOverlay.appendChild(popupBox);
  document.body.appendChild(popupOverlay);

  // ポップアップ用CSSをJSで注入
  const style = document.createElement("style");
  style.textContent = `
    .hidden {
      display: none !important;
    }

    .js-popup-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.45);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      z-index: 9999;
    }

    .js-popup-box {
      width: 100%;
      max-width: 320px;
      background: #fbf6ee;
      border: 1px solid #a99b84;
      border-radius: 6px;
      padding: 20px 16px 16px;
      text-align: center;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.22);
    }

    .js-popup-box.glitch {
      animation: popupShake 0.25s linear 2;
      border-color: #7d1f1f;
    }

    .js-popup-message {
      margin: 0 0 16px;
      font-size: 1rem;
      line-height: 1.8;
      color: #2f2a24;
    }

    .js-popup-close {
      min-width: 100px;
      padding: 8px 16px;
      border: 1px solid #a99b84;
      background: #f4efe6;
      border-radius: 4px;
      cursor: pointer;
      font: inherit;
      color: #2f2a24;
    }

    .js-popup-close:hover {
      background: #f0e8db;
    }

    .counter-display.is-100 span {
      background: #f7efe8;
      border-color: #9f7b7b;
    }

    @keyframes popupShake {
      0% { transform: translateX(0); }
      25% { transform: translateX(-4px); }
      50% { transform: translateX(4px); }
      75% { transform: translateX(-3px); }
      100% { transform: translateX(0); }
    }
  `;
  document.head.appendChild(style);

  function setCounter(value) {
    const digits = String(value).padStart(counterSpans.length, "0").split("");

    counterSpans.forEach((span, index) => {
      span.textContent = digits[index];
    });

    counterDisplay.setAttribute("aria-label", `訪問者数 ${value}`);
  }

  function openPopup(message, useGlitch = false) {
    popupMessage.innerHTML = message;
    popupOverlay.classList.remove("hidden");

    if (useGlitch) {
      popupBox.classList.add("glitch");
      setTimeout(() => {
        popupBox.classList.remove("glitch");
      }, 600);
    }
  }

  function closePopup() {
    popupOverlay.classList.add("hidden");
  }

  function start100VisitorSequence() {
    if (hasReached100) {
      return;
    }

    hasReached100 = true;
    updateButton.disabled = true;

    setTimeout(() => {
      setCounter(100);
      counterDisplay.classList.add("is-100");

      openPopup("おめでとうございます！<br>あなたは100人目の訪問者です！");

      setTimeout(() => {
        if (!popupOverlay.classList.contains("hidden")) {
          openPopup(
            "……100人目を確認しました。<br>このページから離れないでください。",
            true
          );
        }
      }, 2200);
    }, 500);
  }

  updateButton.addEventListener("click", start100VisitorSequence);

  popupCloseButton.addEventListener("click", closePopup);

  popupOverlay.addEventListener("click", (event) => {
    if (event.target === popupOverlay) {
      closePopup();
    }
  });
});
