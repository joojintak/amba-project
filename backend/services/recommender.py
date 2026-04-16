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

    # 연령 기반
    if age >= 40:
        add_score("비타민D", 2, "40대 이상은 비타민D 보충 검토 빈도가 높습니다.")
        add_score("오메가3", 1, "중년 이후에는 지방산 보충을 함께 검토할 수 있습니다.")

    if age >= 50:
        add_score("칼슘", 2, "50대 이후에는 뼈 건강 관련 영양소를 함께 검토할 수 있습니다.")
        add_score("마그네슘", 1, "근육 및 신경 기능 보조 영양소를 함께 고려할 수 있습니다.")

    # 성별 기반
    if gender == "female":
        add_score("철분", 2, "여성은 철분 섭취 상태를 더 자주 확인할 수 있습니다.")
        add_score("엽산", 1, "여성은 엽산 섭취를 함께 고려할 수 있습니다.")

    # 활동량
    if activity == "low":
        add_score("비타민D", 2, "활동량이 낮으면 실내 생활 비중이 높을 수 있습니다.")
        add_score("마그네슘", 1, "활동량이 낮고 피로를 느끼면 마그네슘 보충을 검토할 수 있습니다.")
    elif activity == "high":
        add_score("마그네슘", 2, "활동량이 높으면 마그네슘 수요를 함께 고려할 수 있습니다.")
        add_score("비타민B군", 1, "에너지 대사 관련 영양소를 함께 고려할 수 있습니다.")

    # 수면
    if sleep < 6:
        add_score("마그네슘", 2, "수면 시간이 부족하면 마그네슘을 함께 검토할 수 있습니다.")
        add_score("비타민B군", 1, "피로 관리 차원에서 비타민B군을 고려할 수 있습니다.")

    # 식사 패턴
    if diet == "irregular":
        add_score("비타민B군", 2, "불규칙한 식사는 비타민B군 부족 가능성을 높일 수 있습니다.")
        add_score("멀티비타민", 1, "식사 패턴이 불규칙하면 기본 보충을 고려할 수 있습니다.")
    elif diet == "vegetarian":
        add_score("비타민B12", 2, "채식 위주 식단에서는 비타민B12를 더 주의 깊게 볼 수 있습니다.")
        add_score("철분", 1, "식물성 식단에서는 철분 보충 여부를 확인할 수 있습니다.")
    elif diet == "high_protein":
        add_score("마그네슘", 1, "고단백 식단에서는 균형 잡힌 미네랄 섭취도 중요합니다.")

    # 질환
    if "고혈압" in conditions:
        add_score("오메가3", 2, "고혈압 관리 중이면 오메가3를 함께 검토할 수 있습니다.")
        add_score("마그네슘", 1, "혈압 관리와 관련해 마그네슘을 함께 볼 수 있습니다.")

    if "골다공증" in conditions:
        add_score("칼슘", 2, "골다공증이 있으면 칼슘 보충 여부를 검토할 수 있습니다.")
        add_score("비타민D", 2, "칼슘과 함께 비타민D를 같이 고려하는 경우가 많습니다.")

    # 목표
    if goal == "피로 관리":
        add_score("비타민B군", 2, "피로 관리 목표에서는 비타민B군을 우선 검토할 수 있습니다.")
        add_score("마그네슘", 1, "피로감이 있으면 마그네슘도 함께 볼 수 있습니다.")
    elif goal == "면역 관리":
        add_score("비타민C", 2, "면역 관리 목표에서는 비타민C를 많이 검토합니다.")
        add_score("아연", 2, "면역 관련 영양소로 아연도 자주 고려됩니다.")
    elif goal == "수면 관리":
        add_score("마그네슘", 2, "수면 관리 목표에서는 마그네슘이 자주 고려됩니다.")
    elif goal == "체중 관리":
        add_score("비타민B군", 1, "체중 관리 중에는 대사 관련 영양소를 함께 고려할 수 있습니다.")
    elif goal == "운동 보조":
        add_score("마그네슘", 2, "운동 보조 목표에서는 마그네슘이 자주 고려됩니다.")
        add_score("오메가3", 1, "운동 후 회복 관리 차원에서 오메가3를 볼 수 있습니다.")

    ordered = sorted(score.items(), key=lambda x: x[1], reverse=True)

    return [
        {
            "name": nutrient,
            "score": point,
            "reasons": reasons.get(nutrient, [])
        }
        for nutrient, point in ordered
    ]
