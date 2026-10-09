import React from 'react';

export const VisualizerScene: React.FC<{ dataArray: Uint8Array | null }> = ({ dataArray }) => {
  return (
    <div className="w-full h-full flex items-center justify-center bg-black/20 rounded-full border border-white/10 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-purple-500/20" />
      <span className="text-white/30 text-xs font-mono tracking-widest">SÓNICA RADIO</span>
    </div>
  );
};
