const FUNC2URL: Record<string, string> = {
  auth: 'https://functions.poehali.dev/e681f0b7-f7f1-48bc-ad6f-d6eb52d34c6a',
  save: 'https://functions.poehali.dev/435d4c8e-f7d5-4a2c-8e89-c549b3ce39c7',
  admin: 'https://functions.poehali.dev/979efa24-bc34-4dd9-b4a3-8bfc5adb52a5',
};

export interface User {
  id: number;
  email: string;
  name: string;
  avatar?: string;
  role: 'player' | 'admin' | 'creator';
}

function getToken(): string {
  return localStorage.getItem('roma_token') || '';
}

function headers(withAuth = false): HeadersInit {
  const h: HeadersInit = { 'Content-Type': 'application/json' };
  if (withAuth) {
    const t = getToken();
    if (t) (h as Record<string, string>)['X-Auth-Token'] = t;
  }
  return h;
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function loginWithGoogle(idToken: string): Promise<{ token: string; user: User }> {
  const r = await fetch(FUNC2URL.auth, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ id_token: idToken }),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || 'Ошибка входа');
  return data;
}

export async function getMe(): Promise<User> {
  const r = await fetch(FUNC2URL.auth, {
    method: 'GET',
    headers: headers(true),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || 'Не авторизован');
  return data;
}

// ── Save ─────────────────────────────────────────────────────────────────────

export async function saveGame(saveData: unknown): Promise<void> {
  const r = await fetch(FUNC2URL.save, {
    method: 'POST',
    headers: headers(true),
    body: JSON.stringify({ save: saveData }),
  });
  if (!r.ok) {
    const d = await r.json();
    throw new Error(d.error || 'Ошибка сохранения');
  }
}

export async function loadGame(): Promise<unknown | null> {
  const r = await fetch(FUNC2URL.save, {
    method: 'GET',
    headers: headers(true),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || 'Ошибка загрузки');
  return data.save;
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export interface AdminUser {
  id: number;
  email: string;
  name: string;
  avatar?: string;
  role: string;
  created_at: string;
  last_login: string;
  banned: boolean;
  ban_reason?: string;
  ban_expires?: string;
}

export async function adminGetUsers(): Promise<AdminUser[]> {
  const r = await fetch(FUNC2URL.admin, {
    method: 'GET',
    headers: headers(true),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || 'Ошибка');
  return data.users;
}

export async function adminBanUser(userId: number, reason: string): Promise<void> {
  const r = await fetch(FUNC2URL.admin, {
    method: 'POST',
    headers: headers(true),
    body: JSON.stringify({ action: 'ban', user_id: userId, reason }),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || 'Ошибка');
}

export async function adminUnbanUser(userId: number): Promise<void> {
  const r = await fetch(FUNC2URL.admin, {
    method: 'POST',
    headers: headers(true),
    body: JSON.stringify({ action: 'unban', user_id: userId }),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || 'Ошибка');
}

export async function adminSetRole(userId: number, role: string): Promise<void> {
  const r = await fetch(FUNC2URL.admin, {
    method: 'POST',
    headers: headers(true),
    body: JSON.stringify({ action: 'set-role', user_id: userId, role }),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || 'Ошибка');
}