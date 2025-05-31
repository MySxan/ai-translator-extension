let popup = null;
let autoHideTimer = null;

// Listen for mouseup event and show the popup
document.addEventListener("mouseup", async function () {
  const selection = window.getSelection();
  const selectedText = selection.toString().trim();

  if (
    selectedText.length > 2 &&
    selectedText.length <= 300 &&
    selection.rangeCount > 0
  ) {
    const range = selection.getRangeAt(0);
    if (range.getClientRects().length === 0) return;

    try {
      // Get the translationEnabled state from storage
      const { translationEnabled } = await getStorageValue(
        "translationEnabled"
      );

      let content;
      if (translationEnabled) {
        try {
          content = await new Promise((resolve, reject) => {
            chrome.runtime.sendMessage(
              { type: "translate", text: selectedText },
              (response) => {
                if (chrome.runtime.lastError) {
                  reject(chrome.runtime.lastError.message);
                } else if (response.success) {
                  resolve(response.text);
                } else {
                  reject(response.error);
                }
              }
            );
          });
        } catch (error) {
          console.error("翻译失败：", error);
          content = selectedText; 
        }
      } else {
        content = selectedText;
      }

      showPopup(content, range);
    } catch (err) {
      console.error("[Failed] Error when fetch state:", err);
    }
  }
});

// Get value from chrome storage
function getStorageValue(key) {
  return new Promise((resolve) => {
    chrome.storage.sync.get([key], resolve);
  });
}

async function showPopup(content, range) {
  removePopup(); // Clear any existing popup

  // Ensure the range has a valid rectangle
  const rect = range.getClientRects()[0];
  if (!rect) return;

  // Create the popup element
  popup = document.createElement("div");
  popup.id = "selection-popup";
  popup.textContent = `📋 ${content}`;

  // Apply styles
  Object.assign(popup.style, {
    position: "absolute",
    left: `${rect.left + window.scrollX}px`,
    top: `${rect.top + window.scrollY - 40}px`,
    backgroundColor: "#007bff",
    color: "white",
    fontSize: "14px",
    opacity: "0.95",
    maxWidth: "300px",
    wordWrap: "break-word",
    whiteSpace: "normal",
    padding: "6px 12px",
    borderRadius: "6px",
    boxShadow: "0 3px 10px rgba(0,0,0,0.2)",
    zIndex: "99999",
    userSelect: "none",
    cursor: "pointer",
    fontFamily: "Arial, sans-serif",
    transition: "transform 0.2s, opacity 0.2s",
  });

  // Add style change for hover
  popup.addEventListener("mouseenter", () => {
    clearTimeout(autoHideTimer);
    popup.style.transform = "scale(1.05)";
    popup.style.opacity = "0.9";
  });
  popup.addEventListener("mouseleave", () => {
    popup.style.transform = "scale(1)";
    popup.style.opacity = "0.95";
    autoHideTimer = setTimeout(removePopup, 3000);
  });

  // Click event to copy text
  popup.addEventListener("click", async (e) => {
    e.preventDefault(); // Prevent default click behavior
    e.stopPropagation(); // Stop the event from propagating

    try {
      await navigator.clipboard.writeText(content);
      console.log("[Success] Copied:", content);
      popup.textContent = "✅ Copied!";
      clearTimeout(autoHideTimer);
    } catch (err) {
      console.error("[Failed] Clipboard Error:", err);
      popup.textContent = "❌ Copy Failed";
    }

    setTimeout(removePopup, 1000);
  });

  document.body.appendChild(popup);
  autoHideTimer = setTimeout(removePopup, 3000);

  // Adjust popup position
  const boxRect = popup.getBoundingClientRect();
  popup.style.top = `${rect.top + window.scrollY - boxRect.height - 8}px`;
}

function removePopup() {
  if (popup) {
    popup.remove();
    popup = null;
  }
  clearTimeout(autoHideTimer);
}

// Remove the popup when clicking outside
document.addEventListener("click", function (event) {
  if (popup && !popup.contains(event.target)) {
    setTimeout(removePopup, 500);
  }
});
