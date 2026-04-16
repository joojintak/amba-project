NUTRIENT_DB = {
    "비타민D": {
        "benefits": [
            "뼈 건강과 근육 기능 유지에 도움을 줄 수 있습니다.",
            "실내 활동 비중이 높은 경우 우선 검토되는 영양소입니다."
        ],
        "food_sources": ["연어", "달걀노른자", "강화우유", "버섯류"],
        "cautions": [
            "과다 섭취는 피하는 것이 좋습니다.",
            "기저 질환이 있는 경우 개인 상태에 맞는 확인이 필요합니다."
        ]
    },
    "마그네슘": {
        "benefits": [
            "신경·근육 기능 유지와 피로 관리 관점에서 자주 검토됩니다.",
            "수면 부족이나 스트레스가 있는 경우 함께 고려될 수 있습니다."
        ],
        "food_sources": ["견과류", "콩류", "통곡물", "시금치"],
        "cautions": [
            "개인에 따라 위장 불편감이 있을 수 있습니다.",
            "복용 중인 약이 있다면 함께 확인하는 것이 좋습니다."
        ]
    },
    "오메가3": {
        "benefits": [
            "지방산 보충 관점에서 자주 검토되는 영양소입니다.",
            "중년 이후 또는 혈압 관리 관심군에서 함께 고려될 수 있습니다."
        ],
        "food_sources": ["고등어", "연어", "정어리", "참치"],
        "cautions": [
            "복용약이 있는 경우 개인별 확인이 필요합니다.",
            "제품별 EPA/DHA 함량 차이를 확인하는 것이 좋습니다."
        ]
    },
    "비타민B군": {
        "benefits": [
            "에너지 대사와 피로 관리 관점에서 자주 고려됩니다.",
            "식사 패턴이 불규칙한 경우 기본 보완 후보가 될 수 있습니다."
        ],
        "food_sources": ["육류", "계란", "유제품", "통곡물"],
        "cautions": [
            "복합 성분 제품은 구성 성분을 함께 확인하는 것이 좋습니다."
        ]
    },
    "칼슘": {
        "benefits": [
            "뼈 건강 관점에서 중요하게 검토되는 영양소입니다."
        ],
        "food_sources": ["우유", "치즈", "멸치", "두부"],
        "cautions": [
            "비타민D와 함께 균형 있게 보는 경우가 많습니다."
        ]
    },
    "철분": {
        "benefits": [
            "철분 섭취가 부족할 가능성이 있는 경우 우선 검토됩니다."
        ],
        "food_sources": ["붉은 고기", "간", "콩류", "시금치"],
        "cautions": [
            "개인 상태에 따라 적절성 확인이 필요합니다."
        ]
    },
    "엽산": {
        "benefits": [
            "여성 건강 관점에서 함께 고려될 수 있습니다."
        ],
        "food_sources": ["녹색 잎채소", "콩류", "오렌지"],
        "cautions": [
            "다른 비타민군과 함께 포함된 제품인지 확인하는 것이 좋습니다."
        ]
    },
    "비타민B12": {
        "benefits": [
            "채식 위주 식단에서 우선적으로 검토될 수 있습니다."
        ],
        "food_sources": ["달걀", "유제품", "생선", "육류"],
        "cautions": [
            "식단 패턴에 따라 필요성이 달라질 수 있습니다."
        ]
    },
    "비타민C": {
        "benefits": [
            "면역 관리 목표에서 자주 고려되는 영양소입니다."
        ],
        "food_sources": ["귤", "오렌지", "키위", "브로콜리"],
        "cautions": [
            "복합 제품인지 단일 성분인지 확인하는 것이 좋습니다."
        ]
    },
    "아연": {
        "benefits": [
            "면역 관련 영양소로 함께 검토되는 경우가 많습니다."
        ],
        "food_sources": ["굴", "육류", "견과류", "콩류"],
        "cautions": [
            "다른 미네랄과 중복 섭취 여부를 확인하는 것이 좋습니다."
        ]
    },
    "멀티비타민": {
        "benefits": [
            "전반적인 기본 보충 관점에서 고려될 수 있습니다."
        ],
        "food_sources": ["균형 잡힌 식사 전반"],
        "cautions": [
            "중복 성분 여부를 제품별로 확인하는 것이 좋습니다."
        ]
    },
}


