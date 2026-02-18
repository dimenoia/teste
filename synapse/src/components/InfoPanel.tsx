import { BrainRegion } from '../types';

interface Props {
  region: BrainRegion | null;
}

export default function InfoPanel({ region }: Props) {
  if (!region) return null;

  return (
    <div
      className="p-4 rounded-xl"
      style={{
        border: `1px solid ${region.color}25`,
        background: `${region.color}08`,
        boxShadow: `0 0 20px ${region.color}08`,
      }}
    >
      <div className="flex items-center gap-2.5 mb-3">
        <div
          className="w-3 h-3 rounded-full"
          style={{
            backgroundColor: region.color,
            boxShadow: `0 0 8px ${region.color}80, 0 0 16px ${region.color}40`,
          }}
        />
        <h3 className="font-heading text-sm font-semibold text-[#e8e8f0]">
          {region.name}
        </h3>
      </div>
      <div className="mb-2.5 px-2.5 py-1.5 rounded-lg" style={{ background: 'rgba(0,0,0,0.3)' }}>
        <span className="text-[11px] font-mono-sci" style={{ color: region.color + 'CC' }}>{region.role}</span>
      </div>
      <p className="text-xs text-[#6b6b8a] leading-relaxed">{region.description}</p>
    </div>
  );
}
