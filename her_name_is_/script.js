document.addEventListener("DOMContentLoaded", () => {
  const visitorCounter = document.getElementById("visitorCounter");
  const updateButton = document.getElementById("updateButton");
  const popupOverlay = document.getElementById("popupOverlay");
  const popupBox = document.getElementById("popupBox");
  const popupMessage = document.getElementById("popupMessage");
  const popupCloseButton = document.getElementById("popupCloseButton");

  if (
    !visitorCounter ||
    !updateButton ||
    !popupOverlay ||
    !popupBox ||
    !popupMessage ||
    !popupCloseButton
  ) {
    console.error("必要なHTML要素が見つかりません。id指定を確認してください。");
    return;
  }

  const counterDigits = visitorCounter.querySelectorAll("span");
  let hasReached100 = false;
  let ominousMessageTimer = null;

  /**
   * カウンター表示を更新する
   * 例: 99 -> 0099
   */
  function setCounter(value) {
    const padded = String(value).padStart(counterDigits.length, "0");
    const chars = padded.split("");

    counterDigits.forEach((digitEl, index) => {
      digitEl.textContent = chars[index];
    });

    visitorCounter.setAttribute("aria-label", `訪問者数 ${value}`);
  }

  /**
   * ポップアップを開く
   */
  function openPopup(messageHtml, withGlitch = false) {
    popupMessage.innerHTML = messageHtml;
    popupOverlay.classList.remove("hidden");
    popupOverlay.setAttribute("aria-hidden", "false");

    if (withGlitch) {
      popupBox.classList.add("glitch");
      setTimeout(() => {
        popupBox.classList.remove("glitch");
      }, 500);
    }
  }

  /**
   * ポップアップを閉じる
   */
  function closePopup() {
    popupOverlay.classList.add("hidden");
    popupOverlay.setAttribute("aria-hidden", "true");
  }

  /**
   * 100人目演出開始
   */
  function start100VisitorSequence() {
    if (hasReached100) {
      return;
    }

    hasReached100 = true;
    updateButton.disabled = true;

    // 少し間を置いてから100にする
    setTimeout(() => {
      setCounter(100);
      visitorCounter.classList.add("is-100");

      openPopup("おめでとうございます！<br>あなたは100人目の訪問者です！");

      ominousMessageTimer = setTimeout(() => {
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

  popupCloseButton.addEventListener("click", () => {
    closePopup();
  });

  popupOverlay.addEventListener("click", (event) => {
    if (event.target === popupOverlay) {
      closePopup();
    }
  });

  window.addEventListener("beforeunload", () => {
    if (ominousMessageTimer) {
      clearTimeout(ominousMessageTimer);
    }
  });
});