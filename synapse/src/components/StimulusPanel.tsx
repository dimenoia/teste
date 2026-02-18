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
      <h2 className="font-heading text-sm font-semibold text-[#6b6b8a] uppercase tracking-wider">
        Estímulos
      </h2>

      <div className="flex flex-col gap-2">
        {stimuli.map((stimulus) => {
          const entryRegion = brainRegions.find((r) => r.id === stimulus.entryPoint);
          const isSelected = selectedStimulus?.id === stimulus.id;

          return (
            <button
              key={stimulus.id}
              onClick={() => onSelect(stimulus)}
              className={`
                relative flex items-center gap-3 px-3 py-3 rounded-lg text-left
                transition-all duration-200 border
                ${
                  isSelected
                    ? 'border-opacity-60 bg-opacity-10'
                    : 'border-[#1a1a2e] hover:border-opacity-40 bg-[#12121a]'
                }
              `}
              style={{
                borderColor: isSelected ? entryRegion?.color : undefined,
                backgroundColor: isSelected
                  ? `${entryRegion?.color}10`
                  : undefined,
              }}
            >
              <span className="text-2xl">{stimulus.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-[#e8e8f0] truncate">
                  {stimulus.name}
                </div>
                <div className="text-xs text-[#6b6b8a] truncate">
                  Entrada: {entryRegion?.shortName}
                </div>
              </div>
              {isSelected && (
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: entryRegion?.color }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Fire button */}
      {selectedStimulus && (
        <button
          onClick={onFire}
          disabled={isSimulating}
          className={`
            mt-2 w-full py-3 rounded-lg font-heading font-semibold text-sm
            uppercase tracking-wider transition-all duration-300
            ${
              isSimulating
                ? 'bg-[#1a1a2e] text-[#6b6b8a] cursor-not-allowed'
                : 'text-[#0a0a0f] hover:scale-[1.02] active:scale-[0.98]'
            }
          `}
          style={{
            backgroundColor: isSimulating
              ? undefined
              : brainRegions.find((r) => r.id === selectedStimulus.entryPoint)
                  ?.color,
            boxShadow: isSimulating
              ? undefined
              : `0 0 20px ${brainRegions.find((r) => r.id === selectedStimulus.entryPoint)?.color}40`,
          }}
        >
          {isSimulating ? '⚡ Simulando...' : '⚡ Disparar Sinal'}
        </button>
      )}

      {/* Stimulus description */}
      {selectedStimulus && (
        <div className="mt-1 p-3 rounded-lg bg-[#12121a] border border-[#1a1a2e]">
          <p className="text-xs text-[#6b6b8a] leading-relaxed">
            {selectedStimulus.description}
          </p>
        </div>
      )}
    </div>
  );
}
