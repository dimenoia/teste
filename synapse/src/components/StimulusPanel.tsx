import { Stimulus } from '../types';
import { stimuli } from '../data/stimuli';
import { brainRegions } from '../data/brainRegions';

interface Props {
  selectedStimulus: Stimulus | null;
  onSelect: (stimulus: Stimulus) => void;
  onFire: () => void;
  isSimulating: boolean;
}

export default function StimulusPanel({
  selectedStimulus,
  onSelect,
  onFire,
  isSimulating,
}: Props) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="font-heading text-xs font-semibold text-[#6b6b8a] uppercase tracking-[3px]">
        Estimulos
      </h2>

      <div className="flex flex-col gap-2">
        {stimuli.map((stimulus) => {
          const entryRegion = brainRegions.find((r) => r.id === stimulus.entryPoint);
          const isSelected = selectedStimulus?.id === stimulus.id;

          return (
            <button
              key={stimulus.id}
              onClick={() => onSelect(stimulus)}
              className="relative flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all duration-200"
              style={{
                border: `1px solid ${isSelected ? (entryRegion?.color || '#5B9BD5') + '40' : 'rgba(255, 255, 255, 0.06)'}`,
                background: isSelected ? (entryRegion?.color || '#5B9BD5') + '0C' : 'rgba(255, 255, 255, 0.02)',
                boxShadow: isSelected ? `0 0 20px ${entryRegion?.color || '#5B9BD5'}15` : 'none',
              }}
            >
              <span className="text-[28px]">{stimulus.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-heading font-medium text-[#e8e8f0] truncate">
                  {stimulus.name}
                </div>
                <div className="text-[11px] text-[#6b6b8a] truncate font-mono-sci">
                  Entrada: <span style={{ color: entryRegion?.color }}>{entryRegion?.shortName}</span>
                </div>
              </div>
              {isSelected && (
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: entryRegion?.color,
                    boxShadow: `0 0 8px ${entryRegion?.color}80`,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {selectedStimulus && (
        <button
          onClick={onFire}
          disabled={isSimulating}
          className="mt-2 w-full py-3.5 rounded-xl font-heading font-semibold text-sm uppercase tracking-[2px] transition-all duration-300"
          style={{
            backgroundColor: isSimulating ? '#1a1a2e' : brainRegions.find((r) => r.id === selectedStimulus.entryPoint)?.color,
            color: isSimulating ? '#6b6b8a' : '#0a0a0f',
            cursor: isSimulating ? 'not-allowed' : 'pointer',
            boxShadow: isSimulating ? 'none' : `0 0 25px ${brainRegions.find((r) => r.id === selectedStimulus.entryPoint)?.color}50, 0 0 50px ${brainRegions.find((r) => r.id === selectedStimulus.entryPoint)?.color}20`,
          }}
        >
          {isSimulating ? 'Simulando...' : 'Disparar Sinal'}
        </button>
      )}

      {selectedStimulus && (
        <div className="mt-1 p-3.5 rounded-xl" style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <p className="text-xs text-[#6b6b8a] leading-relaxed">
            {selectedStimulus.description}
          </p>
        </div>
      )}
    </div>
  );
}
