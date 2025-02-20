const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS対策
app.use(cors());
app.use(express.json());

// ここからルート
app.post('/proxy/deepseek', async (req, res) => {
  try {
    // ルートが呼ばれたかをログ
    console.log("---- /proxy/deepseek called ----");

    // フロント（Blogger）から受け取る内容
    const { promptContent } = req.body;

    // Renderで設定した環境変数からキー取得
    const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
    // キーがあるかログで確認
    console.log("DEEPSEEK_API_KEY:", DEEPSEEK_API_KEY 
      ? "OK (length: " + DEEPSEEK_API_KEY.length + ")" 
      : "UNDEFINED"
    );

    // キーが無ければ 500エラー返却
    if (!DEEPSEEK_API_KEY) {
      console.error("No API Key set!");
      return res.status(500).json({ error: "APIキーが設定されていません。" });
    }

    // ==== 以下はScaleway LLMへのリクエストの例 ====
    const url = "https://api.scaleway.ai/af81c82e-508d-4d91-ba6b-5d4a9e1bb8d5/v1/chat/completions";
    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${DEEPSEEK_API_KEY}`
    };

    const requestBody = {
      model: "deepseek-r1",
      messages: [
        { role: "system", content: "You are a helpful assistant. Please respond in Japanese." },
        { role: "user", content: promptContentFromBlogger }
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
      // APIエラー詳細をログ出力
      const text = await response.text();
      console.error("Scaleway API error:", text);
      return res.status(response.status).json({ error: text });
    }

    // 正常時
    const data = await response.json();
    return res.json(data);

  } catch (error) {
    // 予期せぬ例外が起きた場合にログ
    console.error("Proxy server error:", error);
    return res.status(500).json({ error: error.toString() });
  }
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`Proxy server is running on http://localhost:${PORT}`);
});
