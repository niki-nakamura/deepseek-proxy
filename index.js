const express = require('express');
const fetch = require('node-fetch'); 
const app = express();
const PORT = process.env.PORT || 3000;

// CORS許可
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "POST, OPTIONS");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

app.post('/proxy/deepseek', async (req, res) => {
  try {
    // フロントから受け取る
    const { promptContent } = req.body;

    // Renderの環境変数からキーを取得
    const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
    if (!DEEPSEEK_API_KEY) {
      return res.status(500).json({
        error: "APIキーが設定されていません。DEEPSEEK_API_KEY を環境変数に設定してください。"
      });
    }

    // --- 新しいエンドポイント & 認証形式 ---
    const url = "https://api.scaleway.ai/af81c82e-508d-4d91-ba6b-5d4a9e1bb8d5/v1/chat/completions";
    const headers = {
      "Content-Type": "application/json",
      // 「Authorization: Bearer ...」 方式に変更
      "Authorization": `Bearer ${DEEPSEEK_API_KEY}`
    };

    // bodyのフォーマットもChat Completionsの仕様に合わせる
    const requestBody = {
      model: "deepseek-r1",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant"
        },
        {
          role: "user",
          content: promptContent
        }
      ],
      max_tokens: 512,
      temperature: 0.6,
      top_p: 0.95,
      presence_penalty: 0,
      stream: false
    };

    // Scalewayへ問い合わせ
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const text = await response.text(); //エラー詳細を取得
      console.error("Scaleway API error:", text);
      return res.status(response.status).json({ error: text });
    }

    // 正常時
    const data = await response.json();
    // data内の構造に合わせて、必要なら整形して返す
    return res.json(data);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.toString() });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server is running on http://localhost:${PORT}`);
});
