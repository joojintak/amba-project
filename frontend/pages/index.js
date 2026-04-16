import { useState } from "react";

export default function Home() {
  const [form, setForm] = useState({
    age: "",
    gender: "male",
    height_cm: "",
    weight_kg: "",
    activity: "low",
    sleep_hours: "",
    diet: "normal",
    conditions: "",
    goal: ""
  });

  const [result, setResult] = useState(null);
  const [page, setPage] = useState("input");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const analyze = async () => {
    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ...form,
        conditions: form.conditions.split(","),
        medications: []
      })
    });

    const data = await res.json();
    setResult(data);
    setPage("result");
  };

  return (
    <div style={{ fontFamily: "sans-serif", background: "#f4f6f9", minHeight: "100vh" }}>
      
      {/* HEADER */}
      <div style={{
        background: "#003876",
        color: "white",
        padding: "20px",
        textAlign: "center",
        fontSize: "20px",
        fontWeight: "bold"
      }}>
        AMBA Supplement Recommendation
      </div>

      {/* INPUT PAGE */}
      {page === "input" && (
        <div style={{ maxWidth: "500px", margin: "30px auto", background: "white", padding: "25px", borderRadius: "10px" }}>
          
          <h2>건강 정보 입력</h2>

          <input name="age" placeholder="나이" onChange={handleChange} style={inputStyle}/>
          
          <select name="gender" onChange={handleChange} style={inputStyle}>
            <option value="male">남성</option>
            <option value="female">여성</option>
          </select>

          <input name="height_cm" placeholder="키 (cm)" onChange={handleChange} style={inputStyle}/>
          <input name="weight_kg" placeholder="몸무게 (kg)" onChange={handleChange} style={inputStyle}/>

          <select name="activity" onChange={handleChange} style={inputStyle}>
            <option value="low">활동 적음</option>
            <option value="medium">보통</option>
            <option value="high">활동 많음</option>
          </select>

          <input name="sleep_hours" placeholder="수면시간" onChange={handleChange} style={inputStyle}/>

          <select name="diet" onChange={handleChange} style={inputStyle}>
            <option value="normal">일반식</option>
            <option value="vegetarian">채식</option>
          </select>

          <input name="conditions" placeholder="질환 (콤마구분)" onChange={handleChange} style={inputStyle}/>
          <input name="goal" placeholder="목표 (예: 피로개선)" onChange={handleChange} style={inputStyle}/>

          <button onClick={analyze} style={buttonStyle}>
            분석하기
          </button>
        </div>
      )}

      {/* RESULT PAGE */}
      {page === "result" && result && (
        <div style={{ maxWidth: "600px", margin: "30px auto" }}>

          <div style={cardStyle}>
            <h2>BMI: {result.bmi} ({result.bmi_category})</h2>
          </div>

          {result.recommendations.map((r, idx) => (
            <div key={idx} style={cardStyle}>
              <h3>{r.nutrient}</h3>
              <p>{r.reason}</p>
              <p style={{ color: "red" }}>{r.cautions.join(", ")}</p>

              {r.sample_products.map((p, i) => (
                <div key={i} style={{ marginTop: "10px" }}>
                  <img src={p.image_url} width="100%" />
                  <p>{p.title}</p>
                  <p>{p.price_krw}원</p>
                  <a href={p.url} target="_blank">
                    <button style={buttonStyle}>구매하기</button>
                  </a>
                </div>
              ))}
            </div>
          ))}

          <button onClick={() => setPage("input")} style={buttonStyle}>
            정보 수정하기
          </button>
        </div>
      )}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginBottom: "10px",
  borderRadius: "5px",
  border: "1px solid #ccc"
};

const buttonStyle = {
  width: "100%",
  padding: "12px",
  background: "#003876",
  color: "white",
  border: "none",
  borderRadius: "5px",
  marginTop: "10px",
  cursor: "pointer"
};

const cardStyle = {
  background: "white",
  padding: "20px",
  marginBottom: "15px",
  borderRadius: "10px"
};
