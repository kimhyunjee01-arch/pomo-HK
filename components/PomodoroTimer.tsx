import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TimerMode } from '../types';
import {
  FOCUS_DURATIONS,
  BREAK_DURATIONS,
  DEFAULT_FOCUS_DURATION,
  DEFAULT_BREAK_DURATION,
  NOTIFICATION_SOUND,
} from '../constants';
import CatModal from './CatModal';

interface PomodoroTimerProps {
  goal: string;
}

// Helper component defined outside to prevent re-creation on re-renders
const TimerDisplay: React.FC<{ seconds: number }> = ({ seconds }) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return (
    <div className="text-7xl md:text-9xl font-bold tracking-tighter">
      {String(minutes).padStart(2, '0')}:{String(remainingSeconds).padStart(2, '0')}
    </div>
  );
};

const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ goal }) => {
  const [focusDuration, setFocusDuration] = useState(DEFAULT_FOCUS_DURATION * 60);
  const [breakDuration, setBreakDuration] = useState(DEFAULT_BREAK_DURATION * 60);
  const [mode, setMode] = useState<TimerMode>(TimerMode.Focus);
  const [timeLeft, setTimeLeft] = useState(focusDuration);
  const [isActive, setIsActive] = useState(false);
  const [totalFocusedSeconds, setTotalFocusedSeconds] = useState(0);
  const [showCatModal, setShowCatModal] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  // FIX: Changed NodeJS.Timeout to ReturnType<typeof setInterval> for browser compatibility.
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(NOTIFICATION_SOUND);
  }, []);

  const switchMode = useCallback(() => {
    if (audioRef.current) {
        audioRef.current.play().catch(e => console.error("Error playing sound:", e));
    }
    
    if (mode === TimerMode.Focus) {
      setTotalFocusedSeconds(prev => prev + focusDuration);
      setMode(TimerMode.Break);
      setTimeLeft(breakDuration);
    } else {
      setMode(TimerMode.Focus);
      setTimeLeft(focusDuration);
    }
  }, [mode, focusDuration, breakDuration]);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            switchMode();
            return 0; // Returning 0 will be overwritten by switchMode's setTimeLeft
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, switchMode]);

  useEffect(() => {
    if (!isActive) {
      setTimeLeft(mode === TimerMode.Focus ? focusDuration : breakDuration);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusDuration, breakDuration]);

  const handleStartPause = () => {
    setIsActive(!isActive);
  };
  
  const handleSaveReset = () => {
    if (mode === TimerMode.Focus && timeLeft < focusDuration) {
        const focusedTime = focusDuration - timeLeft;
        setTotalFocusedSeconds(prev => prev + focusedTime);
    }
    setIsActive(false);
    setMode(TimerMode.Focus);
    setTimeLeft(focusDuration);
  };
  
  const totalMinutesFocused = Math.floor(totalFocusedSeconds / 60);

  const themeClasses = mode === TimerMode.Focus
    ? 'bg-gray-900 text-white'
    : 'bg-blue-900 text-white';

  const accentColor = mode === TimerMode.Focus ? 'cyan' : 'yellow';

  // FIX: Refactored to remove generic <T> which caused a TS error because T is not assignable to ReactNode.
  // This also fixes a UI bug where seconds were displayed instead of minutes (e.g., "1800 min" instead of "30 min").
  const renderConfigButton = (
    valueInMinutes: number,
    currentValueInSeconds: number,
    setter: (valInSeconds: number) => void,
    unit: string
  ) => {
    const valueInSeconds = valueInMinutes * 60;
    const isSelected = valueInSeconds === currentValueInSeconds;
    return (
      <button
        key={`${unit}-${valueInMinutes}`}
        onClick={() => setter(valueInSeconds)}
        disabled={isActive}
        className={`px-4 py-2 rounded-lg transition-all text-sm font-medium
                ${isSelected ? `bg-${accentColor}-500 text-gray-900` : `bg-white/10 hover:bg-white/20`}
                ${isActive ? 'opacity-50 cursor-not-allowed' : ''}
            `}
      >
        {valueInMinutes} {unit}
      </button>
    );
  };
  
  return (
    <main className={`flex flex-col items-center justify-center min-h-screen p-4 transition-colors duration-1000 ${themeClasses}`}>
      <div className="absolute top-4 right-4 text-lg bg-white/10 px-4 py-2 rounded-full">
        Total Focus Today: <span className={`font-bold text-${accentColor}-300`}>{totalMinutesFocused} min</span>
      </div>

      <div className="text-center w-full max-w-2xl flex flex-col items-center">
        <h1 className="text-2xl md:text-3xl font-light text-gray-300 mb-2 truncate px-4">{goal}</h1>
        <div className="mb-8 p-4 rounded-xl bg-black/20 backdrop-blur-sm w-full">
            <TimerDisplay seconds={timeLeft} />
            <p className="text-xl font-medium tracking-widest uppercase text-gray-400">
                {mode}
            </p>
        </div>

        <div className="flex items-center justify-center gap-4 mb-8">
            <button onClick={handleStartPause} className={`px-10 py-4 text-2xl font-bold rounded-lg transition-transform transform hover:scale-105
                ${isActive ? `bg-${accentColor}-600 hover:bg-${accentColor}-700` : `bg-${accentColor}-500 hover:bg-${accentColor}-600`} text-gray-900`}>
                {isActive ? 'Pause' : 'Start'}
            </button>
            <button onClick={handleSaveReset} className="px-10 py-4 text-2xl font-bold rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
                Save & Reset
            </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 p-4 bg-black/20 rounded-lg">
            <div className="flex items-center gap-2">
                <span className="font-semibold w-20">Focus:</span>
                <div className="flex gap-2">
                {FOCUS_DURATIONS.map(dur => renderConfigButton(dur, focusDuration, setFocusDuration, 'min'))}
                </div>
            </div>
            <div className="flex items-center gap-2">
                <span className="font-semibold w-20">Break:</span>
                <div className="flex gap-2">
                {BREAK_DURATIONS.map(dur => renderConfigButton(dur, breakDuration, setBreakDuration, 'min'))}
                </div>
            </div>
        </div>

      </div>

      <div className="absolute bottom-5">
        <button onClick={() => setShowCatModal(true)} className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-full shadow-lg transition-transform transform hover:scale-105">
            I can't focus
        </button>
      </div>
      <CatModal isOpen={showCatModal} onClose={() => setShowCatModal(false)} />
    </main>
  );
};

export default PomodoroTimer;