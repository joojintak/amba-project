import { useState } from "react";

export default function Home() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const [step, setStep] = useState("form");

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

  const buildPayload = () => ({
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
  });

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(`${API_URL}/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(buildPayload()),
      });

      if (!response.ok) {
        throw new Error(`API 오류: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
      setStep("result");
    } catch (err) {
      setError(`요청 실패: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReanalyze = async () => {
    await handleSubmit();
  };

  const goToForm = () => {
    setStep("form");
  };

  const goToHome = () => {
    setStep("form");
    setResult(null);
    setError("");
  };

  const pageStyle = {
    maxWidth: 760,
    margin: "0 auto",
    padding: "20px 16px 40px",
  };

  const cardStyle = {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 18,
    padding: 18,
    boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
  };

  const sectionTitleStyle = {
    fontSize: 24,
    fontWeight: 800,
    marginBottom: 8,
    color: "#111827",
  };

  const sectionDescStyle = {
    color: "#6b7280",
    fontSize: 15,
    marginBottom: 20,
    lineHeight: 1.5,
  };

  const fieldCardStyle = {
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  };

  const labelStyle = {
    display: "block",
    fontWeight: 700,
    fontSize: 15,
    color: "#111827",
    marginBottom: 8,
  };

  const inputStyle = {
    width: "100%",
    padding: "14px 14px",
    borderRadius: 12,
    border: "1px solid #d1d5db",
    fontSize: 16,
    boxSizing: "border-box",
    background: "#fff",
  };

  const primaryButtonStyle = {
    width: "100%",
    padding: "16px 18px",
    borderRadius: 14,
    border: "none",
    background: "#111827",
    color: "#fff",
    fontWeight: 800,
    fontSize: 16,
    cursor: "pointer",
  };

  const secondaryButtonStyle = {
    flex: 1,
    padding: "13px 14px",
    borderRadius: 12,
    border: "1px solid #d1d5db",
    background: "#fff",
    color: "#111827",
    fontWeight: 700,
    fontSize: 15,
    cursor: "pointer",
  };

  return (
    <div style={{ background: "#f3f4f6", minHeight: "100vh" }}>
      <div style={pageStyle}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: "#111827", marginBottom: 8 }}>
            AMBA 영양제 추천 앱
          </div>
          <div style={{ color: "#6b7280", lineHeight: 1.5 }}>
            건강 정보를 입력하면 맞춤 영양소와 구매 링크를 보여줍니다.
          </div>
        </div>

        {step === "form" && (
          <div style={cardStyle}>
            <div style={sectionTitleStyle}>건강 정보 입력</div>
            <div style={sectionDescStyle}>
              아래 질문에 답한 뒤 분석하기를 누르면, 다음 화면에서 추천 결과를 확인할 수 있습니다.
            </div>

            <div style={fieldCardStyle}>
              <label style={labelStyle}>나이</label>
              <input
                name="age"
                value={form.age}
                onChange={handleChange}
                style={inputStyle}
                inputMode="numeric"
              />
            </div>

            <div style={fieldCardStyle}>
              <label style={labelStyle}>성별</label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="male">남성</option>
                <option value="female">여성</option>
              </select>
            </div>

            <div style={fieldCardStyle}>
              <label style={labelStyle}>키(cm)</label>
              <input
                name="height_cm"
                value={form.height_cm}
                onChange={handleChange}
                style={inputStyle}
                inputMode="decimal"
              />
            </div>

            <div style={fieldCardStyle}>
              <label style={labelStyle}>몸무게(kg)</label>
              <input
                name="weight_kg"
                value={form.weight_kg}
                onChange={handleChange}
                style={inputStyle}
                inputMode="decimal"
              />
            </div>

            <div style={fieldCardStyle}>
              <label style={labelStyle}>활동량</label>
              <select
                name="activity"
                value={form.activity}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="low">낮음</option>
                <option value="medium">보통</option>
                <option value="high">높음</option>
              </select>
            </div>

            <div style={fieldCardStyle}>
              <label style={labelStyle}>수면시간</label>
              <input
                name="sleep"
                value={form.sleep}
                onChange={handleChange}
                style={inputStyle}
                inputMode="numeric"
              />
            </div>

            <div style={fieldCardStyle}>
              <label style={labelStyle}>식사 유형</label>
              <select
                name="diet"
                value={form.diet}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="irregular">불규칙</option>
                <option value="regular">규칙적</option>
                <option value="vegetarian">채식 위주</option>
                <option value="high_protein">고단백</option>
              </select>
            </div>

            <div style={fieldCardStyle}>
              <label style={labelStyle}>질환 (쉼표 구분)</label>
              <input
                name="conditions"
                value={form.conditions}
                onChange={handleChange}
                style={inputStyle}
                placeholder="예: 고혈압, 당뇨"
              />
            </div>

            <div style={fieldCardStyle}>
              <label style={labelStyle}>복용약 (쉼표 구분)</label>
              <input
                name="medications"
                value={form.medications}
                onChange={handleChange}
                style={inputStyle}
                placeholder="예: 혈압약"
              />
            </div>

            <div style={fieldCardStyle}>
              <label style={labelStyle}>건강 목표</label>
              <select
                name="goal"
                value={form.goal}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="피로 관리">피로 관리</option>
                <option value="면역 관리">면역 관리</option>
                <option value="수면 관리">수면 관리</option>
                <option value="체중 관리">체중 관리</option>
                <option value="운동 보조">운동 보조</option>
              </select>
            </div>

            {error && (
              <div
                style={{
                  marginBottom: 16,
                  padding: 12,
                  borderRadius: 12,
                  background: "#fef2f2",
                  color: "#b91c1c",
                  border: "1px solid #fecaca",
                  fontSize: 14,
                }}
              >
                {error}
              </div>
            )}

            <button onClick={handleSubmit} style={primaryButtonStyle} disabled={loading}>
              {loading ? "분석 중..." : "분석하기"}
            </button>
          </div>
        )}

        {step === "result" && result && (
          <div style={cardStyle}>
            <div style={sectionTitleStyle}>분석 결과</div>
            <div style={sectionDescStyle}>
              입력한 정보를 바탕으로 추천 영양소와 상품 링크를 정리했습니다.
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                marginBottom: 18,
              }}
            >
              <div
                style={{
                  background: "#f9fafb",
                  borderRadius: 14,
                  padding: 14,
                  border: "1px solid #e5e7eb",
                }}
              >
                <div style={{ color: "#6b7280", fontSize: 14, marginBottom: 6 }}>BMI</div>
                <div style={{ fontSize: 20, fontWeight: 800 }}>{result.bmi}</div>
              </div>

              <div
                style={{
                  background: "#f9fafb",
                  borderRadius: 14,
                  padding: 14,
                  border: "1px solid #e5e7eb",
                }}
              >
                <div style={{ color: "#6b7280", fontSize: 14, marginBottom: 6 }}>체형</div>
                <div style={{ fontSize: 20, fontWeight: 800 }}>{result.bmi_category}</div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: 10,
                marginBottom: 20,
                flexWrap: "wrap",
              }}
            >
              <button onClick={goToHome} style={secondaryButtonStyle}>
                처음으로
              </button>
              <button onClick={goToForm} style={secondaryButtonStyle}>
                정보 변경하기
              </button>
              <button
                onClick={handleReanalyze}
                style={{
                  ...secondaryButtonStyle,
                  background: "#111827",
                  color: "#fff",
                  border: "none",
                }}
              >
                다시 분석하기
              </button>
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
                <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>
                  {rec.nutrient}
                </div>

                <div style={{ marginBottom: 8, lineHeight: 1.6 }}>
                  <strong>추천 이유:</strong> {rec.reason}
                </div>
                <div style={{ marginBottom: 8, lineHeight: 1.6 }}>
                  <strong>식품:</strong> {rec.food_sources?.join(", ")}
                </div>
                <div style={{ marginBottom: 12, lineHeight: 1.6 }}>
                  <strong>주의:</strong> {rec.cautions?.join(", ")}
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr",
                    gap: 12,
                  }}
                >
                  {rec.sample_products?.map((p, i) => (
                    <div
                      key={i}
                      style={{
                        border: "1px solid #ddd",
                        borderRadius: 14,
                        padding: 14,
                        background: "#fff",
                      }}
                    >
                      <img
                        src={p.image_url}
                        alt={p.title}
                        style={{
                          width: "100%",
                          height: 180,
                          objectFit: "contain",
                          borderRadius: 10,
                          background: "#fff",
                          marginBottom: 12,
                        }}
                      />

                      <div
                        style={{
                          fontWeight: 800,
                          fontSize: 16,
                          marginBottom: 8,
                          lineHeight: 1.5,
                        }}
                      >
                        {p.title}
                      </div>

                      <div style={{ color: "#6b7280", marginBottom: 6 }}>
                        {p.mall_name}
                      </div>

                      <div
                        style={{
                          fontSize: 18,
                          fontWeight: 800,
                          marginBottom: 12,
                          color: "#111827",
                        }}
                      >
                        {p.price_krw}원
                      </div>

                      <a
                        href={p.url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: "block",
                          textAlign: "center",
                          padding: "12px 14px",
                          borderRadius: 12,
                          background: "#111827",
                          color: "#fff",
                          textDecoration: "none",
                          fontWeight: 800,
                        }}
                      >
                        구매 링크
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div
              style={{
                marginTop: 10,
                padding: 12,
                background: "#f9fafb",
                borderRadius: 12,
                color: "#6b7280",
                fontSize: 13,
                lineHeight: 1.6,
              }}
            >
              {result.disclaimer}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
