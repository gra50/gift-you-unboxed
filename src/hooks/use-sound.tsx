import { useEffect, useRef, useState } from "react";

type SoundName = "click" | "transition" | "success" | "start";

interface SoundSettings {
  volume: number;
}

const soundVolumes: Record<SoundName, number> = {
  click: 0.3,
  transition: 0.25,
  success: 0.4,
  start: 0.35,
};

export const useSound = () => {
  const audioBuffers = useRef<Map<SoundName, AudioBuffer>>(new Map());
  const audioContext = useRef<AudioContext | null>(null);
  const [isMuted, setIsMuted] = useState(() => {
    const saved = localStorage.getItem("soundMuted");
    return saved === "true";
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Initialize Audio Context
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioContext.current = new AudioContextClass();

    // Preload all sounds
    const soundFiles: Record<SoundName, string> = {
      click: "/sounds/click.wav",
      transition: "/sounds/transition.wav",
      success: "/sounds/success.wav",
      start: "/sounds/start.wav",
    };

    const loadSound = async (name: SoundName, url: string) => {
      try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.current!.decodeAudioData(arrayBuffer);
        audioBuffers.current.set(name, audioBuffer);
      } catch (error) {
        console.error(`Failed to load sound: ${name}`, error);
      }
    };

    Promise.all(
      Object.entries(soundFiles).map(([name, url]) => loadSound(name as SoundName, url))
    ).then(() => setIsLoaded(true));

    return () => {
      if (audioContext.current) {
        audioContext.current.close();
      }
    };
  }, []);

  const playSound = (name: SoundName) => {
    if (isMuted || !isLoaded || !audioContext.current) return;

    const buffer = audioBuffers.current.get(name);
    if (!buffer) return;

    try {
      const source = audioContext.current.createBufferSource();
      const gainNode = audioContext.current.createGain();

      source.buffer = buffer;
      gainNode.gain.value = soundVolumes[name];

      source.connect(gainNode);
      gainNode.connect(audioContext.current.destination);

      source.start(0);
    } catch (error) {
      console.error(`Failed to play sound: ${name}`, error);
    }
  };

  const toggleMute = () => {
    setIsMuted((prev) => {
      const newValue = !prev;
      localStorage.setItem("soundMuted", String(newValue));
      return newValue;
    });
  };

  return { playSound, isMuted, toggleMute, isLoaded };
};
