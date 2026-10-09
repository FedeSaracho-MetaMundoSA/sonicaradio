import React, { useState, useEffect, useRef } from 'react';

export const HeroVideoBackground: React.FC = () => {
  const [activeVideo, setActiveVideo] = useState(1);

  const handleEnded = () => {
    setActiveVideo((prev) => (prev === 2 ? 1 : prev + 1));
  };

  const videos = [
    '/videohero1.mp4',
    '/videohero2.mp4',
  ];

  return (
    <>
      {videos.map((src, index) => {
        const videoIndex = index + 1;
        const isActive = activeVideo === videoIndex;
        
        return (
          <VideoPlayer
            key={src}
            src={src}
            isActive={isActive}
            onEnded={handleEnded}
          />
        );
      })}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/80 z-10 pointer-events-none" />
    </>
  );
};

interface VideoPlayerProps {
  src: string;
  isActive: boolean;
  onEnded: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, isActive, onEnded }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isActive && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.playbackRate = 0.5; // Slow down the video by half
      videoRef.current.play().catch(() => {});
    } else if (!isActive && videoRef.current) {
      // Opcional: pausar el video cuando no está activo para ahorrar recursos
      // usamos timeout para darle tiempo a la transición de fade antes de pausar
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.pause();
        }
      }, 1000);
    }
  }, [isActive]);

  return (
    <video
      ref={videoRef}
      src={src}
      muted
      playsInline
      autoPlay={isActive}
      preload="auto"
      onEnded={onEnded}
      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 z-0 ${
        isActive ? 'opacity-100' : 'opacity-0'
      }`}
    />
  );
};

