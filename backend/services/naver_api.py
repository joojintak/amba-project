import os
import re
import requests

NAVER_CLIENT_ID = os.getenv("NAVER_CLIENT_ID", "").strip()
NAVER_CLIENT_SECRET = os.getenv("NAVER_CLIENT_SECRET", "").strip()
USE_NAVER_API = os.getenv("USE_NAVER_API", "false").strip().lower() == "true"


def clean_html(text: str) -> str:
    return re.sub(r"<.*?>", "", text or "")


def sample_products(query: str):
    return [
        {
            "title": f"{query} 샘플 상품 1",
            "mall_name": "Naver Mall A",
            "price_krw": 21900,
            "url": "https://shopping.naver.com/",
            "image_url": f"https://via.placeholder.com/200?text={query}"
        },
        {
            "title": f"{query} 샘플 상품 2",
            "mall_name": "Naver Mall B",
            "price_krw": 24900,
            "url": "https://shopping.naver.com/",
            "image_url": f"https://via.placeholder.com/200?text={query}"
        },
        {
            "title": f"{query} 샘플 상품 3",
            "mall_name": "Coupang",
            "price_krw": 25900,
            "url": "https://www.coupang.com/",
            "image_url": f"https://via.placeholder.com/200?text={query}"
        }
    ]

def build_search_query(query: str):
    query_map = {
        "비타민D": "비타민D 2000IU 성인 영양제",
        "오메가3": "rTG 오메가3 성인 영양제",
        "마그네슘": "마그네슘 글리시네이트 성인 영양제",
        "비타민B군": "비타민B 컴플렉스 성인 영양제",
        "칼슘": "칼슘 마그네슘 비타민D 영양제",
        "철분": "철분 성인 영양제",
        "엽산": "엽산 성인 영양제",
        "비타민B12": "비타민B12 성인 영양제",
        "비타민C": "비타민C 1000 성인 영양제",
        "아연": "아연 성인 영양제",
        "멀티비타민": "종합비타민 성인 영양제",
    }
    return query_map.get(query, f"{query} 성인 영양제")
    
def search_naver_products(query: str):
    search_query = build_search_query(query)

    print(f"[NAVER] query={search_query}")
    print(f"[NAVER] USE_NAVER_API={USE_NAVER_API}")
    print(f"[NAVER] has_client_id={bool(NAVER_CLIENT_ID)}")
    print(f"[NAVER] has_client_secret={bool(NAVER_CLIENT_SECRET)}")

    if not USE_NAVER_API:
        print("[NAVER] fallback: USE_NAVER_API is false")
        return sample_products(query)

    if not NAVER_CLIENT_ID or not NAVER_CLIENT_SECRET:
        print("[NAVER] fallback: missing credentials")
        return sample_products(query)

    url = "https://openapi.naver.com/v1/search/shop.json"
    headers = {
        "X-Naver-Client-Id": NAVER_CLIENT_ID,
        "X-Naver-Client-Secret": NAVER_CLIENT_SECRET,
    }
    params = {
    "query": search_query,
    "display": 5,
    "sort": "sim",
    "exclude": "used:rental:cbshop"
    }

    try:
        resp = requests.get(url, headers=headers, params=params, timeout=10)
        print(f"[NAVER] status={resp.status_code}")
        print(f"[NAVER] body_preview={resp.text[:300]}")
        resp.raise_for_status()

        data = resp.json()
        items = data.get("items", [])
        print(f"[NAVER] items_count={len(items)}")

        results = []
        for item in items[:3]:
            price_raw = item.get("lprice", "0")
            try:
                price_krw = int(price_raw)
            except Exception:
                price_krw = 0

            results.append({
                "title": clean_html(item.get("title", "")),
                "mall_name": item.get("mallName", ""),
                "price_krw": price_krw,
                "url": item.get("link", ""),
                "image_url": item.get("image", "")
            })

        if not results:
            print("[NAVER] fallback: no items returned")
            return sample_products(query)

        return results

    except Exception as e:
        print(f"[NAVER] fallback: exception={repr(e)}")
        return sample_products(query)
