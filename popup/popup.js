document.addEventListener("DOMContentLoaded", () => {
  const translateToggle = document.getElementById("translateToggle");
  const apiKeyInput = document.getElementById("apiKey");
  const apiUrlInput = document.getElementById("apiUrl");
  const saveButton = document.getElementById("saveSettings");
  const resetButton = document.getElementById("resetSettings");

  // Initialize save button state
  updateSaveButtonState();

  // read state from storage
  chrome.storage.sync.get(
    ["translationEnabled", "apiKey", "apiUrl"],
    (data) => {
      translateToggle.checked = data.translationEnabled || false;
      apiKeyInput.value = data.apiKey || "";
      apiUrlInput.value = data.apiUrl || "";
      updateResetButtonVisibility(data.apiKey, data.apiUrl);
      updateSaveButtonState();
    }
  );

  // save translateToggle state
  translateToggle.addEventListener("change", () => {
    chrome.storage.sync.set({ translationEnabled: translateToggle.checked });
  });

  // Update save button state when API key input changes
  apiKeyInput.addEventListener("input", updateSaveButtonState);
  apiUrlInput.addEventListener("input", updateSaveButtonState);

  // Save settings when save button is clicked
  saveButton.addEventListener("click", () => {
    const apiKey = apiKeyInput.value.trim();
    const apiUrl = apiUrlInput.value.trim();

    if (apiKey && apiUrl) {
      chrome.storage.sync.set({ apiKey: apiKey, apiUrl: apiUrl }, () => {
        saveButton.textContent = "保存成功！";
      });
    } else {
      saveButton.textContent = "请填写完整信息";
    }
    setTimeout(() => {
      saveButton.textContent = "保存设置";
    }, 1000);
    updateResetButtonVisibility(apiKey, apiUrl);
  });

  // Reset settings when reset button is clicked
  resetButton.addEventListener("click", () => {
    if (confirm("确定要重置所有设置吗？")) {
      chrome.storage.sync.set(
        { translationEnabled: false, apiKey: "", apiUrl: "" },
        () => {
          translateToggle.checked = false;
          apiKeyInput.value = "";
          apiUrlInput.value = "";
          resetButton.style.display = "none";
          saveButton.textContent = "设置已重置";
          setTimeout(() => {
            saveButton.textContent = "保存设置";
          }, 1000);
          updateSaveButtonState();
        }
      );
    }
  });

  // Update reset button visibility based on API key and URL
  function updateResetButtonVisibility(apiKey, apiUrl) {
    if (apiKey || apiUrl) {
      resetButton.style.display = "flex";
    } else {
      resetButton.style.display = "none";
    }
  }

  // Update save button state based on API key and URL inputs
  function updateSaveButtonState() {
    const apiKey = apiKeyInput.value.trim();
    const apiUrl = apiUrlInput.value.trim();

    if (apiKey && apiUrl) {
      saveButton.disabled = false;
      saveButton.classList.remove("disabled");
    } else {
      saveButton.disabled = true;
      saveButton.classList.add("disabled");
    }
  }
});
