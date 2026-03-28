"""
Аутентификация через Google OAuth2.
POST /auth/google — обмен Google id_token на сессионный JWT.
GET  /auth/me    — получить текущего пользователя по JWT.
POST /auth/logout — выход.
"""
import json, os, time, hmac, hashlib, base64
import psycopg2
import urllib.request
import urllib.parse

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

# ── JWT (HS256 minimal) ───────────────────────────────────────────────────────

def b64url(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode()

def make_jwt(payload: dict) -> str:
    secret = os.environ.get('JWT_SECRET', 'roma-secret-key-change-me')
    header = b64url(json.dumps({'alg': 'HS256', 'typ': 'JWT'}).encode())
    body   = b64url(json.dumps(payload).encode())
    sig    = b64url(hmac.new(secret.encode(), f'{header}.{body}'.encode(), hashlib.sha256).digest())
    return f'{header}.{body}.{sig}'

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

# ── Google token verify ───────────────────────────────────────────────────────

def verify_google_token(id_token: str) -> dict | None:
    try:
        url = f'https://oauth2.googleapis.com/tokeninfo?id_token={urllib.parse.quote(id_token)}'
        with urllib.request.urlopen(url, timeout=5) as r:
            data = json.loads(r.read())
        client_id = os.environ.get('GOOGLE_CLIENT_ID', '')
        if client_id and data.get('aud') != client_id:
            return None
        return data
    except Exception:
        return None

# ── DB ────────────────────────────────────────────────────────────────────────

def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def get_or_create_user(conn, google_data: dict) -> dict:
    email     = google_data['email']
    name      = google_data.get('name', email.split('@')[0])
    avatar    = google_data.get('picture', '')
    google_id = google_data['sub']
    cur = conn.cursor()
    cur.execute(f"SELECT id, email, name, avatar, role FROM {SCHEMA}.users WHERE email = %s", (email,))
    row = cur.fetchone()
    if row:
        uid, uemail, uname, uavatar, urole = row
        cur.execute(f"UPDATE {SCHEMA}.users SET google_id=%s, last_login=NOW(), avatar=%s WHERE id=%s", (google_id, avatar, uid))
        conn.commit()
        return {'id': uid, 'email': uemail, 'name': uname, 'avatar': uavatar or avatar, 'role': urole}
    else:
        cur.execute(
            f"INSERT INTO {SCHEMA}.users (email, name, avatar, google_id, role) VALUES (%s,%s,%s,%s,'player') RETURNING id, role",
            (email, name, avatar, google_id)
        )
        uid, role = cur.fetchone()
        conn.commit()
        return {'id': uid, 'email': email, 'name': name, 'avatar': avatar, 'role': role}

def is_banned(conn, user_id: int) -> dict | None:
    cur = conn.cursor()
    cur.execute(
        f"SELECT reason, expires_at FROM {SCHEMA}.bans WHERE user_id=%s AND (expires_at IS NULL OR expires_at > NOW())",
        (user_id,)
    )
    row = cur.fetchone()
    if row:
        return {'reason': row[0], 'expires_at': str(row[1]) if row[1] else None}
    return None

# ── Handler ───────────────────────────────────────────────────────────────────

def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    path   = event.get('path', '/')

    # GET /auth/me
    if method == 'GET':
        token = event.get('headers', {}).get('X-Auth-Token', '')
        if not token:
            return err(401, 'Нет токена')
        payload = verify_jwt(token)
        if not payload:
            return err(401, 'Токен недействителен')
        conn = get_conn()
        try:
            cur = conn.cursor()
            cur.execute(f"SELECT id, email, name, avatar, role FROM {SCHEMA}.users WHERE id=%s", (payload['uid'],))
            row = cur.fetchone()
            if not row:
                return err(404, 'Пользователь не найден')
            uid, email, name, avatar, role = row
            ban = is_banned(conn, uid)
            if ban:
                return err(403, f"Аккаунт заблокирован: {ban['reason']}")
            return ok({'id': uid, 'email': email, 'name': name, 'avatar': avatar, 'role': role})
        finally:
            conn.close()

    # POST /auth/google
    if method == 'POST':
        raw_body = event.get('body') or '{}'
        try:
            parsed = json.loads(raw_body) if isinstance(raw_body, str) else raw_body
            # double-encoded JSON
            if isinstance(parsed, str):
                parsed = json.loads(parsed)
            body = parsed if isinstance(parsed, dict) else {}
        except Exception:
            body = {}
        id_token = body.get('id_token', '')
        if not id_token:
            return err(400, 'Нет id_token')
        google_data = verify_google_token(id_token)
        if not google_data or 'email' not in google_data:
            return err(401, 'Неверный Google токен')
        conn = get_conn()
        try:
            user = get_or_create_user(conn, google_data)
            ban = is_banned(conn, user['id'])
            if ban:
                return err(403, f"Аккаунт заблокирован: {ban['reason']}")
            jwt = make_jwt({'uid': user['id'], 'role': user['role'], 'exp': int(time.time()) + 86400 * 30})
            return ok({'token': jwt, 'user': user})
        finally:
            conn.close()

    return err(404, 'Не найдено')