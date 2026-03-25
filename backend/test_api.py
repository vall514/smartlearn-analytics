import requests

urls = [
    '/api/predictions/at-risk-students/',
    '/api/prediction/at-risk-students/',
]

for p in urls:
    try:
        r = requests.get('http://127.0.0.1:8000' + p, timeout=5)
        print(f"{p} => status={r.status_code}, content_type={r.headers.get('content-type', 'N/A')}")
        if r.status_code == 200:
            print(f"  response: {r.text[:150]}")
    except Exception as e:
        print(f"{p} => ERR: {e}")
