import { useState, useCallback } from 'react';
import { BrainRegion, Stimulus, ToolMode } from './types';
import { useCircuitBuilder } from './hooks/useCircuitBuilder';
import { useSignalSimulation } from './hooks/useSignalSimulation';
import BrainCanvas from './components/BrainCanvas';
import StimulusPanel from './components/StimulusPanel';
import InfoPanel from './components/InfoPanel';
import Toolbar from './components/Toolbar';
import BiasResultModal from './components/BiasResultModal';
import Tutorial from './components/Tutorial';

function App() {
  const [toolMode, setToolMode] = useState<ToolMode>('connect');
  const [selectedRegion, setSelectedRegion] = useState<BrainRegion | null>(null);
  const [selectedStimulus, setSelectedStimulus] = useState<Stimulus | null>(null);
  const [showTutorial, setShowTutorial] = useState(true);
  const [ghostPath, setGhostPath] = useState<string[] | null>(null);

  const {
    connections,
    addConnection,
    removeConnection,
    clearAll,
    canConnect,
  } = useCircuitBuilder();

  const {
    simulation,
    activeRegions,
    fireSignal,
    clearResult,
  } = useSignalSimulation();

  const handleRegionClick = useCallback((region: BrainRegion) => {
    setSelectedRegion(region);
  }, []);

  const handleSelectStimulus = useCallback((stimulus: Stimulus) => {
    setSelectedStimulus(stimulus);
    clearResult();
    setGhostPath(null);
  }, [clearResult]);

  const handleFire = useCallback(() => {
    if (!selectedStimulus || simulation.isRunning) return;
    setGhostPath(null);
    fireSignal(selectedStimulus, connections);
  }, [selectedStimulus, simulation.isRunning, fireSignal, connections]);

  const handleShowCorrectPath = useCallback(() => {
    if (simulation.result?.correctPath) {
      setGhostPath(simulation.result.correctPath);
    }
  }, [simulation.result]);

  const handleCloseResult = useCallback(() => {
    clearResult();
    setGhostPath(null);
  }, [clearResult]);

  const handleClearAll = useCallback(() => {
    clearAll();
    clearResult();
    setGhostPath(null);
  }, [clearAll, clearResult]);

  return (
    <div className="w-full h-full flex flex-col bg-[#0a0a0f] overflow-hidden">
      {/* Tutorial */}
      {showTutorial && <Tutorial onComplete={() => setShowTutorial(false)} />}

      {/* Top bar */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-[#1a1a2e] shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="font-mono-sci text-lg font-bold text-[#e8e8f0] tracking-tight">
            <span className="text-[#4A90D9]">🧠</span> SYNAPSE
          </h1>
          <span className="text-xs text-[#2a2a4a] font-mono-sci hidden sm:block">
            Interactive Neural Circuit Builder
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Toolbar
            mode={toolMode}
            onModeChange={setToolMode}
            onClearAll={handleClearAll}
            connectionCount={connections.length}
          />
          <button
            onClick={() => setShowTutorial(true)}
            className="px-2 py-1.5 rounded-md text-xs text-[#6b6b8a] border border-[#1a1a2e] bg-[#12121a] hover:text-[#e8e8f0] hover:border-[#2a2a4a] transition-colors"
          >
            ? Tutorial
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 min-h-0">
        {/* Brain canvas area */}
        <div
          className={`flex-1 relative ${simulation.result?.type === 'bias' ? 'animate-shake' : ''}`}
        >
          <BrainCanvas
            connections={connections}
            toolMode={toolMode}
            selectedStimulus={selectedStimulus}
            simulation={simulation}
            activeRegions={activeRegions}
            ghostPath={ghostPath}
            onRegionClick={handleRegionClick}
            onAddConnection={addConnection}
            onRemoveConnection={removeConnection}
            canConnect={canConnect}
            selectedRegion={selectedRegion}
          />

          {/* Confetti effect on success */}
          {simulation.result?.type === 'success' && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    bottom: '0%',
                    backgroundColor: ['#2ECC71', '#4A90D9', '#F39C12', '#9B59B6', '#1ABC9C'][
                      i % 5
                    ],
                    animation: `confetti-fall ${1 + Math.random() * 1}s ease-out ${Math.random() * 0.5}s forwards`,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <aside className="w-72 border-l border-[#1a1a2e] p-4 flex flex-col gap-4 overflow-y-auto shrink-0">
          <StimulusPanel
            selectedStimulus={selectedStimulus}
            onSelect={handleSelectStimulus}
            onFire={handleFire}
            isSimulating={simulation.isRunning}
          />

          <div className="w-full h-px bg-[#1a1a2e]" />

          <div>
            <h2 className="font-heading text-sm font-semibold text-[#6b6b8a] uppercase tracking-wider mb-3">
              Info da Região
            </h2>
            <InfoPanel region={selectedRegion} />
            {!selectedRegion && (
              <p className="text-xs text-[#2a2a4a] italic">
                Clique em uma região para ver detalhes
              </p>
            )}
          </div>
        </aside>
      </div>

      {/* Bottom result panel */}
      {simulation.result && (
        <div className="shrink-0 border-t border-[#1a1a2e] p-4 max-h-[40vh] overflow-y-auto">
          <BiasResultModal
            result={simulation.result}
            onClose={handleCloseResult}
            onShowCorrectPath={handleShowCorrectPath}
          />
        </div>
      )}
    </div>
  );
}

export default App;
