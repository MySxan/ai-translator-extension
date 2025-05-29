document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("translateToggle");

  // read state from storage
  chrome.storage.sync.get(["translationEnabled"], (data) => {
    toggle.checked = !!data.translationEnabled;
  });

  // save toggle state
  toggle.addEventListener("change", () => {
    chrome.storage.sync.set({ translationEnabled: toggle.checked });
    console.log('翻译开关状态已更新为: ' + this.checked);
  });
});
