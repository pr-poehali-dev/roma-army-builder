"""
Панель администратора.
GET  /admin/users         — список всех пользователей (admin/creator)
POST /admin/ban           — заблокировать пользователя {user_id, reason, expires_at?}
POST /admin/unban         — разблокировать {user_id}
POST /admin/set-role      — изменить роль {user_id, role} (только creator)
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
    return {'statusCode': 200, 'headers': {**CORS, 'Content-Type': 'application/json'}, 'body': json.dumps(body, ensure_ascii=False, default=str)}

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

    role = payload.get('role', 'player')
    if role not in ('admin', 'creator'):
        return err(403, 'Недостаточно прав')

    admin_id = payload['uid']
    method = event.get('httpMethod', 'GET')
    path   = event.get('path', '/')
    qs     = event.get('queryStringParameters') or {}
    # support ?path=/users routing
    qs_path = qs.get('path', '')
    route  = qs_path if qs_path else path
    conn   = get_conn()

    try:
        cur = conn.cursor()

        # GET → всегда возвращаем список пользователей
        if method == 'GET':
            cur.execute(f"""
                SELECT u.id, u.email, u.name, u.avatar, u.role, u.created_at, u.last_login,
                       b.reason AS ban_reason, b.expires_at AS ban_expires
                FROM {SCHEMA}.users u
                LEFT JOIN {SCHEMA}.bans b ON b.user_id = u.id AND (b.expires_at IS NULL OR b.expires_at > NOW())
                ORDER BY u.created_at DESC
            """)
            rows = cur.fetchall()
            users = [
                {
                    'id': r[0], 'email': r[1], 'name': r[2], 'avatar': r[3], 'role': r[4],
                    'created_at': str(r[5]), 'last_login': str(r[6]),
                    'banned': r[7] is not None,
                    'ban_reason': r[7],
                    'ban_expires': str(r[8]) if r[8] else None,
                }
                for r in rows
            ]
            return ok({'users': users})

        raw_b = event.get('body') or '{}'
        try:
            body = json.loads(raw_b) if isinstance(raw_b, str) else raw_b
            if isinstance(body, str): body = json.loads(body)
        except Exception:
            body = {}
        if not isinstance(body, dict): body = {}
        action = body.get('action', '')

        # POST action=ban
        if method == 'POST' and action in ('ban',):
            user_id = body.get('user_id')
            reason  = body.get('reason', 'Нарушение правил')
            expires = body.get('expires_at')
            if not user_id:
                return err(400, 'Нет user_id')
            cur.execute(f"SELECT role FROM {SCHEMA}.users WHERE id=%s", (user_id,))
            row = cur.fetchone()
            if not row:
                return err(404, 'Пользователь не найден')
            if row[0] in ('admin', 'creator') and role != 'creator':
                return err(403, 'Нельзя банить администратора')
            if expires:
                cur.execute(
                    f"INSERT INTO {SCHEMA}.bans (user_id, reason, banned_by, expires_at) VALUES (%s,%s,%s,%s) ON CONFLICT (user_id) DO UPDATE SET reason=EXCLUDED.reason, banned_by=EXCLUDED.banned_by, expires_at=EXCLUDED.expires_at",
                    (user_id, reason, admin_id, expires)
                )
            else:
                cur.execute(
                    f"INSERT INTO {SCHEMA}.bans (user_id, reason, banned_by) VALUES (%s,%s,%s) ON CONFLICT (user_id) DO UPDATE SET reason=EXCLUDED.reason, banned_by=EXCLUDED.banned_by, expires_at=NULL",
                    (user_id, reason, admin_id)
                )
            conn.commit()
            return ok({'ok': True, 'message': f'Пользователь {user_id} заблокирован'})

        # POST action=unban
        if method == 'POST' and action == 'unban':
            user_id = body.get('user_id')
            if not user_id:
                return err(400, 'Нет user_id')
            cur.execute(f"UPDATE {SCHEMA}.bans SET expires_at = NOW() WHERE user_id=%s", (user_id,))
            conn.commit()
            return ok({'ok': True, 'message': f'Пользователь {user_id} разблокирован'})

        # POST action=set-role
        if method == 'POST' and action == 'set-role':
            if role != 'creator':
                return err(403, 'Только создатель может менять роли')
            user_id  = body.get('user_id')
            new_role = body.get('role')
            if not user_id or not new_role:
                return err(400, 'Нет user_id или role')
            if new_role not in ('player', 'admin', 'creator'):
                return err(400, 'Неверная роль')
            cur.execute(f"UPDATE {SCHEMA}.users SET role=%s WHERE id=%s", (new_role, user_id))
            conn.commit()
            return ok({'ok': True})

        return err(404, 'Не найдено')
    finally:
        conn.close()