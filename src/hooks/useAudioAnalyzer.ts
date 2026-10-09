import { useState, useEffect, useRef } from 'react';

export const useAudioAnalyzer = (audioElement: HTMLAudioElement | null) => {
  const [dataArray, setDataArray] = useState<Uint8Array | null>(null);
  const [audioData, setAudioData] = useState({ bass: 0, mid: 0, treble: 0 });
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  const initAnalyzer = () => {
    if (!audioElement) return;
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyzerRef.current = audioContextRef.current.createAnalyser();
      analyzerRef.current.fftSize = 256;
      
      try {
        sourceRef.current = audioContextRef.current.createMediaElementSource(audioElement);
        sourceRef.current.connect(analyzerRef.current);
        analyzerRef.current.connect(audioContextRef.current.destination);
      } catch (_e) {
        // silent fallback for CORS media element source
      }
    }
    
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
  };

  useEffect(() => {
    if (!audioElement) return;
    audioElement.addEventListener('play', initAnalyzer);
    
    return () => {
      audioElement.removeEventListener('play', initAnalyzer);
    };
  }, [audioElement]);

  useEffect(() => {
    let animationFrame: number;
    
    const updateData = () => {
      if (analyzerRef.current) {
        const bufferLength = analyzerRef.current.frequencyBinCount;
        const data = new Uint8Array(bufferLength);
        analyzerRef.current.getByteFrequencyData(data);
        setDataArray(data);

        let bassSum = 0;
        for (let i = 0; i < 16; i++) bassSum += data[i] || 0;
        const bass = bassSum / 16;

        let midSum = 0;
        for (let i = 16; i < 64; i++) midSum += data[i] || 0;
        const mid = midSum / 48;

        let trebleSum = 0;
        for (let i = 64; i < bufferLength; i++) trebleSum += data[i] || 0;
        const treble = bufferLength > 64 ? trebleSum / (bufferLength - 64) : 0;

        setAudioData({
          bass: bass / 255,
          mid: mid / 255,
          treble: treble / 255
        });
      }
      animationFrame = requestAnimationFrame(updateData);
    };

    updateData();
    
    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return { dataArray, audioData, initAnalyzer };
};
