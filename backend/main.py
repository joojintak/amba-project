from typing import List, Dict
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title='AMBA Supplement Recommender API', version='1.0.0')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


class AnalyzeRequest(BaseModel):
    age: int = Field(ge=1, le=120)
    gender: str
    height_cm: float = Field(ge=50, le=250)
    weight_kg: float = Field(ge=20, le=300)
    activity_level: str = 'moderate'
    sleep_hours: float = Field(ge=0, le=24)
    diet_type: str = 'balanced'
    smoking: bool = False
    drinking: bool = False
    conditions: List[str] = []
    medications: List[str] = []
    goal: str = 'general_health'


class Product(BaseModel):
    title: str
    mall_name: str
    price_krw: int
    url: str
    image_url: str


class NutrientRecommendation(BaseModel):
    nutrient: str
    score: int
    reason: str
    food_sources: List[str]
    cautions: List[str]
    sample_products: List[Product]


class AnalyzeResponse(BaseModel):
    bmi: float
    bmi_category: str
    recommendations: List[NutrientRecommendation]
    disclaimer: str


PRODUCTS: Dict[str, List[Product]] = {
    '비타민D': [
        Product(title='비타민D 2000IU 90정', mall_name='Naver Mall A', price_krw=12900, url='https://shopping.naver.com/', image_url='https://via.placeholder.com/120?text=Vitamin+D'),
        Product(title='비타민D 1000IU 180정', mall_name='Naver Mall B', price_krw=15800, url='https://shopping.naver.com/', image_url='https://via.placeholder.com/120?text=Vitamin+D'),
        Product(title='프리미엄 비타민D', mall_name='Coupang', price_krw=17900, url='https://www.coupang.com/', image_url='https://via.placeholder.com/120?text=Vitamin+D'),
    ],
    '마그네슘': [
        Product(title='마그네슘 350mg 90정', mall_name='Naver Mall A', price_krw=14900, url='https://shopping.naver.com/', image_url='https://via.placeholder.com/120?text=Magnesium'),
        Product(title='마그네슘 + 비타민B6', mall_name='Naver Mall B', price_krw=18900, url='https://shopping.naver.com/', image_url='https://via.placeholder.com/120?text=Magnesium'),
        Product(title='고흡수 마그네슘', mall_name='Coupang', price_krw=20900, url='https://www.coupang.com/', image_url='https://via.placeholder.com/120?text=Magnesium'),
    ],
    '오메가3': [
        Product(title='rTG 오메가3 60캡슐', mall_name='Naver Mall A', price_krw=21900, url='https://shopping.naver.com/', image_url='https://via.placeholder.com/120?text=Omega3'),
        Product(title='고함량 오메가3', mall_name='Naver Mall B', price_krw=24900, url='https://shopping.naver.com/', image_url='https://via.placeholder.com/120?text=Omega3'),
        Product(title='오메가3 1000mg', mall_name='Coupang', price_krw=25900, url='https://www.coupang.com/', image_url='https://via.placeholder.com/120?text=Omega3'),
    ],
    '철분': [
        Product(title='철분 25mg 60정', mall_name='Naver Mall A', price_krw=9900, url='https://shopping.naver.com/', image_url='https://via.placeholder.com/120?text=Iron'),
        Product(title='철분 + 엽산', mall_name='Naver Mall B', price_krw=13900, url='https://shopping.naver.com/', image_url='https://via.placeholder.com/120?text=Iron'),
        Product(title='액상 철분', mall_name='Coupang', price_krw=16500, url='https://www.coupang.com/', image_url='https://via.placeholder.com/120?text=Iron'),
    ],
    '비타민B군': [
        Product(title='활성형 비타민B 컴플렉스', mall_name='Naver Mall A', price_krw=16900, url='https://shopping.naver.com/', image_url='https://via.placeholder.com/120?text=Vitamin+B'),
        Product(title='고함량 비타민B', mall_name='Naver Mall B', price_krw=19800, url='https://shopping.naver.com/', image_url='https://via.placeholder.com/120?text=Vitamin+B'),
        Product(title='비타민B 100정', mall_name='Coupang', price_krw=14900, url='https://www.coupang.com/', image_url='https://via.placeholder.com/120?text=Vitamin+B'),
    ],
}

NUTRIENT_META = {
    '비타민D': {
        'food_sources': ['연어', '계란 노른자', '강화 우유'],
        'cautions': ['신장질환이 있으면 전문가와 상담이 필요할 수 있습니다.', '과다 복용은 피해야 합니다.'],
    },
    '마그네슘': {
        'food_sources': ['견과류', '콩류', '시금치'],
        'cautions': ['설사를 유발할 수 있습니다.', '신기능이 저하된 경우 상담이 필요할 수 있습니다.'],
    },
    '오메가3': {
        'food_sources': ['고등어', '연어', '참치'],
        'cautions': ['항응고제 복용 중이면 전문가와 상담이 필요할 수 있습니다.', '수술 전후 복용은 주의가 필요할 수 있습니다.'],
    },
    '철분': {
        'food_sources': ['붉은 고기', '콩류', '시금치'],
        'cautions': ['변비가 생길 수 있습니다.', '철 과다 상태에서는 복용을 피해야 합니다.'],
    },
    '비타민B군': {
        'food_sources': ['육류', '통곡물', '달걀'],
        'cautions': ['균형 잡힌 식사와 함께 고려해야 합니다.', '특정 질환이 있으면 상담이 필요할 수 있습니다.'],
    },
}