def recommend_nutrients(user):
    score = {}
    reasons = {}

    def add_score(nutrient, point, reason):
        score[nutrient] = score.get(nutrient, 0) + point
        reasons.setdefault(nutrient, []).append(reason)

    age = user.get("age", 0)
    gender = user.get("gender", "")
    activity = user.get("activity", "")
    sleep = user.get("sleep", 0)
    diet = user.get("diet", "")
    conditions = user.get("conditions", [])
    goal = user.get("goal", "")

    if age >= 40:
        add_score("비타민D", 2, "40대 이상에서는 비타민D 보충을 함께 검토하는 경우가 많습니다.")
        add_score("오메가3", 1, "중년 이후에는 지방산 보충을 함께 고려할 수 있습니다.")

    if age >= 50:
        add_score("칼슘", 2, "50대 이후에는 뼈 건강 관련 영양소를 함께 보는 경우가 많습니다.")
        add_score("마그네슘", 1, "근육 및 신경 기능 보완 관점에서 함께 검토될 수 있습니다.")

    if gender == "female":
        add_score("철분", 2, "여성은 철분 섭취 상태를 더 자주 확인할 수 있습니다.")
        add_score("엽산", 1, "여성 건강 관점에서 엽산이 함께 고려될 수 있습니다.")

    if activity == "low":
        add_score("비타민D", 2, "활동량이 낮으면 실내 생활 비중이 높을 수 있습니다.")
        add_score("마그네슘", 1, "활동량이 낮고 피로를 느끼는 경우 함께 고려될 수 있습니다.")
    elif activity == "high":
        add_score("마그네슘", 2, "활동량이 높으면 마그네슘 수요를 함께 고려할 수 있습니다.")
        add_score("비타민B군", 1, "에너지 대사 관련 영양소를 함께 고려할 수 있습니다.")

    if sleep < 6:
        add_score("마그네슘", 2, "수면 시간이 짧으면 회복 관련 영양소를 우선 검토할 수 있습니다.")
        add_score("비타민B군", 1, "피로 관리 관점에서 비타민B군을 함께 볼 수 있습니다.")

    if diet == "irregular":
        add_score("비타민B군", 2, "불규칙한 식사 패턴은 기본 영양 보완 필요성을 높일 수 있습니다.")
        add_score("멀티비타민", 1, "전반적인 기본 보충 관점에서 검토할 수 있습니다.")
    elif diet == "vegetarian":
        add_score("비타민B12", 2, "채식 위주 식단에서는 비타민B12를 우선 확인하는 경우가 많습니다.")
        add_score("철분", 1, "식물성 식단에서는 철분 섭취 상태를 함께 볼 수 있습니다.")
    elif diet == "high_protein":
        add_score("마그네슘", 1, "고단백 식단에서는 미네랄 균형도 함께 고려할 수 있습니다.")

    if "고혈압" in conditions:
        add_score("오메가3", 2, "혈압 관리 관심군에서는 오메가3를 함께 검토할 수 있습니다.")
        add_score("마그네슘", 1, "생활 패턴 관리 관점에서 마그네슘도 함께 볼 수 있습니다.")

    if "골다공증" in conditions:
        add_score("칼슘", 2, "뼈 건강과 관련해 칼슘 보충 여부를 함께 검토할 수 있습니다.")
        add_score("비타민D", 2, "칼슘과 함께 비타민D도 함께 고려하는 경우가 많습니다.")

    if goal == "피로 관리":
        add_score("비타민B군", 2, "피로 관리 목표에서는 비타민B군을 우선 검토하는 경우가 많습니다.")
        add_score("마그네슘", 1, "회복과 휴식 관점에서 마그네슘도 함께 고려될 수 있습니다.")
    elif goal == "면역 관리":
        add_score("비타민C", 2, "면역 관리 목표에서는 비타민C가 자주 고려됩니다.")
        add_score("아연", 2, "면역 관련 보완 영양소로 아연도 함께 검토됩니다.")
    elif goal == "수면 관리":
        add_score("마그네슘", 2, "수면 관리 목표에서는 마그네슘을 자주 검토합니다.")
    elif goal == "체중 관리":
        add_score("비타민B군", 1, "체중 관리 과정에서 대사 관련 영양소를 함께 볼 수 있습니다.")
    elif goal == "운동 보조":
        add_score("마그네슘", 2, "운동 보조 목표에서는 마그네슘을 함께 고려할 수 있습니다.")
        add_score("오메가3", 1, "회복 관련 관점에서 오메가3도 함께 검토될 수 있습니다.")

    ordered = sorted(score.items(), key=lambda x: x[1], reverse=True)

    results = []
    for nutrient, point in ordered:
        nutrient_info = NUTRIENT_DB.get(
            nutrient,
            {
                "benefits": ["기본 보완 후보 영양소입니다."],
                "food_sources": ["균형 잡힌 식사 전반"],
                "cautions": ["개인 상태에 따라 적절성 확인이 필요합니다."],
            },
        )

        results.append({
            "name": nutrient,
            "score": point,
            "reasons": reasons.get(nutrient, []),
            "benefits": nutrient_info["benefits"],
            "food_sources": nutrient_info["food_sources"],
            "cautions": nutrient_info["cautions"],
        })

    return results
