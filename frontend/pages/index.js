import { useState } from "react";

export default function Home() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const [step, setStep] = useState("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const [form, setForm] = useState({
    age: "42",
    gender: "male",
    height_cm: "175",
    weight_kg: "78",
    activity: "low",
    sleep: "5",
    diet: "irregular",
    conditions: "고혈압",
    medications: "혈압약",
    goal: "피로 관리",
  });

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const buildPayload = () => {
    return {
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
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      if (!API_URL) {
        throw new Error("NEXT_PUBLIC_API_URL 환경변수가 설정되지 않았습니다.");
      }

      const response = await fetch(`${API_URL}/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(buildPayload()),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`API 오류: ${response.status} / ${text}`);
      }

      const data = await response.json();

      if (!data || typeof data !== "object") {
        throw new Error("응답 형식이 올바르지 않습니다.");
      }

      setResult(data);
      setStep("result");
    } catch (err) {
      setError(err?.message || "알 수 없는 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const goToForm = () => {
    setStep("form");
  };

  const goToHome = () => {
    setResult(null);
    setError("");
    setStep("form");
  };

  const handleReanalyze = async () => {
    await handleSubmit();
  };

  const recommendations = Array.isArray(result?.recommendations)
    ? result.recommendations
    : [];

  return (
    <div style={{ background: "#f3f4f6", minHeight: "100vh" }}>
      {loading && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(255,255,255,0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            flexDirection: "column",
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              border: "5px solid #dbeafe",
              borderTop: "5px solid #003876",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
          <p style={{ marginTop: 16, fontWeight: 700, color: "#003876" }}>
            분석 중입니다...
          </p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "20px 16px 40px" }}>
        <div
          style={{
            background: "linear-gradient(135deg, #003876 0%, #0a56a8 100%)",
            color: "#fff",
            borderRadius: 20,
            padding: "28px 22px",
            marginBottom: 20,
            boxShadow: "0 10px 30px rgba(0,56,118,0.15)",
          }}
        >
          <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>
            AMBA 영양제 추천 앱
          </div>
          <div style={{ lineHeight: 1.6, opacity: 0.95 }}>
            연세대학교 AMBA 브로셔 톤앤매너를 참고한 모바일 친화형 추천 서비스
          </div>
        </div>

        {step === "form" && (
          <div style={cardStyle}>
            <h2 style={titleStyle}>건강 정보 입력</h2>
            <p style={descStyle}>
              건강 정보를 입력한 뒤 분석하기를 누르면 다음 화면에서 결과를 볼 수 있습니다.
            </p>

            {error && <div style={errorBoxStyle}>{error}</div>}

            <Field label="나이">
              <input
                name="age"
                value={form.age}
                onChange={handleChange}
                style={inputStyle}
                inputMode="numeric"
              />
            </Field>

            <Field label="성별">
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="male">남성</option>
                <option value="female">여성</option>
              </select>
            </Field>

            <Field label="키(cm)">
              <input
                name="height_cm"
                value={form.height_cm}
                onChange={handleChange}
                style={inputStyle}
                inputMode="decimal"
              />
            </Field>

            <Field label="몸무게(kg)">
              <input
                name="weight_kg"
                value={form.weight_kg}
                onChange={handleChange}
                style={inputStyle}
                inputMode="decimal"
              />
            </Field>

            <Field label="활동량">
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
            </Field>

            <Field label="수면시간">
              <input
                name="sleep"
                value={form.sleep}
                onChange={handleChange}
                style={inputStyle}
                inputMode="numeric"
              />
            </Field>

            <Field label="식사 유형">
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
            </Field>

            <Field label="질환 (쉼표 구분)">
              <input
                name="conditions"
                value={form.conditions}
                onChange={handleChange}
                style={inputStyle}
                placeholder="예: 고혈압, 당뇨"
              />
            </Field>

            <Field label="복용약 (쉼표 구분)">
              <input
                name="medications"
                value={form.medications}
                onChange={handleChange}
                style={inputStyle}
                placeholder="예: 혈압약"
              />
            </Field>

            <Field label="건강 목표">
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
            </Field>

            <button onClick={handleSubmit} style={primaryButtonStyle} disabled={loading}>
              분석하기
            </button>
          </div>
        )}

        {step === "result" && result && (
          <div style={cardStyle}>
            <h2 style={titleStyle}>분석 결과</h2>
            <p style={descStyle}>입력 정보를 바탕으로 추천 결과를 정리했습니다.</p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                marginBottom: 18,
              }}
            >
              <SummaryCard title="BMI" value={String(result?.bmi ?? "-")} />
              <SummaryCard title="체형" value={String(result?.bmi_category ?? "-")} />
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
              <button onClick={goToHome} style={secondaryButtonStyle}>
                처음으로
              </button>
              <button onClick={goToForm} style={secondaryButtonStyle}>
                정보 변경하기
              </button>
              <button onClick={handleReanalyze} style={darkButtonStyle}>
                다시 분석하기
              </button>
            </div>

            {recommendations.length === 0 && (
              <div style={errorBoxStyle}>추천 결과가 비어 있습니다.</div>
            )}

            {recommendations.map((rec, idx) => (
              <div key={idx} style={recommendCardStyle}>
                <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>
                  {rec?.nutrient || "추천 영양소"}
                </div>

                <p><strong>추천 이유:</strong> {rec?.reason || "-"}</p>
                <p><strong>식품:</strong> {Array.isArray(rec?.food_sources) ? rec.food_sources.join(", ") : "-"}</p>
                <p><strong>주의:</strong> {Array.isArray(rec?.cautions) ? rec.cautions.join(", ") : "-"}</p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12, marginTop: 12 }}>
                  {(Array.isArray(rec?.sample_products) ? rec.sample_products : []).map((p, i) => (
                    <div key={i} style={productCardStyle}>
                      {p?.image_url ? (
                        <img
                          src={p.image_url}
                          alt={p?.title || "product"}
                          style={{
                            width: "100%",
                            height: 180,
                            objectFit: "contain",
                            borderRadius: 10,
                            background: "#fff",
                            marginBottom: 12,
                          }}
                        />
                      ) : null}

                      <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 8, lineHeight: 1.5 }}>
                        {p?.title || "상품명 없음"}
                      </div>

                      <div style={{ color: "#6b7280", marginBottom: 6 }}>
                        {p?.mall_name || "-"}
                      </div>

                      <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 12 }}>
                        {typeof p?.price_krw !== "undefined" ? `${p.price_krw}원` : "-"}
                      </div>

                      {p?.url ? (
                        <a
                          href={p.url}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: "block",
                            textAlign: "center",
                            padding: "12px 14px",
                            borderRadius: 12,
                            background: "#003876",
                            color: "#fff",
                            textDecoration: "none",
                            fontWeight: 800,
                          }}
                        >
                          구매 링크
                        </a>
                      ) : null}
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
              {result?.disclaimer || "안내 문구가 없습니다."}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div
      style={{
        background: "#f9fafb",
        border: "1px solid #e5e7eb",
        borderRadius: 14,
        padding: 14,
        marginBottom: 14,
      }}
    >
      <label
        style={{
          display: "block",
          fontWeight: 700,
          fontSize: 15,
          color: "#111827",
          marginBottom: 8,
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function SummaryCard({ title, value }) {
  return (
    <div
      style={{
        background: "#f9fafb",
        borderRadius: 14,
        padding: 14,
        border: "1px solid #e5e7eb",
      }}
    >
      <div style={{ color: "#6b7280", fontSize: 14, marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 20, fontWeight: 800 }}>{value}</div>
    </div>
  );
}

const cardStyle = {
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: 18,
  padding: 18,
  boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
};

const titleStyle = {
  fontSize: 24,
  fontWeight: 800,
  marginBottom: 8,
  color: "#111827",
};

const descStyle = {
  color: "#6b7280",
  fontSize: 15,
  marginBottom: 20,
  lineHeight: 1.5,
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
  background: "#003876",
  color: "#fff",
  fontWeight: 800,
  fontSize: 16,
  cursor: "pointer",
};

const secondaryButtonStyle = {
  flex: 1,
  minWidth: 120,
  padding: "13px 14px",
  borderRadius: 12,
  border: "1px solid #d1d5db",
  background: "#fff",
  color: "#111827",
  fontWeight: 700,
  fontSize: 15,
  cursor: "pointer",
};

const darkButtonStyle = {
  flex: 1,
  minWidth: 120,
  padding: "13px 14px",
  borderRadius: 12,
  border: "none",
  background: "#111827",
  color: "#fff",
  fontWeight: 700,
  fontSize: 15,
  cursor: "pointer",
};

const errorBoxStyle = {
  marginBottom: 16,
  padding: 12,
  borderRadius: 12,
  background: "#fef2f2",
  color: "#b91c1c",
  border: "1px solid #fecaca",
  fontSize: 14,
};

const recommendCardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  padding: 16,
  marginBottom: 18,
  background: "#fafafa",
};

const productCardStyle = {
  border: "1px solid #ddd",
  borderRadius: 14,
  padding: 14,
  background: "#fff",
};
