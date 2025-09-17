import React, { useState, useEffect, useCallback, useRef } from 'react';

// constants 파일에서 값들을 가져온다고 가정합니다.
// 이 파일이 없다면, 아래 값들을 직접 코드에 입력해야 합니다.
import {
  FOCUS_DURATIONS,
  BREAK_DURATIONS,
  DEFAULT_FOCUS_DURATION,
  DEFAULT_BREAK_DURATION,
  NOTIFICATION_SOUND,
} from '../constants';
import CatModal from './CatModal';

// enum을 일반 자바스크립트 객체로 변경
const TimerMode = {
  Focus: 'FOCUS',
  Break: 'BREAK',
};

// TimerDisplay 컴포넌트
const TimerDisplay = ({ seconds }) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return (
    <div className="text-7xl md:text-9xl font-bold tracking-tighter">
      {String(minutes).padStart(2, '0')}:{String(remainingSeconds).padStart(2, '0')}
    </div>
  );
};

// PomodoroTimer 메인 컴포넌트
const PomodoroTimer = ({ goal }) => {
  const [focusDuration, setFocusDuration] = useState(DEFAULT_FOCUS_DURATION * 60);
  const [breakDuration, setBreakDuration] = useState(DEFAULT_BREAK_DURATION * 60);
  const [mode, setMode] = useState(TimerMode.Focus);
  const [timeLeft, setTimeLeft] = useState(focusDuration);
  const [isActive, setIsActive] = useState(false);
  const [showCatModal, setShowCatModal] = useState(false);
  const [isAudioUnlocked, setIsAudioUnlocked] = useState(false);

  // 1. 시간 저장 기능: 페이지 로드 시 localStorage에서 데이터 불러오기
  const [totalFocusedSeconds, setTotalFocusedSeconds] = useState(() => {
    const saved = localStorage.getItem('pomodoro-total-seconds');
    const today = new Date().toLocaleDateString();
    const savedDate = localStorage.getItem('pomodoro-date');
    if (saved && today === savedDate) {
      return JSON.parse(saved);
    }
    return 0;
  });

  const audioRef = useRef(null);
  const intervalRef = useRef(null);
  const targetTimeRef = useRef(0);

  // 2. 시간 저장 기능: 시간이 바뀔 때마다 localStorage에 자동 저장하기
  useEffect(() => {
    localStorage.setItem('pomodoro-total-seconds', JSON.stringify(totalFocusedSeconds));
    localStorage.setItem('pomodoro-date', new Date().toLocaleDateString());
  }, [totalFocusedSeconds]);

  useEffect(() => {
    audioRef.current = new Audio(NOTIFICATION_SOUND);
  }, []);

  const playSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.error("Error playing sound:", e));
    }
  }, []);

  const unlockAudio = useCallback(() => {
    if (!isAudioUnlocked && audioRef.current) {
      audioRef.current.play().catch(() => {});
      audioRef.current.pause();
      setIsAudioUnlocked(true);
    }
  }, [isAudioUnlocked]);

  const switchMode = useCallback(() => {
    playSound();
    const isFocus = mode === TimerMode.Focus;
    if (isFocus) {
      setTotalFocusedSeconds(prev => prev + focusDuration);
    }
    const nextMode = isFocus ? TimerMode.Break : TimerMode.Focus;
    const nextDuration = isFocus ? breakDuration : focusDuration;
    setMode(nextMode);
    setTimeLeft(nextDuration);
  }, [mode, focusDuration, breakDuration, playSound]);

  useEffect(() => {
    if (isActive) {
      targetTimeRef.current = Date.now() + timeLeft * 1000;
      intervalRef.current = setInterval(() => {
        const newTimeLeft = Math.round((targetTimeRef.current - Date.now()) / 1000);
        if (newTimeLeft < 1) {
          switchMode();
        } else {
          setTimeLeft(newTimeLeft);
        }
      }, 1000);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, switchMode, timeLeft]);

  // ★★★ PAUSE 버그 최종 수정된 부분 ★★★
  // 이제 이 로직은 오직 '시간 설정 버튼'을 눌렀을 때만 작동하며, 'Pause' 버튼에는 전혀 영향을 주지 않습니다.
  useEffect(() => {
    if (mode === TimerMode.Focus && !isActive) {
      setTimeLeft(focusDuration);
    }
  }, [focusDuration]);
  
  useEffect(() => {
    if (mode === TimerMode.Break && !isActive) {
      setTimeLeft(breakDuration);
    }
  }, [breakDuration]);
  // ==========================================

  const handleStartPause = () => {
    unlockAudio();
    setIsActive(!isActive);
  };
  
  const handleSaveReset = () => {
    unlockAudio();
    playSound();
    if (mode === TimerMode.Focus && timeLeft < focusDuration && isActive) {
        const focusedTime = focusDuration - timeLeft;
        setTotalFocusedSeconds(prev => prev + focusedTime);
    }
    setIsActive(false);
    setMode(TimerMode.Focus);
    setTimeLeft(focusDuration);
  };
  
  const totalMinutesFocused = Math.floor(totalFocusedSeconds / 60);
  
  const themeClasses = mode === TimerMode.Focus ? 'bg-gray-900 text-white' : 'bg-blue-900 text-white';
  const totalFocusColorClass = mode === TimerMode.Focus ? 'text-cyan-300' : 'text-yellow-300';
  const startPauseButtonClass = mode === TimerMode.Focus
    ? (isActive ? 'bg-cyan-600 hover:bg-cyan-700' : 'bg-cyan-500 hover:bg-cyan-600')
    : (isActive ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-yellow-500 hover:bg-yellow-600');
  const configButtonSelectedClass = mode === TimerMode.Focus
    ? 'bg-cyan-500 text-gray-900'
    : 'bg-yellow-500 text-gray-900';
    
  const renderConfigButton = (
    valueInMinutes,
    currentValueInSeconds,
    setter,
    unit
  ) => {
    const valueInSeconds = valueInMinutes * 60;
    const isSelected = valueInSeconds === currentValueInSeconds;
    return (
      <button
        key={`${unit}-${valueInMinutes}`}
        type="button"
        onClick={() => setter(valueInSeconds)}
        disabled={isActive}
        className={`px-4 py-2 rounded-lg transition-all text-sm font-medium
          ${isSelected ? configButtonSelectedClass : `bg-white/10 hover:bg-white/20`}
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
        Total Focus Today: <span className={`font-bold ${totalFocusColorClass}`}>{totalMinutesFocused} min</span>
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
            <button
              type="button"
              onClick={handleStartPause}
              className={`px-10 py-4 text-2xl font-bold rounded-lg transition-transform transform hover:scale-105 text-gray-900 ${startPauseButtonClass}`}
            >
                {isActive ? 'Pause' : 'Start'}
            </button>
            <button
              type="button"
              onClick={handleSaveReset}
              className="px-10 py-4 text-2xl font-bold rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
            >
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
        <button
          type="button"
          onClick={() => setShowCatModal(true)}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-full shadow-lg transition-transform transform hover:scale-105"
        >
          I can't focus
        </button>
      </div>
      <CatModal isOpen={showCatModal} onClose={() => setShowCatModal(false)} />
    </main>
  );
};

export default PomodoroTimer;