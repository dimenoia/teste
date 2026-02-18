import { BrainRegion } from '../types';

interface Props {
  region: BrainRegion | null;
}

export default function InfoPanel({ region }: Props) {
  if (!region) return null;

  return (
    <div className="p-3 rounded-lg border bg-[#12121a]" style={{ borderColor: `${region.color}30` }}>
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: region.color, boxShadow: `0 0 8px ${region.color}60` }}
        />
        <h3 className="font-heading text-sm font-semibold text-[#e8e8f0]">
          {region.name}
        </h3>
      </div>
      <div className="mb-2 px-2 py-1 rounded bg-[#0a0a0f]">
        <span className="text-xs text-[#6b6b8a] font-mono-sci">{region.role}</span>
      </div>
      <p className="text-xs text-[#6b6b8a] leading-relaxed">{region.description}</p>
    </div>
  );
}
