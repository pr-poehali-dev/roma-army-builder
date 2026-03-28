import { useEffect, useRef, useState } from 'react';

interface Props {
  onLogin: (idToken: string) => Promise<void>;
  error: string | null;
  loading: boolean;
  googleClientId: string;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (cfg: object) => void;
          renderButton: (el: HTMLElement, cfg: object) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export default function LoginScreen({ onLogin, error, loading, googleClientId }: Props) {
  const btnRef = useRef<HTMLDivElement>(null);
  const [gsiReady, setGsiReady] = useState(false);

  useEffect(() => {
    if (!googleClientId || googleClientId === 'YOUR_GOOGLE_CLIENT_ID') return;
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      window.google?.accounts.id.initialize({
        client_id: googleClientId,
        callback: (response: { credential: string }) => {
          onLogin(response.credential).catch(() => {});
        },
      });
      if (btnRef.current) {
        window.google?.accounts.id.renderButton(btnRef.current, {
          theme: 'filled_black',
          size: 'large',
          text: 'signin_with',
          shape: 'rectangular',
          width: 280,
        });
      }
      setGsiReady(true);
    };
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, [googleClientId, onLogin]);

  const noClientId = !googleClientId || googleClientId === 'YOUR_GOOGLE_CLIENT_ID';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: 'hsl(var(--background))' }}>

      {/* Decorative scanlines */}
      <div className="scanlines pointer-events-none" />

      {/* Logo */}
      <div className="text-center mb-8 animate-pixel-enter">
        <div className="text-[80px] leading-none mb-4 pixel-sprite select-none">🏛️</div>
        <h1 className="font-pixel text-amber-400 text-[16px] leading-relaxed tracking-wider">
          ROMA
        </h1>
        <h2 className="font-pixel text-[10px] mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
          IMPERIALIS
        </h2>
        <p className="font-oswald text-lg mt-3" style={{ color: 'hsl(var(--muted-foreground))' }}>
          Слава Риму! Начни свой путь к величию
        </p>
      </div>

      {/* Login card */}
      <div className="pixel-card pixel-border-gold w-full max-w-sm animate-pixel-enter" style={{ animationDelay: '0.1s' }}>
        <p className="font-pixel text-amber-400 text-[10px] text-center mb-6">
          ⚔️ ВХОД В ИГРУ
        </p>

        {error && (
          <div className="pixel-card mb-4" style={{ borderColor: 'hsl(var(--destructive))', padding: '10px' }}>
            <p className="font-pixel text-[7px] text-red-400 text-center">{error}</p>
          </div>
        )}

        {loading && (
          <div className="text-center py-4">
            <p className="font-pixel text-amber-400 text-[8px]">Проверяем легионера...</p>
          </div>
        )}

        {noClientId ? (
          <div className="text-center space-y-3">
            <div className="pixel-card" style={{ padding: '12px', borderColor: 'hsl(45 85% 40%)' }}>
              <p className="font-pixel text-[7px] text-amber-400 mb-2">⚠️ НАСТРОЙКА GOOGLE</p>
              <p className="font-pixel text-[6px] leading-relaxed" style={{ color: 'hsl(var(--muted-foreground))' }}>
                Для входа через Google нужно добавить секрет GOOGLE_CLIENT_ID в настройках проекта.
              </p>
            </div>
            <p className="font-pixel text-[6px]" style={{ color: 'hsl(var(--muted-foreground))' }}>
              Пока что можно играть без входа:
            </p>
            <button
              className="pixel-btn w-full"
              onClick={() => onLogin('demo_mode').catch(() => {})}
            >
              🎮 ИГРАТЬ БЕЗ ВХОДА
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div ref={btnRef} className="flex justify-center" />
            {!gsiReady && !loading && (
              <p className="font-pixel text-[6px]" style={{ color: 'hsl(var(--muted-foreground))' }}>
                Загрузка кнопки Google...
              </p>
            )}
          </div>
        )}

        <div className="mt-6 pt-4" style={{ borderTop: '1px solid hsl(var(--border))' }}>
          <p className="font-pixel text-[6px] text-center leading-relaxed" style={{ color: 'hsl(var(--muted-foreground))' }}>
            Входя в игру, ты принимаешь<br />законы Римской Империи
          </p>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-sm mt-6 animate-pixel-enter" style={{ animationDelay: '0.2s' }}>
        {[
          { icon: '💾', text: 'Авто-сохранение' },
          { icon: '⚔️', text: 'Пошаговые бои' },
          { icon: '👑', text: 'Легендарные вещи' },
        ].map(f => (
          <div key={f.text} className="pixel-card text-center" style={{ padding: '10px' }}>
            <div className="text-2xl mb-1">{f.icon}</div>
            <p className="font-pixel text-[6px]" style={{ color: 'hsl(var(--muted-foreground))' }}>{f.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
