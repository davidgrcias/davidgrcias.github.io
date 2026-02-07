import React, { useEffect, useRef, useState } from 'react';
import Calendar from '../widgets/Calendar';
import { useSound } from '../../contexts/SoundContext';

const SystemClock = () => {
  const [time, setTime] = useState(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const wrapperRef = useRef(null);
  const { playMenuOpen, playMenuClose } = useSound();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!isCalendarOpen) return;

    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsCalendarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isCalendarOpen]);

  return (
    <div ref={wrapperRef} className="relative flex flex-col items-end leading-tight select-none">
      <button
        onClick={() => {
          const next = !isCalendarOpen;
          if (next) playMenuOpen(); else playMenuClose();
          setIsCalendarOpen(next);
        }}
        className="flex flex-col items-end cursor-pointer group"
        aria-label="Toggle calendar"
      >
        <span className="font-medium text-sm group-hover:text-blue-300 transition-colors">
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
        <span className="text-[10px] text-white/60">
          {time.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}
        </span>
      </button>

      {isCalendarOpen && (
        <Calendar
          isOpen={true}
          onClose={() => setIsCalendarOpen(false)}
          position="right"
        />
      )}
    </div>
  );
};

export default SystemClock;
