import os
import requests

NAVER_CLIENT_ID = os.getenv("NAVER_CLIENT_ID", "").strip()
NAVER_CLIENT_SECRET = os.getenv("NAVER_CLIENT_SECRET", "").strip()
USE_NAVER_API = os.getenv("USE_NAVER_API", "false").strip().lower() == "true"


def sample_products(query: str):
    return [
        {
            "title": f"{query} 샘플 상품 1",
            "mall_name": "Naver Mall A",
            "price_krw": 21900,
            "url": "https://shopping.naver.com/",
            "image_url": f"https://via.placeholder.com/120?text={query}"
        },
        {
            "title": f"{query} 샘플 상품 2",
            "mall_name": "Naver Mall B",
            "price_krw": 24900,
            "url": "https://shopping.naver.com/",
            "image_url": f"https://via.placeholder.com/120?text={query}"
        },
        {
            "title": f"{query} 샘플 상품 3",
            "mall_name": "Coupang",
            "price_krw": 25900,
            "url": "https://www.coupang.com/",
            "image_url": f"https://via.placeholder.com/120?text={query}"
        }
    ]


def search_naver_products(query: str):
    print(f"[NAVER] query={query}")
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
        "query": query,
        "display": 3,
        "sort": "sim"
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
                "title": item.get("title", ""),
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
