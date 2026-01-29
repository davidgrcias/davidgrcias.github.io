import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';

/**
 * Calendar - Interactive calendar widget
 * Features: Month view, today highlight, booking links
 */
const Calendar = ({ isOpen, onClose, isPopover = false, wrapperClassName = '', position = 'left' }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const calUrl = 'https://cal.com/davidgrcias/30min';

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const openBooking = (date) => {
    const dateStr = formatDate(date);
    const url = `${calUrl}?date=${dateStr}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="aspect-square"></div>
      );
    }

    // Calendar days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const today = isToday(date);

      days.push(
        <motion.button
          key={day}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => openBooking(date)}
          className={`
            aspect-square rounded-lg p-1 flex flex-col items-center justify-center
            transition-all duration-200 relative
            ${today ? 'bg-blue-600 text-white font-bold' : ''}
            ${!today ? 'text-zinc-300 hover:bg-white/10' : ''}
          `}
        >
          <span className="text-sm">{day}</span>
        </motion.button>
      );
    }

    return days;
  };

  if (!isOpen) return null;

  const wrapperClasses = isPopover
    ? `relative z-[10000] pointer-events-auto ${wrapperClassName}`
    : position === 'right'
      ? 'fixed bottom-20 right-6 z-[9997] pointer-events-auto'
      : 'fixed bottom-20 left-6 z-[9997] pointer-events-auto';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className={wrapperClasses}
      >
        <div className="bg-zinc-900/95 backdrop-blur-xl border border-zinc-700 rounded-2xl shadow-2xl w-80 max-w-[calc(100vw-3rem)] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <CalendarIcon className="text-blue-400" size={20} />
              <span className="text-white font-semibold">Calendar</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-zinc-400"
            >
              <X size={16} />
            </motion.button>
          </div>

          {/* Month Navigation */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-800">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={previousMonth}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-zinc-400"
            >
              <ChevronLeft size={20} />
            </motion.button>
            <h3 className="text-white font-semibold">
              {months[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={nextMonth}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-zinc-400"
            >
              <ChevronRight size={20} />
            </motion.button>
          </div>

          {/* Calendar Grid */}
          <div className="p-4">
            {/* Days of week */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {daysOfWeek.map(day => (
                <div key={day} className="text-center text-xs text-zinc-500 font-semibold">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-2">
              {renderCalendarDays()}
            </div>
          </div>

          {/* Booking helper */}
          <div className="border-t border-zinc-800 p-4">
            <p className="text-xs text-zinc-400">
              Click any date to book a meeting on Cal.com.
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Calendar;
