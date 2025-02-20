// ==================================
// Node.jsサーバー (例: Render)
// deepseek-proxy/index.js
// ==================================
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS & JSONボディパース
app.use(cors());
app.use(express.json());

app.post('/proxy/deepseek', async (req, res) => {
  try {
    console.log("---- /proxy/deepseek called ----");

    // Bloggerから受け取ったデータ (キーワードなど)
    const { promptContent } = req.body;

    // Render (or ほかサーバー環境) の環境変数に設定した APIキー
    const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
    console.log("DEEPSEEK_API_KEY:", DEEPSEEK_API_KEY
      ? "OK (length: " + DEEPSEEK_API_KEY.length + ")"
      : "UNDEFINED"
    );

    // APIキーが無い場合はエラー
    if (!DEEPSEEK_API_KEY) {
      console.error("No API Key set!");
      return res.status(500).json({ error: "APIキーが設定されていません。" });
    }

    // Scaleway Deepseek-r1 の Chat Completions エンドポイント
    const url = "https://api.scaleway.ai/af81c82e-508d-4d91-ba6b-5d4a9e1bb8d5/v1/chat/completions";
    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${DEEPSEEK_API_KEY}`
    };

    // 日本語回答を強制するためのsystemロール & userロールを設定
    const requestBody = {
      model: "deepseek-r1",
      messages: [
        {
          role: "system",
          content: `
            あなたは有能な日本語アシスタントです。
            回答はすべて日本語で行ってください。
            自分の考えを英語で書いたりしないでください。
          `
        },
        {
          role: "user",
          content: `
            【指示】
            あなたは日本語のみで回答してください。
            次のキーワードについて読者ニーズをまとめてください（箇条書きが望ましい）。

            キーワード: ${promptContent}
          `
        }
      ],
      max_tokens: 512,
      temperature: 0.6,
      top_p: 0.95,
      presence_penalty: 0,
      stream: false
    };

    // Scaleway LLM APIへPOST
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      // APIエラーの詳細をログ出力
      const text = await response.text();
      console.error("Scaleway API error:", text);
      return res.status(response.status).json({ error: text });
    }

    const data = await response.json();
    // deepseek-r1 のレスポンスをそのままフロントへ返却
    return res.json(data);

  } catch (error) {
    console.error("Proxy server error:", error);
    return res.status(500).json({ error: error.toString() });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server is running on http://localhost:${PORT}`);
});
