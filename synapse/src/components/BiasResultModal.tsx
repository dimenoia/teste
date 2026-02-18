import React, { useState } from 'react';
import { SimulationResult } from '../types';
import { brainRegions } from '../data/brainRegions';

interface Props {
  result: SimulationResult;
  onClose: () => void;
  onShowCorrectPath: () => void;
}

export default function BiasResultModal({ result, onClose, onShowCorrectPath }: Props) {
  const [showingPath, setShowingPath] = useState(false);

  const isSuccess = result.type === 'success';
  const isBias = result.type === 'bias';
  const isIncomplete = result.type === 'incomplete';

  const borderColor = isSuccess ? '#2ECC71' : isBias ? '#E74C3C' : '#F39C12';
  const bgGlow = isSuccess ? '#2ECC7108' : isBias ? '#E74C3C08' : '#F39C1208';

  const getRegionName = (id: string) => {
    const r = brainRegions.find((reg) => reg.id === id);
    return r ? r.shortName : id;
  };

  return (
    <div className="animate-slide-up" style={{ background: bgGlow }}>
      <div
        className="rounded-xl border p-5 backdrop-blur-sm"
        style={{ borderColor: `${borderColor}40`, backgroundColor: '#0a0a0f' + 'ee' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {isSuccess && (
              <div className="text-3xl">✅</div>
            )}
            {isBias && result.bias && (
              <div className="text-3xl">{result.bias.emoji}</div>
            )}
            {isIncomplete && (
              <div className="text-3xl">⚠️</div>
            )}
            <div>
              <h2
                className="font-heading text-lg font-bold"
                style={{ color: borderColor }}
              >
                {isSuccess && 'Circuito Saudável!'}
                {isBias && result.bias?.name}
                {isIncomplete && 'Circuito Incompleto'}
              </h2>
              {result.path.length > 0 && (
                <div className="flex items-center gap-1 mt-1 flex-wrap">
                  {result.path.map((id, i) => (
                    <React.Fragment key={id}>
                      <span
                        className="text-xs px-1.5 py-0.5 rounded font-mono-sci"
                        style={{
                          backgroundColor: `${brainRegions.find((r) => r.id === id)?.color}20`,
                          color: brainRegions.find((r) => r.id === id)?.color,
                        }}
                      >
                        {getRegionName(id)}
                      </span>
                      {i < result.path.length - 1 && (
                        <span className="text-[#6b6b8a] text-xs">→</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[#6b6b8a] hover:text-[#e8e8f0] transition-colors text-lg leading-none p-1"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="space-y-3">
          {/* Description */}
          {isSuccess && (
            <p className="text-sm text-[#e8e8f0] leading-relaxed">
              O sinal percorreu o caminho neural ideal. Cada região contribuiu corretamente para
              o processamento: análise racional, memória, detecção de conflitos e intuição
              trabalharam em harmonia para uma decisão equilibrada.
            </p>
          )}

          {isBias && result.bias && (
            <>
              <p className="text-sm text-[#e8e8f0] leading-relaxed">
                {result.bias.description}
              </p>

              {/* What was missing */}
              <div className="p-3 rounded-lg bg-[#1a1a2e]/50 border border-[#2a2a4a]">
                <h4 className="text-xs font-semibold text-[#F39C12] mb-1 uppercase tracking-wide">
                  O que faltou no circuito
                </h4>
                <p className="text-xs text-[#6b6b8a] leading-relaxed">
                  {result.bias.missing}
                </p>
              </div>

              {/* Real example */}
              <div className="p-3 rounded-lg bg-[#1a1a2e]/50 border border-[#2a2a4a]">
                <h4 className="text-xs font-semibold text-[#9B59B6] mb-1 uppercase tracking-wide">
                  Exemplo Real
                </h4>
                <p className="text-xs text-[#6b6b8a] leading-relaxed italic">
                  {result.bias.realExample}
                </p>
              </div>
            </>
          )}

          {isIncomplete && (
            <p className="text-sm text-[#F39C12] leading-relaxed">
              {result.message}
            </p>
          )}

          {/* Correct path */}
          {result.correctPath && !isSuccess && (
            <div>
              {showingPath ? (
                <div className="p-3 rounded-lg bg-[#2ECC71]/5 border border-[#2ECC71]/20">
                  <h4 className="text-xs font-semibold text-[#2ECC71] mb-2 uppercase tracking-wide">
                    Caminho Ideal
                  </h4>
                  <div className="flex items-center gap-1 flex-wrap">
                    {result.correctPath.map((id, i) => (
                      <React.Fragment key={id}>
                        <span
                          className="text-xs px-1.5 py-0.5 rounded font-mono-sci"
                          style={{
                            backgroundColor: `${brainRegions.find((r) => r.id === id)?.color}20`,
                            color: brainRegions.find((r) => r.id === id)?.color,
                          }}
                        >
                          {getRegionName(id)}
                        </span>
                        {i < result.correctPath!.length - 1 && (
                          <span className="text-[#2ECC71] text-xs">→</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setShowingPath(true);
                    onShowCorrectPath();
                  }}
                  className="text-xs text-[#2ECC71] hover:text-[#2ECC71]/80 transition-colors underline underline-offset-2"
                >
                  Ver Circuito Correto →
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
