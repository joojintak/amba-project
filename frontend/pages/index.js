import { useState } from "react";

export default function Home() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const [form, setForm] = useState({
    age: 42,
    gender: "male",
    height_cm: 175,
    weight_kg: 78,
    activity: "low",
    sleep: 5,
    diet: "irregular",
    conditions: "고혈압",
    medications: "혈압약",
    goal: "피로 관리",
  });

  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    const payload = {
      age: Number(form.age),
      gender: form.gender,
      height_cm: Number(form.height_cm),
      weight_kg: Number(form.weight_kg),
      activity: form.activity,
      sleep: Number(form.sleep),
      diet: form.diet,
      conditions: form.conditions
        ? form.conditions.split(",").map((v) => v.trim()).filter(Boolean)
        : [],
      medications: form.medications
        ? form.medications.split(",").map((v) => v.trim()).filter(Boolean)
        : [],
      goal: form.goal,
    };

    try {
      const response = await fetch(`${API_URL}/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`API 오류: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(`요청 실패: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 24 }}>
      <h1>AMBA 영양제 추천 앱</h1>
      <p>건강 정보를 입력 후 추천 영양소와 구매 링크를 확인하세요.</p>

      <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
        <div style={{ flex: 1, border: "1px solid #ddd", padding: 16, borderRadius: 8 }}>
          <h2>건강 정보 입력</h2>

          <div><label>나이</label><input name="age" value={form.age} onChange={handleChange} /></div>
          <div><label>성별</label><input name="gender" value={form.gender} onChange={handleChange} /></div>
          <div><label>키(cm)</label><input name="height_cm" value={form.height_cm} onChange={handleChange} /></div>
          <div><label>몸무게(kg)</label><input name="weight_kg" value={form.weight_kg} onChange={handleChange} /></div>
          <div><label>활동량</label><input name="activity" value={form.activity} onChange={handleChange} /></div>
          <div><label>수면시간</label><input name="sleep" value={form.sleep} onChange={handleChange} /></div>
          <div><label>식사 유형</label><input name="diet" value={form.diet} onChange={handleChange} /></div>
          <div><label>질환(쉼표 구분)</label><input name="conditions" value={form.conditions} onChange={handleChange} /></div>
          <div><label>복용약(쉼표 구분)</label><input name="medications" value={form.medications} onChange={handleChange} /></div>
          <div><label>건강 목표</label><input name="goal" value={form.goal} onChange={handleChange} /></div>

          <button onClick={handleSubmit} style={{ marginTop: 16 }}>
            분석하기
          </button>
        </div>

        <div style={{ flex: 1, border: "1px solid #ddd", padding: 16, borderRadius: 8 }}>
          <h2>분석 결과</h2>

          {loading && <p>분석 중입니다...</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}

          {!loading && !error && !result && (
            <p>왼쪽 입력 후 분석하기를 눌러 주세요.</p>
          )}

          {result && (
            <div>
              <p><strong>BMI:</strong> {result.bmi}</p>
              <p><strong>BMI 분류:</strong> {result.bmi_category}</p>

              {result.recommendations?.map((rec, idx) => (
                <div
                  key={idx}
                  style={{
                    border: "1px solid #ccc",
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 16,
                  }}
                >
                  <h3>{rec.nutrient}</h3>
                  <p><strong>추천 이유:</strong> {rec.reason}</p>
                  <p><strong>식품 소스:</strong> {rec.food_sources?.join(", ")}</p>
                  <p><strong>주의사항:</strong> {rec.cautions?.join(", ")}</p>

                  <h4>추천 상품</h4>
                  <ul>
                    {rec.sample_products?.map((p, pIdx) => (
                      <li key={pIdx} style={{ marginBottom: 8 }}>
                        <a href={p.url} target="_blank" rel="noreferrer">
                          {p.title}
                        </a>
                        {" / "}
                        {p.mall_name}
                        {" / "}
                        {p.price_krw}원
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              <p style={{ fontSize: 12, color: "#666" }}>{result.disclaimer}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
