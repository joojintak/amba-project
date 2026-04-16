import { useEffect, useState } from "react";

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

  useEffect(() => {
    if (step === "result") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [step]);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
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
      if (!API_URL) {
        throw new Error("NEXT_PUBLIC_API_URL 환경변수가 없습니다.");
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

  const exportPdf = async () => {
    try {
      const reportEl = document.getElementById("analysis-report");
      if (!reportEl) {
        throw new Error("리포트 영역을 찾을 수 없습니다.");
      }

      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      const hiddenEls = document.querySelectorAll(".no-print");

      hiddenEls.forEach((el) => {
        el.dataset.originalDisplay = el.style.display || "";
        el.style.display = "none";
      });

      const canvas = await html2canvas(reportEl, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        scrollY: -window.scrollY,
      });

      hiddenEls.forEach((el) => {
        el.style.display = el.dataset.originalDisplay;
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const pdfWidth = 210;
      const pdfHeight = 297;

      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save("AMBA_분석보고서.pdf");
    } catch (err) {
      alert(`PDF 생성 오류: ${err.message}`);
    }
  };

  const recommendations = Array.isArray(result?.recommendations)
    ? result.recommendations
    : [];

  const profile =
    result?.profile_summary && typeof result.profile_summary === "object"
      ? result.profile_summary
      : {};

  const overallInterpretation = Array.isArray(result?.overall_interpretation)
    ? result.overall_interpretation
    : [];

  const scores =
    result?.dashboard_scores && typeof result.dashboard_scores === "object"
      ? result.dashboard_scores
      : {};

  const recommendationReasons = buildRecommendationReasons(form, recommendations);

  const scoreGuide = [
    "추천 점수: 현재 생활습관, 건강 목표, 질환 정보를 종합해 계산한 전체 추천 강도입니다.",
    "추천 적합도: 입력된 상태와 추천 영양소가 얼마나 잘 맞는지 보여주는 지표입니다.",
    "생활습관 위험도: 수면, 활동량, 식사 패턴 등 생활요인 중심의 관리 필요 수준입니다.",
    "보완 우선순위: 현재 상태에서 먼저 관리하면 좋은 항목의 선행 순위를 의미합니다.",
  ];

  return (
    <div style={{ background: "#f3f4f6", minHeight: "100vh" }}>
      {loading && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(255,255,255,0.82)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            flexDirection: "column",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              border: "6px solid #dbeafe",
              borderTop: "6px solid #003876",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
          <p style={{ marginTop: 16, fontWeight: 800, color: "#003876" }}>
            건강 정보와 추천 영양소를 분석 중입니다...
          </p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}

      <div style={{ maxWidth: 920, margin: "0 auto", padding: "20px 16px 40px" }}>
        <div
          style={{
            background: "linear-gradient(135deg, #003876 0%, #0a56a8 100%)",
            color: "#fff",
            borderRadius: 24,
            padding: "30px 24px",
            marginBottom: 24,
            boxShadow: "0 14px 34px rgba(0,56,118,0.16)",
          }}
        >
          <div style={{ fontSize: 30, fontWeight: 900, marginBottom: 10 }}>
            AMBA 영양제 추천 앱
          </div>
          <div style={{ lineHeight: 1.7, opacity: 0.96, fontSize: 15 }}>
            건강 정보를 기반으로 추천 영양소, 분석 점수, 상품 링크를 제공합니다.
          </div>
        </div>

        {step === "form" && (
          <div style={mainCardStyle}>
            <h2 style={titleStyle}>건강 정보 입력</h2>
            <p style={descStyle}>
              아래 정보를 입력한 뒤 분석하기를 누르면 결과 페이지로 이동합니다.
            </p>

            {error && <div style={errorBoxStyle}>{error}</div>}

            <Field label="나이">
              <input name="age" value={form.age} onChange={handleChange} style={inputStyle} />
            </Field>

            <Field label="성별">
              <select name="gender" value={form.gender} onChange={handleChange} style={inputStyle}>
                <option value="male">남성</option>
                <option value="female">여성</option>
              </select>
            </Field>

            <Field label="키(cm)">
              <input name="height_cm" value={form.height_cm} onChange={handleChange} style={inputStyle} />
            </Field>

            <Field label="몸무게(kg)">
              <input name="weight_kg" value={form.weight_kg} onChange={handleChange} style={inputStyle} />
            </Field>

            <Field label="활동량">
              <select name="activity" value={form.activity} onChange={handleChange} style={inputStyle}>
                <option value="low">낮음</option>
                <option value="medium">보통</option>
                <option value="high">높음</option>
              </select>
            </Field>

            <Field label="수면시간">
              <input name="sleep" value={form.sleep} onChange={handleChange} style={inputStyle} />
            </Field>

            <Field label="식사 유형">
              <select name="diet" value={form.diet} onChange={handleChange} style={inputStyle}>
                <option value="irregular">불규칙</option>
                <option value="regular">규칙적</option>
                <option value="vegetarian">채식 위주</option>
                <option value="high_protein">고단백</option>
              </select>
            </Field>

            <Field label="질환 (쉼표 구분)">
              <input name="conditions" value={form.conditions} onChange={handleChange} style={inputStyle} />
            </Field>

            <Field label="복용약 (쉼표 구분)">
              <input name="medications" value={form.medications} onChange={handleChange} style={inputStyle} />
            </Field>

            <Field label="건강 목표">
              <select name="goal" value={form.goal} onChange={handleChange} style={inputStyle}>
                <option value="피로 관리">피로 관리</option>
                <option value="면역 관리">면역 관리</option>
                <option value="수면 관리">수면 관리</option>
                <option value="체중 관리">체중 관리</option>
                <option value="운동 보조">운동 보조</option>
              </select>
            </Field>

            <button onClick={handleSubmit} style={primaryButtonStyle}>
              분석하기
            </button>
          </div>
        )}

        {step === "result" && result && (
          <div id="analysis-report" style={mainCardStyle}>
            <h2 style={titleStyle}>분석 결과</h2>
            <p style={descStyle}>
              입력한 건강 정보와 생활 패턴을 바탕으로 구조화된 분석 결과를 정리했습니다.
            </p>

            <div className="no-print" style={{ marginBottom: 16 }}>
              <button onClick={goToForm} style={secondaryButtonStyle}>
                정보 변경하기
              </button>
            </div>

            <div style={topSummaryGridStyle}>
              <SummaryCard title="BMI" value={String(result?.bmi ?? "-")} />
              <SummaryCard title="체형 분류" value={String(result?.bmi_category ?? "-")} />
            </div>

            <div style={sectionBlockStyle}>
              <div style={sectionHeaderStyle}>핵심 분석 대시보드</div>

              <div style={{ display: "grid", gap: 20 }}>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <GaugeCard
                    title="추천 점수"
                    score={scores.recommendation_score || 0}
                    badge={scores.recommendation_badge || "-"}
                  />
                </div>

                <ScoreRow
                  title="추천 적합도"
                  score={scores.suitability_score || 0}
                  badge={scores.suitability_badge || "-"}
                />
                <ScoreRow
                  title="생활습관 위험도"
                  score={scores.lifestyle_risk_score || 0}
                  badge={scores.lifestyle_risk_badge || "-"}
                />
                <ScoreRow
                  title="보완 우선순위"
                  score={scores.priority_score || 0}
                  badge={scores.priority_badge || "-"}
                  fixedColor="#7c3aed"
                />
              </div>
            </div>

            <div style={sectionBlockStyle}>
              <div style={sectionHeaderStyle}>점수 설명 박스</div>
              <ul style={ulStyle}>
                {scoreGuide.map((item, idx) => (
                  <li key={idx} style={liStyle}>{item}</li>
                ))}
              </ul>
            </div>

            <div style={sectionBlockStyle}>
              <div style={sectionHeaderStyle}>추천 근거 요약</div>
              <ul style={ulStyle}>
                {recommendationReasons.map((item, idx) => (
                  <li key={idx} style={liStyle}>{item}</li>
                ))}
              </ul>
            </div>

            <div style={sectionBlockStyle}>
              <div style={sectionHeaderStyle}>개인 프로필 요약</div>
              <ul style={ulStyle}>
                <li style={liStyle}>
                  {profile.age || "-"}세 {profile.gender || "-"}, 키 {profile.height_cm || "-"}cm / 몸무게 {profile.weight_kg || "-"}kg
                </li>
                <li style={liStyle}>
                  활동량: {profile.activity || "-"}, 수면시간: {profile.sleep || "-"}시간
                </li>
                <li style={liStyle}>식사 유형: {profile.diet || "-"}</li>
                <li style={liStyle}>
                  질환 정보: {Array.isArray(profile.conditions) && profile.conditions.length ? profile.conditions.join(", ") : "입력 없음"}
                </li>
                <li style={liStyle}>
                  복용약 정보: {Array.isArray(profile.medications) && profile.medications.length ? profile.medications.join(", ") : "입력 없음"}
                </li>
                <li style={liStyle}>건강 목표: {profile.goal || "-"}</li>
              </ul>
            </div>

            <div style={sectionBlockStyle}>
              <div style={sectionHeaderStyle}>종합 해석</div>
              <ul style={ulStyle}>
                {overallInterpretation.length > 0 ? (
                  overallInterpretation.map((item, idx) => (
                    <li key={idx} style={liStyle}>{item}</li>
                  ))
                ) : (
                  <li style={liStyle}>종합 해석 정보가 없습니다.</li>
                )}
              </ul>
            </div>

            {recommendations.length === 0 && (
              <div style={errorBoxStyle}>추천 결과가 비어 있습니다.</div>
            )}

            {recommendations.map((rec, idx) => (
              <div key={idx} style={recommendCardStyle}>
                <div style={recommendTitleRowStyle}>
                  <div style={rankBadgeStyle}>우선순위 {idx + 1}</div>
                  <div style={{ fontSize: 24, fontWeight: 900 }}>{rec?.nutrient || "추천 영양소"}</div>
                  <div style={smallScoreBadgeStyle}>점수 {rec?.score ?? "-"}</div>
                </div>

                <InfoRow label="추천 이유" value={rec?.reason || "-"} />
                <InfoRow label="기대 역할" value={Array.isArray(rec?.benefits) ? rec.benefits.join(" / ") : "-"} />
                <InfoRow label="식품 기반 보완" value={Array.isArray(rec?.food_sources) ? rec.food_sources.join(", ") : "-"} />
                <InfoRow label="주의사항" value={Array.isArray(rec?.cautions) ? rec.cautions.join(" / ") : "-"} />

                <div style={subSectionStyle}>
                  <div style={subSectionHeaderStyle}>추천 상품</div>
                  <div style={productGridStyle}>
                    {(Array.isArray(rec?.sample_products) ? rec.sample_products : []).map((p, i) => (
                      <div key={i} style={productCardStyle}>
                        {p?.image_url ? (
                          <img
                            src={p.image_url}
                            alt={p?.title || "product"}
                            style={productImageStyle}
                          />
                        ) : null}

                        <div style={productTitleStyle}>
                          {p?.title || "상품명 없음"}
                        </div>

                        <div style={productMallStyle}>
                          판매처: {p?.mall_name || "-"}
                        </div>

                        <div style={productPriceStyle}>
                          {typeof p?.price_krw !== "undefined" ? `${p.price_krw}원` : "-"}
                        </div>

                        {p?.url ? (
                          <a
                            href={p.url}
                            target="_blank"
                            rel="noreferrer"
                            style={buyButtonStyle}
                          >
                            구매 링크
                          </a>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            <div
              className="no-print"
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}
            >
              <button onClick={goToForm} style={secondaryButtonStyle}>
                정보 변경하기
              </button>
              <button onClick={exportPdf} style={darkButtonStyle}>
                PDF 리포트 다운로드
              </button>
            </div>

            <div
              style={{
                padding: 12,
                background: "#f9fafb",
                borderRadius: 12,
                color: "#6b7280",
                fontSize: 13,
                lineHeight: 1.6,
              }}
            >
              {result?.disclaimer || "본 결과는 건강 정보 제공용이며, 의사의 진단·치료·처방을 대체하지 않습니다."}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function buildRecommendationReasons(form, recommendations) {
  const items = [];

  if (Number(form.sleep) < 6) {
    items.push("수면 시간이 짧아 회복과 피로 관리 관련 영양소 우선순위가 높아질 수 있습니다.");
  }
  if (form.activity === "low") {
    items.push("활동량이 낮아 실내 생활형 보완 영양소가 상위에 반영될 수 있습니다.");
  }
  if (form.diet === "irregular") {
    items.push("식사 패턴이 불규칙하여 기본 영양 균형 보완 필요성이 높아질 수 있습니다.");
  }
  if (form.conditions) {
    items.push(`입력한 질환 정보(${form.conditions})를 반영해 추천 우선순위를 조정했습니다.`);
  }
  if (form.goal) {
    items.push(`건강 목표인 "${form.goal}"을 중심으로 적합도와 우선순위를 계산했습니다.`);
  }
  if (recommendations.length > 0) {
    items.push(`현재 입력 조건 기준 상위 추천 영양소는 ${recommendations.map((r) => r.nutrient).join(", ")} 입니다.`);
  }

  return items.length ? items : ["입력된 정보를 기준으로 기본 생활 패턴형 분석을 수행했습니다."];
}

function Field({ label, children }) {
  return (
    <div style={fieldCardStyle}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

function SummaryCard({ title, value }) {
  return (
    <div style={summaryCardStyle}>
      <div style={{ color: "#6b7280", fontSize: 14, marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 20, fontWeight: 800 }}>{value}</div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={{ marginBottom: 8, lineHeight: 1.7 }}>
      <strong>{label}:</strong> {value}
    </div>
  );
}

function GaugeCard({ title, score, badge }) {
  const safeScore = Math.max(0, Math.min(100, Number(score || 0)));

  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 12 }}>{title}</div>
      <div
        style={{
          width: 170,
          height: 170,
          borderRadius: "50%",
          background: `conic-gradient(#003876 ${safeScore * 3.6}deg, #e5e7eb 0deg)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 12px",
          boxShadow: "0 8px 18px rgba(0,56,118,0.12)",
        }}
      >
        <div
          style={{
            width: 126,
            height: 126,
            borderRadius: "50%",
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            boxShadow: "inset 0 0 0 1px #e5e7eb",
          }}
        >
          <div style={{ fontSize: 32, fontWeight: 900, color: "#003876" }}>{safeScore}</div>
          <div style={{ fontSize: 13, color: "#6b7280" }}>점</div>
        </div>
      </div>
      <Badge text={badge} color={getRiskColor(safeScore)} />
    </div>
  );
}

function ScoreRow({ title, score, badge, fixedColor }) {
  const safeScore = Math.max(0, Math.min(100, Number(score || 0)));
  const barColor = fixedColor || getRiskColor(safeScore);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, gap: 12, flexWrap: "wrap" }}>
        <div style={{ fontWeight: 800 }}>{title}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontWeight: 800 }}>{safeScore}점</span>
          <Badge text={badge} color={barColor} />
        </div>
      </div>
      <div style={scoreTrackStyle}>
        <div
          style={{
            width: `${safeScore}%`,
            height: "100%",
            background: barColor,
          }}
        />
      </div>
    </div>
  );
}

function Badge({ text, color = "#003876" }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "6px 10px",
        borderRadius: 999,
        background: `${color}15`,
        color,
        fontWeight: 800,
        fontSize: 13,
      }}
    >
      {text}
    </span>
  );
}

function getRiskColor(score) {
  if (score >= 80) return "#b91c1c";
  if (score >= 50) return "#d97706";
  return "#15803d";
}

const mainCardStyle = {
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: 22,
  padding: 20,
  boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
};

const titleStyle = {
  fontSize: 26,
  fontWeight: 900,
  marginBottom: 8,
  color: "#111827",
};

const descStyle = {
  color: "#6b7280",
  fontSize: 15,
  marginBottom: 20,
  lineHeight: 1.6,
};

const fieldCardStyle = {
  background: "#f9fafb",
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  padding: 14,
  marginBottom: 14,
};

const labelStyle = {
  display: "block",
  fontWeight: 800,
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
  background: "#003876",
  color: "#fff",
  fontWeight: 900,
  fontSize: 16,
  cursor: "pointer",
  boxShadow: "0 8px 18px rgba(0,56,118,0.18)",
};

const secondaryButtonStyle = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: 12,
  border: "1px solid #d1d5db",
  background: "#fff",
  color: "#111827",
  fontWeight: 800,
  fontSize: 15,
  cursor: "pointer",
};

const darkButtonStyle = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: 12,
  border: "none",
  background: "#111827",
  color: "#fff",
  fontWeight: 800,
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

const sectionBlockStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  padding: 16,
  background: "#fafafa",
  marginBottom: 18,
};

const sectionHeaderStyle = {
  fontSize: 18,
  fontWeight: 900,
  marginBottom: 12,
  color: "#111827",
};

const ulStyle = {
  margin: 0,
  paddingLeft: 18,
};

const liStyle = {
  marginBottom: 8,
  lineHeight: 1.65,
};

const recommendCardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 18,
  padding: 16,
  marginBottom: 18,
  background: "#fafafa",
  boxShadow: "0 4px 10px rgba(0,0,0,0.03)",
};

const productGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: 12,
  marginTop: 12,
};

const productCardStyle = {
  border: "1px solid #ddd",
  borderRadius: 16,
  padding: 14,
  background: "#fff",
  boxShadow: "0 3px 10px rgba(0,0,0,0.03)",
};

const productImageStyle = {
  width: "100%",
  height: 180,
  objectFit: "contain",
  borderRadius: 12,
  background: "#fff",
  marginBottom: 12,
};

const productTitleStyle = {
  fontWeight: 900,
  fontSize: 16,
  marginBottom: 8,
  lineHeight: 1.5,
};

const productMallStyle = {
  color: "#6b7280",
  marginBottom: 6,
};

const productPriceStyle = {
  fontSize: 18,
  fontWeight: 900,
  marginBottom: 12,
};

const buyButtonStyle = {
  display: "block",
  textAlign: "center",
  padding: "12px 14px",
  borderRadius: 12,
  background: "#003876",
  color: "#fff",
  textDecoration: "none",
  fontWeight: 900,
};

const rankBadgeStyle = {
  display: "inline-block",
  padding: "6px 10px",
  borderRadius: 999,
  background: "#dbeafe",
  color: "#003876",
  fontWeight: 900,
  fontSize: 13,
};

const smallScoreBadgeStyle = {
  display: "inline-block",
  padding: "6px 10px",
  borderRadius: 999,
  background: "#ede9fe",
  color: "#6d28d9",
  fontWeight: 900,
  fontSize: 13,
};

const summaryCardStyle = {
  background: "#f9fafb",
  borderRadius: 16,
  padding: 16,
  border: "1px solid #e5e7eb",
};

const topSummaryGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 16,
  marginBottom: 18,
};

const recommendTitleRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  flexWrap: "wrap",
  marginBottom: 12,
};

const subSectionStyle = {
  marginTop: 14,
  borderTop: "1px solid #e5e7eb",
  paddingTop: 14,
};

const subSectionHeaderStyle = {
  fontSize: 16,
  fontWeight: 900,
  marginBottom: 8,
  color: "#111827",
};

const scoreTrackStyle = {
  height: 14,
  background: "#e5e7eb",
  borderRadius: 999,
  overflow: "hidden",
};
