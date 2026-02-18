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

  const accentColor = isSuccess ? '#51CF66' : isBias ? '#FF6B6B' : '#FF922B';

  const getRegionName = (id: string) => {
    const r = brainRegions.find((reg) => reg.id === id);
    return r ? r.shortName : id;
  };

  return (
    <div className="result-stagger">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {isSuccess && <div className="text-3xl">✅</div>}
          {isBias && result.bias && <div className="text-3xl">{result.bias.emoji}</div>}
          {isIncomplete && <div className="text-3xl">⚠️</div>}
          <div>
            <h2
              className={`font-heading text-xl font-bold ${isBias ? 'glitch-text' : ''}`}
              style={{ color: accentColor }}
            >
              {isSuccess && 'Circuito Saudavel!'}
              {isBias && result.bias?.name}
              {isIncomplete && 'Circuito Incompleto'}
            </h2>
            {result.path.length > 0 && (
              <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                {result.path.map((id, i) => {
                  const reg = brainRegions.find((r) => r.id === id);
                  return (
                    <React.Fragment key={id}>
                      <span
                        className="text-xs px-2 py-0.5 rounded-md font-mono-sci"
                        style={{
                          backgroundColor: `${reg?.color}18`,
                          color: reg?.color,
                          textShadow: `0 0 6px ${reg?.color}40`,
                        }}
                      >
                        {getRegionName(id)}
                      </span>
                      {i < result.path.length - 1 && (
                        <span className="text-[#6b6b8a] text-xs">&rarr;</span>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-[#6b6b8a] hover:text-[#e8e8f0] transition-colors text-lg leading-none p-1 rounded-lg"
          style={{ border: '1px solid rgba(100, 120, 255, 0.1)' }}
        >
          ✕
        </button>
      </div>

      <div className="space-y-3">
        {isSuccess && (
          <p className="text-sm text-[#e8e8f0] leading-relaxed">
            O sinal percorreu o caminho neural ideal. Cada regiao contribuiu corretamente para
            o processamento: analise racional, memoria, deteccao de conflitos e intuicao
            trabalharam em harmonia para uma decisao equilibrada.
          </p>
        )}

        {isBias && result.bias && (
          <>
            <p className="text-sm text-[#e8e8f0] leading-relaxed">
              {result.bias.description}
            </p>

            <div className="p-3.5 rounded-xl" style={{ background: 'rgba(255, 212, 59, 0.05)', border: '1px solid rgba(255, 212, 59, 0.15)' }}>
              <h4 className="text-xs font-semibold text-[#FFD43B] mb-1 uppercase tracking-wider font-mono-sci">
                O que faltou no circuito
              </h4>
              <p className="text-xs text-[#6b6b8a] leading-relaxed">
                {result.bias.missing}
              </p>
            </div>

            <div className="p-3.5 rounded-xl" style={{ background: 'rgba(204, 93, 232, 0.05)', border: '1px solid rgba(204, 93, 232, 0.15)' }}>
              <h4 className="text-xs font-semibold text-[#CC5DE8] mb-1 uppercase tracking-wider font-mono-sci">
                Exemplo Real
              </h4>
              <p className="text-xs text-[#6b6b8a] leading-relaxed italic">
                {result.bias.realExample}
              </p>
            </div>
          </>
        )}

        {isIncomplete && (
          <p className="text-sm text-[#FF922B] leading-relaxed">
            {result.message}
          </p>
        )}

        {result.correctPath && !isSuccess && (
          <div>
            {showingPath ? (
              <div className="p-3.5 rounded-xl" style={{ background: 'rgba(81, 207, 102, 0.05)', border: '1px solid rgba(81, 207, 102, 0.2)' }}>
                <h4 className="text-xs font-semibold text-[#51CF66] mb-2 uppercase tracking-wider font-mono-sci">
                  Caminho Ideal
                </h4>
                <div className="flex items-center gap-1 flex-wrap">
                  {result.correctPath.map((id, i) => {
                    const reg = brainRegions.find((r) => r.id === id);
                    return (
                      <React.Fragment key={id}>
                        <span
                          className="text-xs px-2 py-0.5 rounded-md font-mono-sci"
                          style={{
                            backgroundColor: `${reg?.color}18`,
                            color: reg?.color,
                            textShadow: `0 0 6px ${reg?.color}40`,
                          }}
                        >
                          {getRegionName(id)}
                        </span>
                        {i < result.correctPath!.length - 1 && (
                          <span className="text-[#51CF66] text-xs">&rarr;</span>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  setShowingPath(true);
                  onShowCorrectPath();
                }}
                className="text-xs text-[#51CF66] hover:text-[#51CF66]/80 transition-colors font-mono-sci"
                style={{ textShadow: '0 0 8px rgba(81, 207, 102, 0.3)' }}
              >
                {'>'} Ver Circuito Correto
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
