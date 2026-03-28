import { useState } from 'react';

interface Props {
  message: string;
  visible: boolean;
  onClose: () => void;
}

export default function AdvisorWidget({ message, visible, onClose }: Props) {
  const [collapsed, setCollapsed] = useState(false);

  if (!visible) return null;

  return (
    <div className="fixed bottom-20 left-0 right-0 z-40 px-3 pointer-events-none">
      <div className="max-w-md mx-auto pointer-events-auto">
        <div className={`pixel-card pixel-border-gold transition-all duration-300 ${collapsed ? 'py-2' : 'py-3'}`} style={{ background: 'hsl(20 25% 9%)' }}>
          <div className="flex items-start gap-2">
            <div className="text-[28px] leading-none flex-shrink-0 pixel-sprite mt-0.5">🦅</div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <div className="font-pixel text-[6px] text-amber-400 mb-1">СОВЕТНИК СЕНЕКА</div>
                <p className="font-pixel text-[7px] leading-relaxed" style={{ color: 'hsl(var(--foreground))' }}>
                  {message}
                </p>
              </div>
            )}
            {collapsed && (
              <div className="flex-1">
                <span className="font-pixel text-[6px] text-amber-400">СОВЕТНИК СЕНЕКА</span>
              </div>
            )}
            <div className="flex gap-1 flex-shrink-0">
              <button
                className="pixel-btn text-[8px]"
                style={{ padding: '3px 6px', minWidth: 0 }}
                onClick={() => setCollapsed(c => !c)}
              >
                {collapsed ? '▲' : '▼'}
              </button>
              <button
                className="pixel-btn pixel-btn-red text-[8px]"
                style={{ padding: '3px 6px', minWidth: 0 }}
                onClick={onClose}
              >✕</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
