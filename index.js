// index.js
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// 1) CORSミドルウェアを一番最初に適用
app.use(cors());

// 2) JSONボディをパース
app.use(express.json());

// 3) ルートの定義
app.post('/proxy/deepseek', async (req, res) => {
  try {
    const { promptContent } = req.body;

    // 環境変数からAPIキーを読み取る (RenderのEnvironmentで設定)
    const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
    if (!DEEPSEEK_API_KEY) {
      return res.status(500).json({ error: "APIキーが設定されていません。" });
    }

    // Scaleway新APIのエンドポイント & Bearer認証
    const url = "https://api.scaleway.ai/af81c82e-508d-4d91-ba6b-5d4a9e1bb8d5/v1/chat/completions";
    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${DEEPSEEK_API_KEY}`
    };

    // Chat Completionsのリクエストボディ
    const requestBody = {
      model: "deepseek-r1",
      messages: [
        { role: "system", content: "You are a helpful assistant" },
        { role: "user", content: promptContent }
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
      // APIからエラーが返ればログ出力して返す
      const text = await response.text();
      console.error("Scaleway API error:", text);
      return res.status(response.status).json({ error: text });
    }

    // 正常時
    const data = await response.json();
    // このままレスポンスを返す
    return res.json(data);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.toString() });
  }
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`Proxy server is running on http://localhost:${PORT}`);
});
