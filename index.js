const express = require('express');
// Node.js v18以降なら標準fetchが使えますが、古い環境用にnode-fetchを利用
const fetch = require('node-fetch'); 
const app = express();
const PORT = process.env.PORT || 3000;

// CORSを許可するミドルウェア設定
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "POST, OPTIONS");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// JSONボディをパース
app.use(express.json());

// ルート: Bloggerからのリクエストを受け取ってScalewayへ転送
app.post('/proxy/deepseek', async (req, res) => {
  try {
    const { promptContent } = req.body;

    // ★サーバー上で管理するAPIキーを環境変数から取得
    const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
    if (!DEEPSEEK_API_KEY) {
      return res.status(500).json({
        error: "APIキーが設定されていません。DEEPSEEK_API_KEY を環境変数に設定してください。"
      });
    }

    // Scalewayへ問い合わせ
    const response = await fetch("https://api.scaleway.com/generative-api/v1/ai/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Auth-Token": DEEPSEEK_API_KEY
      },
      body: JSON.stringify({
        model_id: "deepseek-r1",
        messages: [
          {
            role: "user",
            content: promptContent
          }
        ]
      })
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: text });
    }

    const data = await response.json();
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
