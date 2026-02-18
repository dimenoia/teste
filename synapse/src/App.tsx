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
    <div className="w-full h-full flex flex-col overflow-hidden" style={{ background: 'radial-gradient(ellipse at 40% 40%, #0d1117 0%, #080b10 40%, #050608 100%)' }}>
      {showTutorial && <Tutorial onComplete={() => setShowTutorial(false)} />}

      {/* Top bar */}
      <header className="flex items-center justify-between px-5 py-3 shrink-0" style={{ borderBottom: '1px solid rgba(100, 120, 255, 0.08)', background: 'rgba(8, 11, 16, 0.6)', backdropFilter: 'blur(12px)' }}>
        <div className="flex items-center gap-3">
          <h1 className="font-mono-sci text-lg font-bold tracking-[4px] text-[#e8e8f0]">
            <span style={{ textShadow: '0 0 12px rgba(91, 155, 213, 0.5)' }}>S</span>
            <span style={{ textShadow: '0 0 12px rgba(204, 93, 232, 0.5)' }}>Y</span>
            <span style={{ textShadow: '0 0 12px rgba(81, 207, 102, 0.5)' }}>N</span>
            <span style={{ textShadow: '0 0 12px rgba(255, 107, 107, 0.5)' }}>A</span>
            <span style={{ textShadow: '0 0 12px rgba(255, 212, 59, 0.5)' }}>P</span>
            <span style={{ textShadow: '0 0 12px rgba(32, 201, 151, 0.5)' }}>S</span>
            <span style={{ textShadow: '0 0 12px rgba(255, 146, 43, 0.5)' }}>E</span>
          </h1>
          <span className="text-[10px] text-[#6b6b8a] font-mono-sci hidden sm:block tracking-wider uppercase">
            Neural Circuit Builder
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
            className="px-2.5 py-1.5 rounded-lg text-xs text-[#6b6b8a] transition-all duration-200 hover:text-[#e8e8f0]"
            style={{ border: '1px solid rgba(100, 120, 255, 0.1)', background: 'rgba(100, 120, 255, 0.03)' }}
          >
            ? Tutorial
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 min-h-0">
        <div className={`flex-1 relative ${simulation.result?.type === 'bias' ? 'animate-shake' : ''}`}>
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

          {simulation.result?.type === 'success' && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    bottom: '0%',
                    backgroundColor: ['#51CF66', '#5B9BD5', '#FFD43B', '#CC5DE8', '#20C997'][i % 5],
                    animation: `confetti-fall ${1 + Math.random() * 1}s ease-out ${Math.random() * 0.5}s forwards`,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside
          className="w-72 p-4 flex flex-col gap-4 overflow-y-auto shrink-0"
          style={{
            borderLeft: '1px solid rgba(100, 120, 255, 0.08)',
            background: 'rgba(12, 14, 20, 0.8)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <StimulusPanel
            selectedStimulus={selectedStimulus}
            onSelect={handleSelectStimulus}
            onFire={handleFire}
            isSimulating={simulation.isRunning}
          />

          <div className="w-full h-px" style={{ background: 'rgba(100, 120, 255, 0.08)' }} />

          <div>
            <h2 className="font-heading text-xs font-semibold text-[#6b6b8a] uppercase tracking-[3px] mb-3">
              Info da Regiao
            </h2>
            <InfoPanel region={selectedRegion} />
            {!selectedRegion && (
              <p className="text-xs text-[#2a2a4a] italic">
                Clique em uma regiao para ver detalhes
              </p>
            )}
          </div>
        </aside>
      </div>

      {/* Bottom result */}
      {simulation.result && (
        <div className="shrink-0 p-4 max-h-[40vh] overflow-y-auto animate-slide-up"
          style={{
            borderTop: `2px solid ${simulation.result.type === 'success' ? 'rgba(81, 207, 102, 0.4)' : simulation.result.type === 'bias' ? 'rgba(255, 107, 107, 0.4)' : 'rgba(255, 146, 43, 0.4)'}`,
            background: simulation.result.type === 'success' ? 'rgba(34, 139, 34, 0.06)' : simulation.result.type === 'bias' ? 'rgba(180, 40, 40, 0.06)' : 'rgba(180, 120, 40, 0.06)',
          }}
        >
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
