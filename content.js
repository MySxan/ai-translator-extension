// listener for mouseup event to capture selected text
document.addEventListener('mouseup', async (e) => {
  const selectedText = window.getSelection().toString().trim();
  if (selectedText.length > 2) { 
    chrome.runtime.sendMessage({
      action: "translate",
      text: selectedText,
      lang: "zh" // target language, can be dynamic
    });
  }
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "translation-result") {
    showTranslationPopup(msg.text, msg.translation);
  }
});

function showTranslationPopup(original, translation) {
  const popup = document.createElement('div');
  popup.style = "position:fixed; top:10px; right:10px; background:white; padding:10px; z-index:9999";
  popup.innerHTML = `<strong>翻译：</strong>${translation}`;
  document.body.appendChild(popup);
  setTimeout(() => popup.remove(), 3000);
}