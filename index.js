const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// CORSミドルウェアをグローバル適用
app.use(cors());

// JSONボディをパース
app.use(express.json());

app.post('/proxy/deepseek', async (req, res) => {
  try {
    const { promptContent } = req.body;
    const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
    if (!DEEPSEEK_API_KEY) {
      return res.status(500).json({ error: "APIキーが設定されていません。" });
    }

    // 以降 Scaleway API 呼び出し (Authorization: Bearer + 新APIエンドポイント)
    // ...
    // (省略)

    return res.json(/* ... */);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.toString() });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server is running on http://localhost:${PORT}`);
});
