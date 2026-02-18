import { useState } from 'react';

interface Props {
  onComplete: () => void;
}

const steps = [
  {
    emoji: '🧠',
    title: 'Bem-vindo ao Synapse!',
    text: 'Explore o cérebro, construa circuitos neurais e descubra como vieses cognitivos se formam.',
  },
  {
    emoji: '👆',
    title: 'Explore as Regiões',
    text: 'Clique em qualquer região cerebral para ver sua função. Cada uma tem um papel único no processamento neural.',
  },
  {
    emoji: '🔗',
    title: 'Crie Conexões',
    text: 'No modo "Conectar", arraste de uma região a outra para criar uma sinapse. O sinal viajará por essas conexões.',
  },
  {
    emoji: '⚡',
    title: 'Dispare Estímulos',
    text: 'Escolha um estímulo no painel lateral e clique "Disparar". O sinal viaja pelo seu circuito e revela se há vieses!',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a0f]/80 backdrop-blur-sm">
      <div
        className="max-w-md mx-4 rounded-xl border border-[#2a2a4a] bg-[#12121a] p-8 text-center animate-slide-up"
      >
        <div className="text-5xl mb-4">{currentStep.emoji}</div>
        <h2 className="font-heading text-xl font-bold text-[#e8e8f0] mb-3">
          {currentStep.title}
        </h2>
        <p className="text-sm text-[#6b6b8a] leading-relaxed mb-6">
          {currentStep.text}
        </p>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === step ? 'bg-[#4A90D9] w-6' : i < step ? 'bg-[#4A90D9]/40' : 'bg-[#2a2a4a]'
              }`}
            />
          ))}
        </div>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={onComplete}
            className="px-4 py-2 rounded-lg text-xs text-[#6b6b8a] hover:text-[#e8e8f0] transition-colors"
          >
            Pular
          </button>
          <button
            onClick={handleNext}
            className="px-6 py-2 rounded-lg bg-[#4A90D9] text-[#0a0a0f] font-semibold text-sm hover:bg-[#4A90D9]/90 transition-colors"
          >
            {step < steps.length - 1 ? 'Próximo' : 'Começar!'}
          </button>
        </div>
      </div>
    </div>
  );
}
