<!-- ===================== Blogger HTML ===================== -->
<div>
  <h2>ステップ1: KWを入力してください</h2>
  <label for="kwInput">キーワード:</label>
  <input type="text" id="kwInput" size="40">
  <button id="btnStep1">ステップ1 実行</button>
</div>

<div>
  <h2>ステップ2: 上位記事の要約</h2>
  <button id="btnStep2">ステップ2 実行</button>
</div>

<div>
  <h2>ステップ3: アウトライン生成</h2>
  <button id="btnStep3">ステップ3 実行</button>
</div>

<div>
  <h2>ステップ4: Head2ごとに本文執筆</h2>
  <button id="btnStep4">ステップ4 実行</button>
</div>

<div>
  <h2>ステップ5: 合体して表示</h2>
  <button id="btnStep5">ステップ5 実行</button>
</div>

<div>
  <h2>ステップ6: 最終HTMLプレビュー</h2>
  <button id="btnStep6">ステップ6 実行</button>
</div>

<div>
  <h2>ステップ7: タイトル案/ディスクリプション/FAQ</h2>
  <button id="btnStep7">ステップ7 実行</button>
</div>

<hr>
<div id="resultArea" style="margin-top: 20px; border: 1px solid #ccc; padding: 10px;"></div>

<script>
  // Node.jsのエンドポイント例（同じAPIでも複数ステップを区別できるようエンドポイントを分割するか、パラメータで指示）
  const STEP1_ENDPOINT = "https://your-node-server.com/step1"; 
  const STEP2_ENDPOINT = "https://your-node-server.com/step2";
  // ... 同様に step3〜7 用URL or 1つのエンドポイントに ?step=2 みたいにする

  // ステップ進行中のデータ(アウトライン、本文ブロックなど)をフロント側で一時保管
  let globalData = {
    kw: "",
    topArticlesSummary: "",
    outline: "",
    articleBlocks: [],
    combinedArticle: "",
    finalHtml: ""
    // etc...
  };

  document.addEventListener("DOMContentLoaded", () => {
    const btnStep1 = document.getElementById("btnStep1");
    btnStep1.addEventListener("click", doStep1);

    const btnStep2 = document.getElementById("btnStep2");
    btnStep2.addEventListener("click", doStep2);

    document.getElementById("btnStep3").addEventListener("click", doStep3);
    document.getElementById("btnStep4").addEventListener("click", doStep4);
    document.getElementById("btnStep5").addEventListener("click", doStep5);
    document.getElementById("btnStep6").addEventListener("click", doStep6);
    document.getElementById("btnStep7").addEventListener("click", doStep7);
  });

  // =================== STEP1: 入力KWをサーバーに送信, 上位記事URL取得 ===================
  async function doStep1() {
    const kw = document.getElementById("kwInput").value.trim();
    if (!kw) {
      alert("キーワードを入力してください。");
      return;
    }
    globalData.kw = kw;

    // TODO: サーバーでGoogle検索APIを叩き、上位URLを取得
    // 例: fetch(`${STEP1_ENDPOINT}?kw=${encodeURIComponent(kw)}`)
    // ここではダミー処理
    document.getElementById("resultArea").textContent = `ステップ1完了: KW="${kw}" を取得しました。(上位記事URLをサーバーが取得中)`;
  }

  // =================== STEP2: サーバーが上位記事をHTML→要約し、LLMでまとめ ===================
  async function doStep2() {
    try {
      const res = await fetch(`${STEP2_ENDPOINT}?kw=${encodeURIComponent(globalData.kw)}`);
      if (!res.ok) throw new Error(`STEP2 API失敗: ${res.statusText}`);
      const data = await res.json();
      // data.topArticlesSummary: 5記事の要約テキスト
      globalData.topArticlesSummary = data.topArticlesSummary || "";
      document.getElementById("resultArea").textContent =
        `ステップ2完了: 上位記事要約を取得\n\n${globalData.topArticlesSummary}`;
    } catch (err) {
      document.getElementById("resultArea").textContent = `エラー: ${err.message}`;
    }
  }

  // =================== STEP3: 読者ニーズ & アウトライン生成 ===================
  async function doStep3() {
    try {
      // 例: fetch(STEP3_ENDPOINT)に {kw, topArticlesSummary} などをPOST
      const payload = {
        kw: globalData.kw,
        summary: globalData.topArticlesSummary
      };
      const res = await fetch(STEP3_ENDPOINT, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify(payload)
      });
      if(!res.ok) throw new Error(`STEP3 API失敗: ${res.statusText}`);
      const data = await res.json();
      // data.outline などを格納
      globalData.outline = data.outline || "(outlineなし)";
      document.getElementById("resultArea").textContent =
        `ステップ3完了: アウトライン生成\n\n${globalData.outline}`;
    } catch(e) {
      document.getElementById("resultArea").textContent = `エラー: ${e.message}`;
    }
  }

  // =================== STEP4: アウトラインをHead2ごとに分割 → LLMで本文執筆 ===================
  async function doStep4() {
    // 例: Head2毎にLLM呼び出し → blockごとに記事本文作成
    // ここでは擬似的に "Outlineを行ごとに分割" という例
    const lines = globalData.outline.split("\n");
    globalData.articleBlocks = [];

    // ここで for (each Head2) => fetch(...) で分割して本文生成
    for (let i=0; i<lines.length; i++){
      const line = lines[i].trim();
      if (line.startsWith("##")) {
        // 例: STEP4_ENDPOINTに {head2: line, summary, kw} などを送る
        // ここではダミーで blockText を生成
        const blockText = `【自動生成本文】\n見出し: ${line}\n...ここでLLM出力...`;
        globalData.articleBlocks.push(blockText);
      }
    }

    document.getElementById("resultArea").textContent =
      `ステップ4完了:\nHead2毎に本文を分割生成しました。\n`+
      globalData.articleBlocks.join("\n------\n");
  }

  // =================== STEP5: 合体して表示 ===================
  async function doStep5() {
    // articleBlocksを結合して combinedArticle にまとめる
    globalData.combinedArticle = globalData.articleBlocks.join("\n\n");
    document.getElementById("resultArea").textContent =
      `ステップ5完了:\n合体後の記事テキスト:\n\n${globalData.combinedArticle}`;
  }

  // =================== STEP6: HTML形式で表示 ===================
  async function doStep6() {
    // ここで combinedArticle をHTML化する処理を挟む
    // 例: Head2 => <h2>, など
    globalData.finalHtml = convertToHtml(globalData.combinedArticle);
    document.getElementById("resultArea").innerHTML =
      `<h3>ステップ6完了: HTMLプレビュー</h3>\n${globalData.finalHtml}`;
  }

  // 仮のHTML変換
  function convertToHtml(text) {
    // 簡易的に "## 見出し" → <h2> に置換する例
    let html = text
      .replace(/^## (.*)$/gm, "<h2>$1</h2>")
      .replace(/\n/g, "<br>");
    return html;
  }

  // =================== STEP7: タイトル案 / ディスクリプション / FAQ ===================
  async function doStep7(){
    try {
      const payload = {
        combinedArticle: globalData.combinedArticle,
        kw: globalData.kw
      };
      const res = await fetch(STEP7_ENDPOINT, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify(payload)
      });
      if(!res.ok) throw new Error(`STEP7 API失敗: ${res.statusText}`);

      const data = await res.json();
      // data.titles, data.metaDesc, data.faq など仮定
      const msg = `タイトル案:\n${data.titles.join("\n")}\n\n`+
                  `メタディスクリプション:\n${data.metaDesc}\n\n`+
                  `FAQ:\n${JSON.stringify(data.faq, null, 2)}`;
      document.getElementById("resultArea").textContent = `ステップ7完了:\n${msg}`;
    } catch(e){
      document.getElementById("resultArea").textContent = `エラー: ${e.message}`;
    }
  }

</script>
