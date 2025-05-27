let selectedText = "";
let displayBox = null;
let selectionRange = null;
let autoHideTimer = null;

document.addEventListener("selectionchange", () => {
  clearTimeout(autoHideTimer);

  const selection = window.getSelection();
  const text = selection.toString().trim();

  if (text.length > 2 && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    if (range.getClientRects().length === 0) return;

    selectedText = text;
    selectionRange = range.cloneRange();
    showSelectedText(text, range);
  } else {
    removeSelectedTextDisplay();
  }
});

function showSelectedText(text, range) {
  removeSelectedTextDisplay();

  const rect = range.getClientRects()[0];
  if (!rect) return;

  displayBox = document.createElement("div");
  displayBox.id = "selected-text-display";
  displayBox.textContent = `📋 ${text}`;

  displayBox.dataset.text = text;

  Object.assign(displayBox.style, {
    position: "absolute",
    left: `${rect.left + window.scrollX}px`,
    top: `${rect.top + window.scrollY - 32}px`,
    backgroundColor: "#4a6bff",
    color: "white",
    padding: "6px 12px",
    borderRadius: "6px",
    boxShadow: "0 3px 10px rgba(0,0,0,0.2)",
    zIndex: "99999",
    userSelect: "none",
    cursor: "pointer",
    fontFamily: "Arial, sans-serif",
    transition: "transform 0.2s, opacity 0.2s",
  });

  displayBox.addEventListener("mouseenter", () => {
    clearTimeout(autoHideTimer);
    displayBox.style.transform = "scale(1.05)";
    displayBox.style.opacity = "0.95";
  });

  displayBox.addEventListener("mouseleave", () => {
    displayBox.style.transform = "scale(1)";
    displayBox.style.opacity = "1";
    autoHideTimer = setTimeout(removeSelectedTextDisplay, 3000);
  });

  displayBox.addEventListener("click", async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const copyText = displayBox.dataset.text || "";
    console.log("[点击复制] 复制文本:", copyText);

    if (!copyText) {
      displayBox.textContent = "❌ No text to copy";
      setTimeout(removeSelectedTextDisplay, 1000);
      return;
    }

    try {
      await navigator.clipboard.writeText(copyText);
      displayBox.textContent = "✅ Copied!";
      clearTimeout(autoHideTimer);
    } catch (err) {
      console.error("[复制失败] Clipboard API异常:", err);
      displayBox.textContent = "❌ Copy Failed";
    }

    setTimeout(removeSelectedTextDisplay, 1000);
  });

  document.body.appendChild(displayBox);

  autoHideTimer = setTimeout(removeSelectedTextDisplay, 3000);
}

function removeSelectedTextDisplay() {
  if (displayBox) {
    displayBox.remove();
    displayBox = null;
  }
  selectedText = "";
  selectionRange = null;
  clearTimeout(autoHideTimer);
}
