import { ToolMode } from '../types';

interface Props {
  mode: ToolMode;
  onModeChange: (mode: ToolMode) => void;
  onClearAll: () => void;
  connectionCount: number;
}

export default function Toolbar({ mode, onModeChange, onClearAll, connectionCount }: Props) {
  const buttons: { mode: ToolMode; label: string; icon: string; activeColor: string }[] = [
    { mode: 'connect', label: 'Conectar', icon: '~', activeColor: '#5B9BD5' },
    { mode: 'delete', label: 'Apagar', icon: 'x', activeColor: '#FF6B6B' },
  ];

  return (
    <div className="flex items-center gap-2">
      {buttons.map((btn) => (
        <button
          key={btn.mode}
          onClick={() => onModeChange(btn.mode)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono-sci font-medium transition-all duration-200"
          style={{
            border: `1px solid ${mode === btn.mode ? btn.activeColor + '50' : 'rgba(100, 120, 255, 0.08)'}`,
            background: mode === btn.mode ? btn.activeColor + '12' : 'rgba(100, 120, 255, 0.03)',
            color: mode === btn.mode ? btn.activeColor : '#6b6b8a',
            boxShadow: mode === btn.mode ? `0 0 12px ${btn.activeColor}20` : 'none',
          }}
        >
          <span className="font-mono-sci text-sm">{btn.icon}</span>
          <span>{btn.label}</span>
        </button>
      ))}

      <div className="w-px h-5 mx-1" style={{ background: 'rgba(100, 120, 255, 0.1)' }} />

      <button
        onClick={onClearAll}
        disabled={connectionCount === 0}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono-sci font-medium transition-all duration-200"
        style={{
          border: '1px solid rgba(100, 120, 255, 0.08)',
          background: 'rgba(100, 120, 255, 0.03)',
          color: connectionCount > 0 ? '#FF6B6B' : '#2a2a4a',
          cursor: connectionCount > 0 ? 'pointer' : 'not-allowed',
        }}
      >
        <span className="text-sm">-</span>
        <span>Limpar</span>
      </button>

      {connectionCount > 0 && (
        <span className="text-xs text-[#6b6b8a] ml-2 font-mono-sci">
          {connectionCount} {connectionCount === 1 ? 'conexao' : 'conexoes'}
        </span>
      )}
    </div>
  );
}
