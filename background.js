async function translateText(text) {
  try {
    const appid = "20240517002053736";
    const key = "osNmfsCZGolmRGh2aksd";
    const salt = Date.now();
    const query = text;

    // Generate the sign
    const sign = appid + query + salt + key;

    // Calculate SHA-256 hash of the sign
    const crypto = self.crypto || crypto;
    if (!crypto || !crypto.subtle) {
      throw new Error("Encoded API is not supported in this environment.");
    }
    const hashBuffer = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(sign)
    );
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // Create the request URL
    const url = `https://fanyi-api.baidu.com/api/trans/vip/translate?q=${encodeURIComponent(
      query
    )}&from=auto&to=zh&appid=${appid}&salt=${salt}&sign=${hashHex}`;

    // Make the HTTP request
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("HTTP request failed：" + response.status);
    }
    const data = await response.json();

    if (data.trans_result && data.trans_result[0]) {
      return data.trans_result[0].dst;
    } else {
      console.error("Translate failed:", data);
      throw new Error(
        "Translate failed: " + (data.error_msg || "Unknown error")
      );
    }
  } catch (error) {
    console.error("Translating request failed:", error);
    throw new Error("Translating request failed: " + error.message);
  }
}

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "translate") {
    translateText(message.text)
      .then((translatedText) => {
        sendResponse({ success: true, text: translatedText });
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });

    return true; //async response
  }
});
