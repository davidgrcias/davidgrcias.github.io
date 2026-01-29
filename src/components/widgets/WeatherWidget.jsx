import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cloud, Sun, CloudRain, CloudSnow, CloudLightning, Wind, Droplets, Thermometer, MapPin, RefreshCw } from 'lucide-react';

/**
 * Weather Widget Component
 * Displays weather information with beautiful UI
 * Uses simulated weather data for demo purposes
 */
const WeatherWidget = ({ className = '' }) => {
  const [weather, setWeather] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Simulated weather conditions
  const weatherConditions = [
    { condition: 'Sunny', icon: Sun, temp: 32, feels: 34, humidity: 65, wind: 12, color: 'from-yellow-400 to-orange-500' },
    { condition: 'Partly Cloudy', icon: Cloud, temp: 28, feels: 29, humidity: 70, wind: 15, color: 'from-blue-400 to-cyan-500' },
    { condition: 'Rainy', icon: CloudRain, temp: 24, feels: 23, humidity: 85, wind: 20, color: 'from-slate-500 to-blue-600' },
    { condition: 'Thunderstorm', icon: CloudLightning, temp: 22, feels: 20, humidity: 90, wind: 25, color: 'from-purple-600 to-slate-700' },
    { condition: 'Cloudy', icon: Cloud, temp: 26, feels: 26, humidity: 75, wind: 10, color: 'from-gray-400 to-slate-500' },
  ];

  const fetchWeather = () => {
    setIsRefreshing(true);
    // Simulate API call delay
    setTimeout(() => {
      const randomWeather = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
      const hour = new Date().getHours();
      // Adjust temperature based on time of day
      const tempAdjust = hour >= 6 && hour <= 18 ? 0 : -4;
      setWeather({
        ...randomWeather,
        temp: randomWeather.temp + tempAdjust + Math.floor(Math.random() * 3 - 1),
        feels: randomWeather.feels + tempAdjust + Math.floor(Math.random() * 3 - 1),
        location: 'Jakarta, ID',
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      });
      setIsLoading(false);
      setIsRefreshing(false);
    }, 1000);
  };

  useEffect(() => {
    fetchWeather();
    // Refresh weather every 5 minutes
    const interval = setInterval(fetchWeather, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`bg-white/10 backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-white/10 ${className}`}
      >
        <div className="flex items-center justify-center h-32">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        </div>
      </motion.div>
    );
  }

  const WeatherIcon = weather?.icon || Sun;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative overflow-hidden rounded-2xl border border-white/10 ${className}`}
    >
      {/* Gradient Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${weather?.color || 'from-cyan-500 to-blue-600'} opacity-80`} />
      <div className="absolute inset-0 bg-black/20" />

      {/* Content */}
      <div className="relative p-4 sm:p-5 text-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 text-white/80 text-xs sm:text-sm">
            <MapPin size={14} />
            <span>{weather?.location}</span>
          </div>
          <button
            onClick={fetchWeather}
            disabled={isRefreshing}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Main Weather Display */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-start gap-1">
              <span className="text-4xl sm:text-5xl md:text-6xl font-light">{weather?.temp}</span>
              <span className="text-lg sm:text-xl mt-1">°C</span>
            </div>
            <p className="text-white/80 text-sm sm:text-base mt-1">{weather?.condition}</p>
          </div>
          <motion.div
            animate={{ 
              y: [0, -5, 0],
              rotate: weather?.condition === 'Sunny' ? [0, 5, -5, 0] : 0
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <WeatherIcon size={56} className="sm:w-16 sm:h-16 md:w-20 md:h-20 text-white/90" />
          </motion.div>
        </div>

        {/* Weather Details */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-4 pt-3 border-t border-white/20">
          <div className="flex items-center gap-1.5">
            <Thermometer size={14} className="text-white/60" />
            <div>
              <p className="text-[10px] sm:text-xs text-white/60">Feels</p>
              <p className="text-xs sm:text-sm font-medium">{weather?.feels}°C</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Droplets size={14} className="text-white/60" />
            <div>
              <p className="text-[10px] sm:text-xs text-white/60">Humidity</p>
              <p className="text-xs sm:text-sm font-medium">{weather?.humidity}%</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Wind size={14} className="text-white/60" />
            <div>
              <p className="text-[10px] sm:text-xs text-white/60">Wind</p>
              <p className="text-xs sm:text-sm font-medium">{weather?.wind} km/h</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default WeatherWidget;