def calculate_bmi(height_cm: float, weight_kg: float) -> float:
    height_m = height_cm / 100
    return round(weight_kg / (height_m * height_m), 1)


def bmi_category(bmi: float) -> str:
    if bmi < 18.5:
        return '저체중'
    if bmi < 23:
        return '정상'
    if bmi < 25:
        return '과체중'
    return '비만'


def add_score(scores: Dict[str, int], reasons: Dict[str, List[str]], nutrient: str, value: int, reason: str) -> None:
    scores[nutrient] = scores.get(nutrient, 0) + value
    reasons.setdefault(nutrient, []).append(reason)


@app.get('/')
def root() -> Dict[str, str]:
    return {'message': 'AMBA Supplement Recommender API is running.'}


@app.get('/health')
def health() -> Dict[str, str]:
    return {'status': 'ok'}


@app.post('/analyze', response_model=AnalyzeResponse)
def analyze(payload: AnalyzeRequest) -> AnalyzeResponse:
    bmi = calculate_bmi(payload.height_cm, payload.weight_kg)
    scores: Dict[str, int] = {}
    reasons: Dict[str, List[str]] = {}

    if payload.activity_level in ['low', 'sedentary']:
        add_score(scores, reasons, '비타민D', 2, '실내 활동이 많아 비타민D를 검토할 수 있습니다.')
    if payload.sleep_hours < 6:
        add_score(scores, reasons, '마그네슘', 2, '수면 시간이 짧아 마그네슘을 검토할 수 있습니다.')
        add_score(scores, reasons, '비타민B군', 1, '피로 관리 측면에서 비타민B군을 검토할 수 있습니다.')
    if payload.diet_type in ['vegan', 'vegetarian']:
        add_score(scores, reasons, '철분', 2, '식사 유형상 철분 섭취를 점검할 필요가 있을 수 있습니다.')
        add_score(scores, reasons, '비타민B군', 1, '식사 유형상 비타민B군을 함께 검토할 수 있습니다.')
    if payload.drinking:
        add_score(scores, reasons, '비타민B군', 2, '음주 습관이 있으면 비타민B군 섭취를 점검할 수 있습니다.')
    if payload.smoking:
        add_score(scores, reasons, '비타민B군', 1, '흡연 습관이 있으면 영양 균형 점검이 필요할 수 있습니다.')
    if payload.age >= 50:
        add_score(scores, reasons, '비타민D', 1, '연령대를 고려해 비타민D를 검토할 수 있습니다.')
        add_score(scores, reasons, '오메가3', 1, '연령대를 고려해 오메가3를 검토할 수 있습니다.')
    if payload.gender.lower() in ['female', 'woman', '여성'] and 19 <= payload.age <= 49:
        add_score(scores, reasons, '철분', 1, '연령 및 성별 특성상 철분을 검토할 수 있습니다.')

    lowered_conditions = [c.lower() for c in payload.conditions]
    lowered_medications = [m.lower() for m in payload.medications]

    if any('고혈압' in c for c in payload.conditions):
        add_score(scores, reasons, '오메가3', 2, '생활 관리 측면에서 오메가3를 검토할 수 있습니다.')
    if any('피로' in payload.goal for _ in [0]):
        add_score(scores, reasons, '비타민B군', 2, '목표가 피로 관리이므로 비타민B군을 검토할 수 있습니다.')
        add_score(scores, reasons, '마그네슘', 1, '목표가 피로 관리이므로 마그네슘을 함께 검토할 수 있습니다.')
    if bmi >= 25:
        add_score(scores, reasons, '오메가3', 1, '체중 상태를 고려해 생활습관 관리와 함께 오메가3를 검토할 수 있습니다.')

    ranked = sorted(scores.items(), key=lambda x: x[1], reverse=True)[:3]
    recommendations: List[NutrientRecommendation] = []

    for nutrient, score in ranked:
        meta = NUTRIENT_META.get(nutrient, {'food_sources': [], 'cautions': []})
        cautions = list(meta['cautions'])
        if nutrient == '오메가3' and any('항응고' in m or 'warfarin' in m for m in lowered_medications):
            cautions.insert(0, '항응고제 복용 중이면 복용 전 반드시 전문가와 상의해야 합니다.')
        recommendations.append(
            NutrientRecommendation(
                nutrient=nutrient,
                score=score,
                reason=' '.join(reasons.get(nutrient, [])),
                food_sources=meta['food_sources'],
                cautions=cautions,
                sample_products=PRODUCTS.get(nutrient, []),
            )
        )

    if not recommendations:
        recommendations.append(
            NutrientRecommendation(
                nutrient='기본 영양 점검',
                score=1,
                reason='입력 정보 기준으로 균형 잡힌 식사와 기본 건강관리를 우선 점검해 볼 수 있습니다.',
                food_sources=['채소', '과일', '단백질 식품'],
                cautions=['질환이 있거나 약물을 복용 중이면 전문가와 상담이 필요합니다.'],
                sample_products=[],
            )
        )

    return AnalyzeResponse(
        bmi=bmi,
        bmi_category=bmi_category(bmi),
        recommendations=recommendations,
        disclaimer='본 결과는 건강 정보 제공용이며, 의사의 진단·치료·처방을 대체하지 않습니다.'
    )
