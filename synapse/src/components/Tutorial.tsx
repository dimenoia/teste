import { useState } from 'react';

interface Props {
  onComplete: () => void;
}

const steps = [
  {
    emoji: '🧠',
    title: 'Bem-vindo ao Synapse!',
    text: 'Explore o cerebro, construa circuitos neurais e descubra como vieses cognitivos se formam.',
  },
  {
    emoji: '👆',
    title: 'Explore as Regioes',
    text: 'Clique em qualquer regiao cerebral para ver sua funcao. Cada uma tem um papel unico no processamento neural.',
  },
  {
    emoji: '🔗',
    title: 'Crie Conexoes',
    text: 'No modo "Conectar", arraste de uma regiao a outra para criar uma sinapse. O sinal viajara por essas conexoes.',
  },
  {
    emoji: '⚡',
    title: 'Dispare Estimulos',
    text: 'Escolha um estimulo no painel lateral e clique "Disparar". O sinal viaja pelo seu circuito e revela se ha vieses!',
  },
];

export default function Tutorial({ onComplete }: Props) {
  const [step, setStep] = useState(0);

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const currentStep = steps[step];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(5, 6, 8, 0.85)', backdropFilter: 'blur(8px)' }}>
      <div
        className="max-w-md mx-4 rounded-2xl p-8 text-center animate-slide-up"
        style={{
          border: '1px solid rgba(100, 120, 255, 0.12)',
          background: 'rgba(13, 17, 23, 0.95)',
          boxShadow: '0 0 60px rgba(100, 120, 255, 0.08)',
        }}
      >
        <div className="text-5xl mb-5">{currentStep.emoji}</div>
        <h2 className="font-heading text-xl font-bold text-[#e8e8f0] mb-3 tracking-wide">
          {currentStep.title}
        </h2>
        <p className="text-sm text-[#6b6b8a] leading-relaxed mb-6">
          {currentStep.text}
        </p>

        <div className="flex items-center justify-center gap-2 mb-6">
          {steps.map((_, i) => (
            <div
              key={i}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: i === step ? '24px' : '8px',
                background: i === step ? '#5B9BD5' : i < step ? 'rgba(91, 155, 213, 0.4)' : 'rgba(100, 120, 255, 0.1)',
                boxShadow: i === step ? '0 0 8px rgba(91, 155, 213, 0.5)' : 'none',
              }}
            />
          ))}
        </div>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={onComplete}
            className="px-4 py-2 rounded-lg text-xs text-[#6b6b8a] hover:text-[#e8e8f0] transition-colors font-heading"
          >
            Pular
          </button>
          <button
            onClick={handleNext}
            className="px-6 py-2.5 rounded-xl font-heading font-semibold text-sm transition-all duration-200"
            style={{
              background: '#5B9BD5',
              color: '#0a0a0f',
              boxShadow: '0 0 20px rgba(91, 155, 213, 0.3)',
            }}
          >
            {step < steps.length - 1 ? 'Proximo' : 'Comecar!'}
          </button>
        </div>
      </div>
    </div>
  );
}
