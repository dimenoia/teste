import { ToolMode } from '../types';

interface Props {
  mode: ToolMode;
  onModeChange: (mode: ToolMode) => void;
  onClearAll: () => void;
  connectionCount: number;
}

export default function Toolbar({ mode, onModeChange, onClearAll, connectionCount }: Props) {
  const buttons: { mode: ToolMode; label: string; icon: string }[] = [
    { mode: 'connect', label: 'Conectar', icon: '🔗' },
    { mode: 'delete', label: 'Apagar', icon: '✂️' },
  ];

  return (
    <div className="flex items-center gap-2">
      {buttons.map((btn) => (
        <button
          key={btn.mode}
          onClick={() => onModeChange(btn.mode)}
          className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium
            transition-all duration-200 border
            ${
              mode === btn.mode
                ? 'border-[#4A90D9] bg-[#4A90D9]/10 text-[#4A90D9]'
                : 'border-[#1a1a2e] bg-[#12121a] text-[#6b6b8a] hover:border-[#2a2a4a] hover:text-[#e8e8f0]'
            }
          `}
        >
          <span>{btn.icon}</span>
          <span>{btn.label}</span>
        </button>
      ))}

      <div className="w-px h-5 bg-[#1a1a2e] mx-1" />

      <button
        onClick={onClearAll}
        disabled={connectionCount === 0}
        className={`
          flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium
          transition-all duration-200 border border-[#1a1a2e] bg-[#12121a]
          ${
            connectionCount > 0
              ? 'text-[#E74C3C] hover:border-[#E74C3C]/30 hover:bg-[#E74C3C]/5'
              : 'text-[#2a2a4a] cursor-not-allowed'
          }
        `}
      >
        <span>🗑️</span>
        <span>Limpar</span>
      </button>

      {connectionCount > 0 && (
        <span className="text-xs text-[#6b6b8a] ml-2">
          {connectionCount} {connectionCount === 1 ? 'conexão' : 'conexões'}
        </span>
      )}
    </div>
  );
}
