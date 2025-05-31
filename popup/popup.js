document.addEventListener("DOMContentLoaded", () => {
  const translateToggle = document.getElementById("translateToggle");
  const translateService = document.getElementById("translateService");
  const apiKeyInput = document.getElementById("apiKey");
  const apiUrlInput = document.getElementById("apiUrl");
  const saveButton = document.getElementById("saveSettings");
  const resetButton = document.getElementById("resetSettings");
  const apiConfigSection = document.getElementById("apiConfigSection");

  // Initialize save button state
  updateSaveButtonState();

  // read state from storage
  chrome.storage.sync.get(
    ["translationEnabled", "translateService", "apiConfig"],
    (data) => {
      translateToggle.checked = data.translationEnabled || false;
      translateService.value = data.translateService || "baidu";

      // Set the API key and URL based on the selected service
      const selectedService = translateService.value;
      const serviceConfig = data.apiConfig?.[translateService.value] || {};
      apiKeyInput.value = serviceConfig.apiKey || "";
      apiUrlInput.value = serviceConfig.apiUrl || "";

      // Update interface
      updateResetButtonVisibility(data.apiKey, data.apiUrl);
      updateSaveButtonState();
      toggleApiConfigSection(selectedService);
    }
  );

  // save translateToggle state
  translateToggle.addEventListener("change", () => {
    chrome.storage.sync.set({ translationEnabled: translateToggle.checked });
  });

  // Toggle API configuration when service changes
  translateService.addEventListener("change", () => {
    const selectedService = translateService.value;

    // load corresponding API config
    chrome.storage.sync.get(["apiConfig"], (data) => {
      const serviceConfig = data.apiConfig?.[selectedService] || {};
      apiKeyInput.value = serviceConfig.apiKey || "";
      apiUrlInput.value = serviceConfig.apiUrl || "";

      // Update interface
      updateResetButtonVisibility(serviceConfig.apiKey, serviceConfig.apiUrl);
      updateSaveButtonState();
      toggleApiConfigSection(selectedService);
    });
  });

  // Update save button state when API key input changes
  apiKeyInput.addEventListener("input", updateSaveButtonState);
  apiUrlInput.addEventListener("input", updateSaveButtonState);

  // Save settings when save button is clicked
  saveButton.addEventListener("click", () => {
    const selectedService = translateService.value;
    const apiKey = apiKeyInput.value.trim();
    const apiUrl = apiUrlInput.value.trim();

    if (apiKey && apiUrl) {
      chrome.storage.sync.get(["apiConfig"], (data) => {
        const apiConfig = data.apiConfig || {};
        apiConfig[selectedService] = { apiKey, apiUrl };

        chrome.storage.sync.set(
          {
            translateService: selectedService,
            apiConfig,
          },
          () => {
            saveButton.textContent = "保存成功！";
          }
        );
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
    if (confirm("确定要重置当前设置吗？")) {
      const selectedService = translateService.value;

      // Reset configuration for the selected service
      chrome.storage.sync.get(["apiConfig"], (data) => {
        const apiConfig = data.apiConfig || {};
        delete apiConfig[selectedService];

        chrome.storage.sync.set(
          {
            apiConfig,
            translateService: "baidu", // reset to default service
            translationEnabled: false,
          },
          () => {
            // reset UI elements
            translateToggle.checked = false;
            translateService.value = "baidu";
            apiKeyInput.value = "";
            apiUrlInput.value = "";
            resetButton.style.display = "none";
            saveButton.textContent = "设置已重置";

            setTimeout(() => {
              saveButton.textContent = "保存设置";
            }, 1000);

            updateSaveButtonState();
            toggleApiConfigSection("baidu");
          }
        );
      });
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

  function toggleApiConfigSection(service) {
    apiConfigSection.style.display = "block";
  }
});
