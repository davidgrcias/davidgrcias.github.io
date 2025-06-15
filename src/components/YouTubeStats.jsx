// src/components/YouTubeStats.jsx
import React, { useState, useEffect } from "react";
import { Youtube, Star, Eye, Heart, Clock, Loader } from "lucide-react";
import userProfile from "../data/userProfile";

const YouTubeStats = () => {
  const fallbackStats = {
    subscribers: "4.7K+",
    views: "876K+",
    likes: "11K+",
    watchHours: "30K+",
  };
  const [stats, setStats] = useState(fallbackStats);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const apiKey = "REMOVED_KEY";
    const channelID = "UCDRagVrqj_v2Wbf_UFfTluw";
    const part = "statistics";
    const url = `https://www.googleapis.com/youtube/v3/channels?part=${part}&id=${channelID}&key=${apiKey}`;
    const fetchStats = async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        const channelStats = data.items[0].statistics;
        setStats({
          subscribers: formatNumber(channelStats.subscriberCount),
          views: formatNumber(channelStats.viewCount),
          likes: "11K+",
          watchHours: "30K+",
        });
      } catch (error) {
        setStats(fallbackStats);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
    // eslint-disable-next-line
  }, []);

  const formatNumber = (num) => new Intl.NumberFormat("en-US").format(num);

  const StatItem = ({ icon, value, label }) => (
    <div className="flex items-center">
      {icon}
      <div>
        <span className="font-bold text-xl text-slate-800 dark:text-white">
          {isLoading ? <Loader size={20} className="animate-spin" /> : value}
        </span>
        <br />
        {label}
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
        <StatItem
          icon={<Star className="text-yellow-400 mr-3" />}
          value={stats.subscribers}
          label="Subscribers"
        />
        <StatItem
          icon={<Eye className="text-blue-400 mr-3" />}
          value={stats.views}
          label="Views"
        />
        <StatItem
          icon={<Heart className="text-pink-400 mr-3" />}
          value={stats.likes}
          label="Likes"
        />
        <StatItem
          icon={<Clock className="text-green-400 mr-3" />}
          value={stats.watchHours}
          label="Watch Hours"
        />
      </div>
    </div>
  );
};

export default YouTubeStats;
