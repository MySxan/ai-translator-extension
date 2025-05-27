let apiKey = '';
chrome.storage.sync.get('apiKey', (data) => {
  apiKey = data.apiKey || '';
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "translate") {
    translateText(request.text, request.lang)
      .then(translation => sendResponse({ translation }))
      .catch(error => sendResponse({ error: error.message }));
    return true; 
  }
});

async function translateText(text, targetLang) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [{
        role: "user",
        content: `将以下内容翻译为${targetLang}（保持专业语气）：\n\n${text}`
      }],
      temperature: 0.3
    })
  });
  const data = await response.json();
  return data.choices[0].message.content;
}