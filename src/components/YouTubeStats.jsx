// src/components/YouTubeStats.jsx
import React, { useState, useEffect } from "react";
import { Clock, Eye, Heart, Loader, Users, Youtube } from "lucide-react";
import { iconMap } from "../icons/iconMap";
import { getUserProfile } from "../data/userProfile";
import { useTranslation } from "../contexts/TranslationContext";

// Extend iconMap with newly needed icons
Object.assign(iconMap, {
  Clock: Clock,
  Eye: Eye,
  Heart: Heart,
  Loader: Loader,
  Users: Users,
  Youtube: Youtube,
});

const YouTubeStats = () => {
  const { currentLanguage } = useTranslation();
  const userProfile = getUserProfile(currentLanguage);
  const fallbackStats = {
    subscribers: "4.7K+",
    views: "876K+",
    likes: "11K+",
    watchHours: "50K+",
  };
  const [stats, setStats] = useState(fallbackStats);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const channelID = "UCDRagVrqj_v2Wbf_UFfTluw";
    
    // Use Vercel serverless function to securely fetch YouTube stats
    const getYouTubeApiUrl = () => {
      // In production, call Vercel API
      if (import.meta.env.PROD) {
        return `https://davidgrcias-github-io-davidgrcias-projects-cc8794a2.vercel.app/api/youtube?channelId=${channelID}`;
      }
      // In development, also use Vercel (no local YouTube key needed)
      return `https://davidgrcias-github-io-davidgrcias-projects-cc8794a2.vercel.app/api/youtube?channelId=${channelID}`;
    };

    const fetchStats = async () => {
      try {
        const response = await fetch(getYouTubeApiUrl());
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        setStats({
          subscribers: formatNumber(data.subscriberCount),
          views: formatNumber(data.viewCount),
          likes: "15K+",
          watchHours: "50K+",
        });
      } catch (error) {
        console.error("YouTube stats fetch failed:", error);
        setStats(fallbackStats);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
    // eslint-disable-next-line
  }, []);

  const formatNumber = (num) => new Intl.NumberFormat("en-US").format(num);

  const statItems = [
    {
      icon: iconMap.Users,
      value: stats.subscribers,
      label: "Subscribers",
      color: "text-purple-400",
    },
    {
      icon: iconMap.Eye,
      value: stats.views,
      label: "Views",
      color: "text-blue-400",
    },
    {
      icon: iconMap.Heart,
      value: stats.likes,
      label: "Likes",
      color: "text-pink-400",
    },
    {
      icon: iconMap.Clock,
      value: stats.watchHours,
      label: "Watch Hours",
      color: "text-green-400",
    },
  ];

  const StatItem = ({ Icon, value, label, color }) => (
    <div className="flex items-center">
      <Icon className={`${color} mr-3`} size={24} />
      <div>
        <span className="font-bold text-xl text-slate-800 dark:text-white">
          {isLoading
            ? React.createElement(iconMap.Loader, {
                size: 20,
                className: "animate-spin",
              })
            : value}
        </span>
        <br />
        <span className="text-slate-600 dark:text-gray-400">{label}</span>
      </div>
    </div>
  );

  return (
    <div className="bg-slate-100 dark:bg-slate-800/50 p-8 rounded-xl border border-slate-200 dark:border-gray-700 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/10">
      <div className="flex items-center mb-6">
        <Youtube className="text-red-500 mr-4" size={40} />
        <div>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
            YouTube
          </h3>
          <a
            href={userProfile.socials.youtube.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-600 dark:text-cyan-400 hover:underline"
          >
            {userProfile.socials.youtube.handle}
          </a>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-6">
        {statItems.map((item, index) => (
          <StatItem
            key={index}
            Icon={item.icon}
            value={item.value}
            label={item.label}
            color={item.color}
          />
        ))}
      </div>
    </div>
  );
};

export default YouTubeStats;
