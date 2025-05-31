async function translateText(text) {
  try {
    // Get API key and URL from storage
    const { translateService, apiConfig } = await new Promise((resolve) => {
      chrome.storage.sync.get(["translateService", "apiConfig"], resolve);
    });

    if (!translateService || !apiConfig) {
      throw new Error("翻译服务配置缺失");
    }

    // Check if the selected service is supported
    const serviceConfig = apiConfig[translateService] || {};
    if (!serviceConfig.apiKey || !serviceConfig.apiUrl) {
      throw new Error(`${translateService} 服务配置不完整`);
    }

    switch (translateService) {
      case "baidu":
        return await translateWithBaidu(text, serviceConfig);
      case "google":
        return await translateWithGoogle(text, serviceConfig);
      case "deepl":
        return await translateWithDeepL(text, serviceConfig);
      default:
        throw new Error(`不支持的翻译服务: ${translateService}`);
    }
  } catch (error) {
    console.error("翻译请求失败: ", error);
    throw new Error("翻译请求失败: " + error.message);
  }
}

async function translateWithBaidu(text, config) {
  const appid = config.apiKey;
  const key = config.apiUrl;
  const salt = Date.now();
  const query = text;

  // Generate the sign
  const sign = appid + query + salt + key;

  // Calculate SHA-256 hash of the sign
  const crypto = self.crypto || crypto;
  if (!crypto || !crypto.subtle) {
    throw new Error("当前环境不支持加密API");
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
    throw new Error("HTTP请求失败: " + response.status);
  }
  const data = await response.json();

  if (data.trans_result && data.trans_result[0]) {
    return data.trans_result[0].dst;
  } else {
    console.error("翻译失败: ", data);
    throw new Error("翻译失败: " + (data.error_msg || "未知错误"));
  }
}

async function translateWithGoogle(text, config) {
  throw new Error("谷歌翻译暂未实现");
}

async function translateWithDeepL(text, config) {
  throw new Error("DeepL翻译暂未实现");
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
