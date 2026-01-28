import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Star, X } from 'lucide-react';

/**
 * Calendar - Interactive calendar widget
 * Features: Month view, events, today highlight
 */
const Calendar = ({ isOpen, onClose, isPopover = false, wrapperClassName = '', position = 'left' }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Demo events
  const events = [
    { date: '2026-01-28', title: 'Portfolio Review', type: 'work' },
    { date: '2026-01-30', title: 'Client Meeting', type: 'meeting' },
    { date: '2026-02-01', title: 'Code Review', type: 'work' },
    { date: '2026-02-05', title: 'Birthday 🎂', type: 'personal' },
  ];

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

  const getEventsForDate = (date) => {
    const dateStr = formatDate(date);
    return events.filter(e => e.date === dateStr);
  };

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const isSelected = (date) => {
    return date.getDate() === selectedDate.getDate() &&
           date.getMonth() === selectedDate.getMonth() &&
           date.getFullYear() === selectedDate.getFullYear();
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
      const dayEvents = getEventsForDate(date);
      const today = isToday(date);
      const selected = isSelected(date);

      days.push(
        <motion.button
          key={day}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setSelectedDate(date)}
          className={`
            aspect-square rounded-lg p-1 flex flex-col items-center justify-center
            transition-all duration-200 relative
            ${today ? 'bg-blue-600 text-white font-bold' : ''}
            ${selected && !today ? 'bg-blue-600/20 border-2 border-blue-500 text-white' : ''}
            ${!today && !selected ? 'text-zinc-300 hover:bg-white/10' : ''}
          `}
        >
          <span className="text-sm">{day}</span>
          {dayEvents.length > 0 && (
            <div className="flex gap-0.5 mt-0.5">
              {dayEvents.slice(0, 3).map((event, idx) => (
                <div
                  key={idx}
                  className={`w-1 h-1 rounded-full ${
                    event.type === 'work' ? 'bg-yellow-400' :
                    event.type === 'meeting' ? 'bg-green-400' :
                    'bg-pink-400'
                  }`}
                />
              ))}
            </div>
          )}
        </motion.button>
      );
    }

    return days;
  };

  const selectedEvents = getEventsForDate(selectedDate);

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
        <div className="bg-zinc-900/95 backdrop-blur-xl border border-zinc-700 rounded-2xl shadow-2xl w-80 overflow-hidden">
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

          {/* Selected Date Events */}
          {selectedEvents.length > 0 && (
            <div className="border-t border-zinc-800 p-4">
              <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                <Clock size={16} className="text-blue-400" />
                Events on {selectedDate.getDate()} {months[selectedDate.getMonth()]}
              </h4>
              <div className="space-y-2">
                {selectedEvents.map((event, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`
                      p-3 rounded-lg border-l-4 flex items-start gap-2
                      ${event.type === 'work' ? 'bg-yellow-600/10 border-yellow-400' :
                        event.type === 'meeting' ? 'bg-green-600/10 border-green-400' :
                        'bg-pink-600/10 border-pink-400'
                      }
                    `}
                  >
                    <Star size={16} className={`
                      mt-0.5 flex-shrink-0
                      ${event.type === 'work' ? 'text-yellow-400' :
                        event.type === 'meeting' ? 'text-green-400' :
                        'text-pink-400'
                      }
                    `} />
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">{event.title}</p>
                      <p className="text-zinc-400 text-xs capitalize">{event.type}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="border-t border-zinc-800 p-4">
            <p className="text-xs text-zinc-500 mb-2">Event Types:</p>
            <div className="flex gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                <span className="text-zinc-400">Work</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                <span className="text-zinc-400">Meeting</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-pink-400"></div>
                <span className="text-zinc-400">Personal</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Calendar;
