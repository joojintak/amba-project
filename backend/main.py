from fastapi import FastAPI
from pydantic import BaseModel
from typing import List

from services.recommender import recommend_nutrients
from services.naver_api import search_naver_products
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="AMBA Supplement Recommender API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalyzeRequest(BaseModel):
    age: int
    gender: str
    height_cm: float
    weight_kg: float
    activity: str
    sleep: int
    diet: str
    conditions: List[str] = []
    medications: List[str] = []
    goal: str = ""


@app.get("/")
def root():
    return {"message": "AMBA backend is running"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/analyze")
def analyze(req: AnalyzeRequest):
    bmi = req.weight_kg / ((req.height_cm / 100) ** 2)

    if bmi < 18.5:
        bmi_category = "underweight"
    elif bmi < 23:
        bmi_category = "normal"
    elif bmi < 25:
        bmi_category = "overweight"
    else:
        bmi_category = "obese"

    user = req.model_dump()
    nutrient_items = recommend_nutrients(user)

    profile_summary = {
        "age": req.age,
        "gender": "남성" if req.gender == "male" else "여성",
        "height_cm": req.height_cm,
        "weight_kg": req.weight_kg,
        "activity": req.activity,
        "sleep": req.sleep,
        "diet": req.diet,
        "conditions": req.conditions,
        "medications": req.medications,
        "goal": req.goal,
    }

    overall_interpretation = []

    if bmi < 18.5:
        overall_interpretation.append("BMI 기준으로는 저체중 범주에 가까워 기본 영양 균형을 함께 검토할 필요가 있습니다.")
    elif bmi < 23:
        overall_interpretation.append("BMI 기준으로는 비교적 안정 범주이며 생활 패턴 기반 보완이 중심이 됩니다.")
    elif bmi < 25:
        overall_interpretation.append("BMI 기준으로는 과체중 경계 영역에 가까워 체중 관리와 생활 습관 보완을 함께 고려할 수 있습니다.")
    else:
        overall_interpretation.append("BMI 기준으로는 체중 관리와 생활 패턴 개선을 함께 검토하는 것이 적절합니다.")

    if req.sleep < 6:
        overall_interpretation.append("수면 시간이 짧아 회복과 피로 관리 관련 영양소가 우선 추천될 가능성이 높습니다.")

    if req.activity == "low":
        overall_interpretation.append("활동량이 낮은 편으로 입력되어 실내 생활 패턴형 영양소가 상위에 반영될 수 있습니다.")

    if req.goal:
        overall_interpretation.append(f'건강 목표인 "{req.goal}"을 중심으로 추천 우선순위를 구성했습니다.')

    recommendations = []
    for item in nutrient_items[:3]:
        nutrient = item["name"]
        products = search_naver_products(nutrient)

        recommendations.append({
            "nutrient": nutrient,
            "score": item["score"],
            "reason": " / ".join(item["reasons"]) if item["reasons"] else f"{nutrient} 보충 검토가 필요한 조건으로 분석되었습니다.",
            "benefits": item.get("benefits", []),
            "food_sources": item.get("food_sources", []),
            "cautions": item.get("cautions", []),
            "practical_notes": [
                "영양제 선택 전 성분 함량과 1일 섭취량을 함께 확인하는 것이 좋습니다.",
                "복합 성분 제품은 중복 섭취 여부를 확인하는 것이 좋습니다.",
                "질환 또는 복용약이 있는 경우 개인 상태에 맞는 확인이 필요합니다."
            ],
            "sample_products": products
        })

    return {
        "bmi": round(bmi, 2),
        "bmi_category": bmi_category,
        "profile_summary": profile_summary,
        "overall_interpretation": overall_interpretation,
        "recommendations": recommendations,
        "disclaimer": "본 결과는 건강 정보 제공용이며, 의사의 진단·치료·처방을 대체하지 않습니다."
    }
