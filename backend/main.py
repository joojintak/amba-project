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

    recommendations = []
    for item in nutrient_items[:3]:
        nutrient = item["name"]
        products = search_naver_products(nutrient)

        recommendations.append({
            "nutrient": nutrient,
            "score": item["score"],
            "reason": " / ".join(item["reasons"]) if item["reasons"] else f"{nutrient} 보충 검토가 필요한 조건으로 분석되었습니다.",
            "food_sources": ["식품으로도 보충 가능", "균형 잡힌 식사 병행 권장"],
            "cautions": ["복용 전 개인 상태 확인 필요"],
            "sample_products": products
        })

    return {
        "bmi": round(bmi, 2),
        "bmi_category": bmi_category,
        "recommendations": recommendations,
        "disclaimer": "본 결과는 건강 정보 제공용이며, 의사의 진단·치료·처방을 대체하지 않습니다."
    }
