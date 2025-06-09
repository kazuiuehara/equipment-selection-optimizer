import { useState } from "react";

const machines = [
  { name: "arcMate-50iC5L", maxWeight: 5, armLength: 875, speed: 7, workSpace: 0.28 },
  { name: "C4L", maxWeight: 4, armLength: 565, speed: 7, workSpace: 0.25 },
  { name: "C8XL", maxWeight: 8, armLength: 900, speed: 6, workSpace: 0.3 },
  { name: "VS-087", maxWeight: 7, armLength: 1400, speed: 11, workSpace: 0.23 },
  { name: "VS-6556G", maxWeight: 7, armLength: 892, speed: 8, workSpace: 0.2 },
];

export default function App() {
  const [productWeight, setProductWeight] = useState("");
  const [productSize, setProductSize] = useState("");
  const [filteredMachines, setFilteredMachines] = useState([]);
  const [aiComment, setAiComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    const weight = parseFloat(productWeight);
    const size = parseFloat(productSize);
    if (isNaN(weight) || isNaN(size)) {
      alert("数字を正しく入力してください");
      return;
    }
    const results = machines.filter(
      (m) => m.maxWeight >= weight && m.workSpace >= size
    );
    setFilteredMachines(results);

    if (results.length === 0) {
      setAiComment("該当する機器がありません。");
      return;
    }

    // AIコメント取得
    setLoading(true);
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "あなたはロボットアームの専門家です。"
            },
            {
              role: "user",
              content: `次のロボットアームの候補について、特徴とおすすめポイントを簡潔に教えてください。\n${results
                .map((m) =>
                  `${m.name}: 最大重量${m.maxWeight}kg、アーム長${m.armLength}mm、速度${m.speed}m/s、動作範囲${m.workSpace}m`
                )
                .join("\n")}`
            }
          ],
          temperature: 0.7,
          max_tokens: 150
        }),
      });
      const data = await response.json();
      setAiComment(data.choices[0].message.content.trim());
    } catch (error) {
      setAiComment("AIコメントの取得に失敗しました。");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>商品掴み取り機器選定＋AIおすすめ解説</h1>
      <div>
        <label>商品重量 (kg): </label>
        <input
          type="number"
          value={productWeight}
          onChange={(e) => setProductWeight(e.target.value)}
        />
      </div>
      <div>
        <label>商品サイズ (m): </label>
        <input
          type="number"
          value={productSize}
          onChange={(e) => setProductSize(e.target.value)}
        />
      </div>
      <button onClick={handleSearch} disabled={loading}>
        {loading ? "読み込み中..." : "適合機器を検索"}
      </button>

      <h2>適合機器一覧</h2>
      {filteredMachines.length === 0 ? (
        <p>該当する機器がありません</p>
      ) : (
        <ul>
          {filteredMachines.map((m) => (
            <li key={m.name}>
              {m.name} - 最大重量: {m.maxWeight}kg, 動作範囲: {m.workSpace}m, 速度: {m.speed}m/s
            </li>
          ))}
        </ul>
      )}

      <h2>AIおすすめコメント</h2>
      <p>{aiComment}</p>
    </div>
  );
}
