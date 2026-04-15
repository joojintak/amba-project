import { useState } from 'react';

const initialForm = {
  age: 35,
  gender: 'male',
  height_cm: 175,
  weight_kg: 75,
  activity_level: 'low',
  sleep_hours: 5,
  diet_type: 'balanced',
  smoking: false,
  drinking: false,
  conditions: '고혈압',
  medications: '',
  goal: '피로 관리'
};

export default function Home() {
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const payload = {
        ...form,
        age: Number(form.age),
        height_cm: Number(form.height_cm),
        weight_kg: Number(form.weight_kg),
        sleep_hours: Number(form.sleep_hours),
        conditions: form.conditions ? form.conditions.split(',').map((v) => v.trim()).filter(Boolean) : [],
        medications: form.medications ? form.medications.split(',').map((v) => v.trim()).filter(Boolean) : [],
      };

      const res = await fetch('http://127.0.0.1:8000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('분석 요청에 실패했습니다.');
      }
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err.message || '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="hero">
        <h1>AMBA 영양제 추천 앱</h1>
        <p>건강 정보 입력 후 추천 영양소와 구매 링크를 확인하세요.</p>
      </div>

      <div className="grid">
        <form className="card" onSubmit={submit}>
          <h2>건강 정보 입력</h2>
          <div className="field-row">
            <label>나이<input name="age" type="number" value={form.age} onChange={handleChange} /></label>
            <label>성별
              <select name="gender" value={form.gender} onChange={handleChange}>
                <option value="male">남성</option>
                <option value="female">여성</option>
              </select>
            </label>
          </div>
          <div className="field-row">
            <label>키(cm)<input name="height_cm" type="number" value={form.height_cm} onChange={handleChange} /></label>
            <label>몸무게(kg)<input name="weight_kg" type="number" value={form.weight_kg} onChange={handleChange} /></label>
          </div>
          <div className="field-row">
            <label>활동량
              <select name="activity_level" value={form.activity_level} onChange={handleChange}>
                <option value="low">낮음</option>
                <option value="moderate">보통</option>
                <option value="high">높음</option>
              </select>
            </label>
            <label>수면시간<input name="sleep_hours" type="number" step="0.5" value={form.sleep_hours} onChange={handleChange} /></label>
          </div>
          <label>식사 유형
            <select name="diet_type" value={form.diet_type} onChange={handleChange}>
              <option value="balanced">균형식</option>
              <option value="vegetarian">채식</option>
              <option value="vegan">비건</option>
              <option value="irregular">불규칙 식사</option>
            </select>
          </label>
          <label>현재 질환(쉼표로 구분)
            <input name="conditions" value={form.conditions} onChange={handleChange} placeholder="예: 고혈압, 고지혈증" />
          </label>
          <label>복용약(쉼표로 구분)
            <input name="medications" value={form.medications} onChange={handleChange} placeholder="예: 혈압약" />
          </label>
          <label>건강 목표
            <input name="goal" value={form.goal} onChange={handleChange} placeholder="예: 피로 관리" />
          </label>
          <div className="check-row">
            <label><input name="smoking" type="checkbox" checked={form.smoking} onChange={handleChange} /> 흡연</label>
            <label><input name="drinking" type="checkbox" checked={form.drinking} onChange={handleChange} /> 음주</label>
          </div>
          <button type="submit" disabled={loading}>{loading ? '분석 중...' : '분석하기'}</button>
          {error && <p className="error">{error}</p>}
        </form>

        <div className="card">
          <h2>분석 결과</h2>
          {!result && <p>왼쪽 입력 후 분석하기를 눌러 주세요.</p>}
          {result && (
            <div>
              <p><strong>BMI:</strong> {result.bmi} ({result.bmi_category})</p>
              <p className="disclaimer">{result.disclaimer}</p>
              {result.recommendations.map((item) => (
                <div key={item.nutrient} className="result-card">
                  <h3>{item.nutrient}</h3>
                  <p><strong>추천 이유:</strong> {item.reason}</p>
                  <p><strong>식품 예시:</strong> {item.food_sources.join(', ')}</p>
                  <ul>
                    {item.cautions.map((c, idx) => <li key={idx}>{c}</li>)}
                  </ul>
                  <div className="products">
                    {item.sample_products.map((p) => (
                      <a key={p.title} href={p.url} target="_blank" rel="noreferrer" className="product">
                        <img src={p.image_url} alt={p.title} />
                        <div>
                          <strong>{p.title}</strong>
                          <p>{p.mall_name}</p>
                          <p>{p.price_krw.toLocaleString()}원</p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
