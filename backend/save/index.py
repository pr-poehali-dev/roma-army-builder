"""
Сохранение и загрузка игрового прогресса.
POST /save  — сохранить прогресс (требует X-Auth-Token)
GET  /save  — загрузить прогресс (требует X-Auth-Token)
"""
import json, os, time, hmac, hashlib, base64
import psycopg2

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p6988125_roma_army_builder')
CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
}

def ok(body):
    return {'statusCode': 200, 'headers': {**CORS, 'Content-Type': 'application/json'}, 'body': json.dumps(body, ensure_ascii=False)}

def err(code, msg):
    return {'statusCode': code, 'headers': {**CORS, 'Content-Type': 'application/json'}, 'body': json.dumps({'error': msg}, ensure_ascii=False)}

def b64url(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode()

def verify_jwt(token: str) -> dict | None:
    secret = os.environ.get('JWT_SECRET', 'roma-secret-key-change-me')
    try:
        parts = token.split('.')
        if len(parts) != 3:
            return None
        header, body, sig = parts
        expected = b64url(hmac.new(secret.encode(), f'{header}.{body}'.encode(), hashlib.sha256).digest())
        if not hmac.compare_digest(sig, expected):
            return None
        pad = 4 - len(body) % 4
        payload = json.loads(base64.urlsafe_b64decode(body + '=' * pad))
        if payload.get('exp', 0) < time.time():
            return None
        return payload
    except Exception:
        return None

def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    token = event.get('headers', {}).get('X-Auth-Token', '')
    if not token:
        return err(401, 'Нет токена')
    payload = verify_jwt(token)
    if not payload:
        return err(401, 'Токен недействителен')
    user_id = payload['uid']

    method = event.get('httpMethod', 'GET')
    conn = get_conn()
    try:
        cur = conn.cursor()

        # GET — загрузить сохранение
        if method == 'GET':
            cur.execute(f"SELECT save_data FROM {SCHEMA}.game_saves WHERE user_id=%s", (user_id,))
            row = cur.fetchone()
            if row:
                return ok({'save': row[0]})
            return ok({'save': None})

        # POST — сохранить прогресс
        if method == 'POST':
            body = json.loads(event.get('body') or '{}')
            save_data = body.get('save')
            if save_data is None:
                return err(400, 'Нет данных сохранения')
            save_json = json.dumps(save_data, ensure_ascii=False)
            cur.execute(
                f"""INSERT INTO {SCHEMA}.game_saves (user_id, save_data, updated_at)
                    VALUES (%s, %s::jsonb, NOW())
                    ON CONFLICT (user_id) DO UPDATE
                    SET save_data = EXCLUDED.save_data, updated_at = NOW()""",
                (user_id, save_json)
            )
            conn.commit()
            return ok({'ok': True})

        return err(405, 'Метод не поддерживается')
    finally:
        conn.close()
