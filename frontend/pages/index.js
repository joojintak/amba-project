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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #ccc",
    marginTop: 6,
    marginBottom: 14,
  };

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: 24 }}>
      <h1 style={{ marginBottom: 8 }}>AMBA 영양제 추천 앱</h1>
      <p style={{ color: "#555", marginBottom: 24 }}>
        건강 정보를 입력하면 추천 영양소와 구매 링크를 보여줍니다.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 24 }}>
        <div style={{ border: "1px solid #e5e7eb", borderRadius: 16, padding: 20, background: "#fff" }}>
          <h2 style={{ marginTop: 0 }}>건강 정보 입력</h2>

          <label>나이</label>
          <input name="age" value={form.age} onChange={handleChange} style={inputStyle} />

          <label>성별</label>
          <select name="gender" value={form.gender} onChange={handleChange} style={inputStyle}>
            <option value="male">남성</option>
            <option value="female">여성</option>
          </select>

          <label>키(cm)</label>
          <input name="height_cm" value={form.height_cm} onChange={handleChange} style={inputStyle} />

          <label>몸무게(kg)</label>
          <input name="weight_kg" value={form.weight_kg} onChange={handleChange} style={inputStyle} />

          <label>활동량</label>
          <select name="activity" value={form.activity} onChange={handleChange} style={inputStyle}>
            <option value="low">낮음</option>
            <option value="medium">보통</option>
            <option value="high">높음</option>
          </select>

          <label>수면시간</label>
          <input name="sleep" value={form.sleep} onChange={handleChange} style={inputStyle} />

          <label>식사 유형</label>
          <select name="diet" value={form.diet} onChange={handleChange} style={inputStyle}>
            <option value="irregular">불규칙</option>
            <option value="regular">규칙적</option>
            <option value="vegetarian">채식 위주</option>
            <option value="high_protein">고단백</option>
          </select>

          <label>질환 (쉼표 구분)</label>
          <input name="conditions" value={form.conditions} onChange={handleChange} style={inputStyle} />

          <label>복용약 (쉼표 구분)</label>
          <input name="medications" value={form.medications} onChange={handleChange} style={inputStyle} />

          <label>건강 목표</label>
          <select name="goal" value={form.goal} onChange={handleChange} style={inputStyle}>
            <option value="피로 관리">피로 관리</option>
            <option value="면역 관리">면역 관리</option>
            <option value="수면 관리">수면 관리</option>
            <option value="체중 관리">체중 관리</option>
            <option value="운동 보조">운동 보조</option>
          </select>

          <button
            onClick={handleSubmit}
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: 10,
              border: "none",
              background: "#111827",
              color: "#fff",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            분석하기
          </button>
        </div>

        <div style={{ border: "1px solid #e5e7eb", borderRadius: 16, padding: 20, background: "#fff" }}>
          <h2 style={{ marginTop: 0 }}>분석 결과</h2>

          {loading && <p>분석 중입니다...</p>}
          {error && <p style={{ color: "crimson" }}>{error}</p>}
          {!loading && !error && !result && <p>왼쪽에서 정보를 입력하고 분석하기를 눌러주세요.</p>}

          {result && (
            <div>
              <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
                <div style={{ flex: 1, padding: 12, borderRadius: 12, background: "#f9fafb" }}>
                  <strong>BMI</strong>
                  <div>{result.bmi}</div>
                </div>
                <div style={{ flex: 1, padding: 12, borderRadius: 12, background: "#f9fafb" }}>
                  <strong>체형</strong>
                  <div>{result.bmi_category}</div>
                </div>
              </div>

              {result.recommendations?.map((rec, idx) => (
                <div
                  key={idx}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 18,
                    background: "#fafafa",
                  }}
                >
                  <h3 style={{ marginTop: 0 }}>{rec.nutrient}</h3>
                  <p><strong>추천 이유:</strong> {rec.reason}</p>
                  <p><strong>식품:</strong> {rec.food_sources?.join(", ")}</p>
                  <p><strong>주의:</strong> {rec.cautions?.join(", ")}</p>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                      gap: 12,
                      marginTop: 14,
                    }}
                  >
                    {rec.sample_products?.map((p, i) => (
                      <div
                        key={i}
                        style={{
                          border: "1px solid #ddd",
                          borderRadius: 12,
                          padding: 12,
                          background: "#fff",
                        }}
                      >
                        <img
                          src={p.image_url}
                          alt={p.title}
                          style={{
                            width: "100%",
                            height: 140,
                            objectFit: "contain",
                            marginBottom: 10,
                            background: "#fff",
                          }}
                        />
                        <div style={{ fontWeight: 700, marginBottom: 6 }}>{p.title}</div>
                        <div style={{ fontSize: 14, color: "#555", marginBottom: 6 }}>{p.mall_name}</div>
                        <div style={{ fontWeight: 700, marginBottom: 10 }}>{p.price_krw}원</div>
                        <a
                          href={p.url}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: "inline-block",
                            padding: "8px 12px",
                            borderRadius: 8,
                            background: "#111827",
                            color: "#fff",
                            textDecoration: "none",
                          }}
                        >
                          구매 링크
                        </a>
                      </div>
                    ))}
                  </div>
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
