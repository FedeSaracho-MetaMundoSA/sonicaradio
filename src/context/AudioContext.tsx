import React, { createContext, useContext } from 'react';

interface AudioContextType {
  audioData: { bass: number; mid: number; treble: number };
  dataArray: Uint8Array | null;
}

export const AudioContext = createContext<AudioContextType>({
  audioData: { bass: 0, mid: 0, treble: 0 },
  dataArray: null
});

export const useAudioContext = () => useContext(AudioContext);
