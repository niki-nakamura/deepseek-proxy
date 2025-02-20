<!-- ==================================
     BloggerのHTML/JSウィジェット
     ================================== -->

<div>
  <label for="userInput">キーワードまたはテーマを入力してください:</label><br/>
  <input type="text" id="userInput" size="40" /><br/><br/>
  <button id="generateBtn">読者ニーズを生成</button>
</div>

<div id="resultArea" style="margin-top: 20px;"></div>

<script>
  // Node.jsサーバー(Render等)にデプロイしたプロキシのエンドポイント
  const PROXY_ENDPOINT = "https://deepseek-proxy-8zo8.onrender.com/proxy/deepseek";

  document.addEventListener("DOMContentLoaded", () => {
    const generateBtn = document.getElementById("generateBtn");
    generateBtn.addEventListener("click", async () => {
      const userInput = document.getElementById("userInput").value.trim();
      const resultArea = document.getElementById("resultArea");

      if (!userInput) {
        alert("キーワード/テーマを入力してください。");
        return;
      }

      // UI上の演出
      generateBtn.disabled = true;
      resultArea.innerHTML = "<p>読者ニーズを生成中です…</p>";

      try {
        // キーワードをpayloadに入れてサーバーへ送る
        const payload = { promptContent: userInput };

        const response = await fetch(PROXY_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error(`API呼び出しに失敗しました: ${response.statusText}`);
        }

        // Deepseek-r1 のChat Completions レスポンスを取得
        const data = await response.json();

        // deepseek-r1の場合、生成テキストは data.choices[0].message.content に入る可能性が高い
        const content = data?.choices?.[0]?.message?.content || "結果を取得できませんでした。";

        // 画面に出力
        resultArea.innerHTML = `<pre>${content}</pre>`;

      } catch (error) {
        console.error(error);
        resultArea.innerHTML = `<p style="color:red;">エラーが発生しました: ${error.message}</p>`;
      } finally {
        generateBtn.disabled = false;
      }
    });
  });
</script>
