import React, { useState, useEffect } from 'react';

const SystemClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-end leading-tight select-none cursor-default group">
        <span className="font-medium text-sm group-hover:text-blue-300 transition-colors">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
        <span className="text-[10px] text-white/60">
            {time.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}
        </span>
    </div>
  );
};

export default SystemClock;
