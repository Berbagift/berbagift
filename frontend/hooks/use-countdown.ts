import { useState, useEffect } from 'react';

export function useCountdown(initialSeconds: number) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isFinished, setIsFinished] = useState(initialSeconds <= 0);

  useEffect(() => {
    // Reset state if initialSeconds changes
    setTimeLeft(initialSeconds);
    setIsFinished(initialSeconds <= 0);
  }, [initialSeconds]);

  useEffect(() => {
    if (isFinished || timeLeft <= 0) return;

    const intervalId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalId);
          setIsFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isFinished, timeLeft]);

  // Format as HH:MM:SS
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    
    const pad = (num: number) => num.toString().padStart(2, '0');
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  };

  return {
    timeLeft,
    isFinished,
    formattedTime: formatTime(timeLeft),
  };
}
