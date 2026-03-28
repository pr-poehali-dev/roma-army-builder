
CREATE TABLE t_p6988125_roma_army_builder.users (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    avatar TEXT,
    google_id TEXT,
    role TEXT NOT NULL DEFAULT 'player',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX users_google_id_idx ON t_p6988125_roma_army_builder.users(google_id) WHERE google_id IS NOT NULL;

CREATE TABLE t_p6988125_roma_army_builder.game_saves (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES t_p6988125_roma_army_builder.users(id),
    save_data JSONB NOT NULL DEFAULT '{}',
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE TABLE t_p6988125_roma_army_builder.bans (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES t_p6988125_roma_army_builder.users(id),
    reason TEXT NOT NULL DEFAULT 'Нарушение правил',
    banned_by INTEGER REFERENCES t_p6988125_roma_army_builder.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    UNIQUE(user_id)
);

INSERT INTO t_p6988125_roma_army_builder.users (email, name, role)
VALUES ('pavelgladkov74@gmail.com', 'Создатель', 'creator')
ON CONFLICT (email) DO UPDATE SET role = 'creator';
