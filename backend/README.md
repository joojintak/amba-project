# Backend

## 실행 방법
```bash
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

실행 후 `http://127.0.0.1:8000/docs` 에서 API를 테스트할 수 있습니다.
