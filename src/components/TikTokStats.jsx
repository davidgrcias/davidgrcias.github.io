import React from "react";
import { Users, Heart } from "lucide-react";
import { iconMap } from "../icons/iconMap";
import userProfile from "../data/userProfile";

// Extend iconMap with newly needed icons
Object.assign(iconMap, {
  Users: Users,
  Heart: Heart,
});

const TikTokStats = () => {
  const stats = {
    followers: "17.2K",
    likes: "70K",
  };

  const statItems = [
    {
      icon: iconMap.Users,
      value: stats.followers,
      label: "Followers",
      color: "text-purple-400",
    },
    {
      icon: iconMap.Heart,
      value: stats.likes,
      label: "Likes",
      color: "text-pink-400",
    },
  ];

  const StatItem = ({ Icon, value, label, color }) => (
    <div className="flex items-center">
      <Icon className={`${color} mr-3`} size={24} />
      <div>
        <span className="font-bold text-xl text-slate-800 dark:text-white">
          {value}
        </span>
        <br />
        <span className="text-slate-600 dark:text-gray-400">{label}</span>
      </div>
    </div>
  );

  return (
    <div className="bg-slate-100 dark:bg-slate-800/50 p-8 rounded-xl border border-slate-200 dark:border-gray-700 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/10">
      <div className="flex items-center mb-6">
        {React.createElement(iconMap.TikTok, {
          className: "text-slate-800 dark:text-white mr-4",
          size: 40,
        })}
        <div>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
            TikTok
          </h3>
          <a
            href={userProfile.socials.tiktok.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-600 dark:text-cyan-400 hover:underline"
          >
            {userProfile.socials.tiktok.handle}
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

export default TikTokStats;
