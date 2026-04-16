def recommend_nutrients(user):
    score = {}

    if user.get("activity") == "low":
        score["비타민D"] = score.get("비타민D", 0) + 2

    if user.get("sleep", 0) < 6:
        score["마그네슘"] = score.get("마그네슘", 0) + 2

    if "고혈압" in user.get("conditions", []):
        score["오메가3"] = score.get("오메가3", 0) + 2

    if user.get("diet") == "irregular":
        score["비타민B군"] = score.get("비타민B군", 0) + 1

    ordered = sorted(score.items(), key=lambda x: x[1], reverse=True)
    return [name for name, _ in ordered]
