document.addEventListener("DOMContentLoaded", () => {
  const translateToggle = document.getElementById("translateToggle");
  const translateService = document.getElementById("translateService");

  // read state from storage
  chrome.storage.sync.get(
    ["translationEnabled", "translateService", "apiConfig"],
    (data) => {
      translateToggle.checked = data.translationEnabled || false;
      translateService.value = data.translateService || "baidu";
    }
  );

  // save translateToggle state
  translateToggle.addEventListener("change", () => {
    chrome.storage.sync.set({ translationEnabled: translateToggle.checked });
  });

  // Open settings page
  settingsBtn.addEventListener("click", () => {
    chrome.runtime.openOptionsPage();
  });
});
