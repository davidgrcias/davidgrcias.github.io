import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Image, Clock, Check } from 'lucide-react';

const wallpapers = [
  { 
    id: 'nature-1', 
    url: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=2070&auto=format&fit=crop', 
    thumbnail: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=400&auto=format&fit=crop',
    name: 'Mountain Sunset' 
  },
  { 
    id: 'nature-2', 
    url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2071&auto=format&fit=crop', 
    thumbnail: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=400&auto=format&fit=crop',
    name: 'Deep Forest' 
  },
  { 
    id: 'cyberpunk-1', 
    url: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?q=80&w=2070&auto=format&fit=crop', 
    thumbnail: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?q=80&w=400&auto=format&fit=crop',
    name: 'Neon City' 
  },
  { 
    id: 'cyberpunk-2', 
    url: 'https://images.unsplash.com/photo-1515630278258-407f66498911?q=80&w=1974&auto=format&fit=crop', 
    thumbnail: 'https://images.unsplash.com/photo-1515630278258-407f66498911?q=80&w=400&auto=format&fit=crop',
    name: 'Cyber Grid' 
  },
  { 
    id: 'abstract-1', 
    url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=2070&auto=format&fit=crop', 
    thumbnail: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=400&auto=format&fit=crop',
    name: 'Abstract Paint' 
  },
  { 
    id: 'abstract-2', 
    url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop', 
    thumbnail: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=400&auto=format&fit=crop',
    name: 'Liquid Blue' 
  },
  { 
    id: 'minimal-1', 
    url: 'https://images.unsplash.com/photo-1487147264018-f937fba0c817?q=80&w=2000&auto=format&fit=crop', 
    thumbnail: 'https://images.unsplash.com/photo-1487147264018-f937fba0c817?q=80&w=400&auto=format&fit=crop',
    name: 'Dark Minimal' 
  },
  { 
    id: 'space-1', 
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop', 
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=400&auto=format&fit=crop',
    name: 'Deep Space' 
  }
];

const WallpaperPicker = () => {
  const { wallpaperMode, setWallpaperMode, wallpaperImage, setWallpaperImage } = useTheme();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
        <h3 className="text-white font-medium mb-3 flex items-center gap-2">
          <Clock size={16} /> Mode
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setWallpaperMode('dynamic')}
            className={`flex-1 py-3 px-4 rounded-lg border transition-all flex items-center justify-center gap-2 ${
              wallpaperMode === 'dynamic'
                ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                : 'bg-zinc-800/50 border-white/5 text-zinc-400 hover:bg-zinc-800'
            }`}
          >
            <Clock size={18} />
            <div className="text-left">
              <div className="text-sm font-medium">Dynamic</div>
              <div className="text-xs opacity-60">Changes with time</div>
            </div>
          </button>
          
          <button
            onClick={() => setWallpaperMode('image')}
            className={`flex-1 py-3 px-4 rounded-lg border transition-all flex items-center justify-center gap-2 ${
              wallpaperMode === 'image'
                ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                : 'bg-zinc-800/50 border-white/5 text-zinc-400 hover:bg-zinc-800'
            }`}
          >
            <Image size={18} />
            <div className="text-left">
              <div className="text-sm font-medium">Custom</div>
              <div className="text-xs opacity-60">Static Image</div>
            </div>
          </button>
        </div>
      </div>

      {/* Gallery Section - Only show when mode is 'image' */}
      {wallpaperMode === 'image' && (
        <div className="animate-slide-up">
           <h3 className="text-white font-medium mb-4 flex items-center gap-2">
            <Image size={16} /> Gallery
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {wallpapers.map((wp) => (
              <button
                key={wp.id}
                onClick={() => setWallpaperImage(wp.url)}
                className={`relative group rounded-lg overflow-hidden aspect-video border-2 transition-all ${
                  wallpaperImage === wp.url 
                    ? 'border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.3)]' 
                    : 'border-transparent hover:border-white/30'
                }`}
              >
                <img 
                  src={wp.thumbnail} 
                  alt={wp.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* Overlay Name */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                  <span className="text-xs text-white font-medium">{wp.name}</span>
                </div>

                {/* Selected Check */}
                {wallpaperImage === wp.url && (
                  <div className="absolute top-2 right-2 bg-cyan-500 rounded-full p-1 shadow-lg">
                    <Check size={12} className="text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Dynamic Info - Only show when mode is 'dynamic' */}
      {wallpaperMode === 'dynamic' && (
        <div className="text-center py-8 text-zinc-500 animate-slide-up bg-white/5 rounded-xl border border-white/5">
          <Clock size={48} className="mx-auto mb-3 opacity-50" />
          <p className="text-sm">Wallpaper changes automatically based on time of day.</p>
          <div className="flex justify-center gap-4 mt-4 text-xs opacity-70">
            <span>🌅 Morning</span>
            <span>☀️ Day</span>
            <span>🌇 Evening</span>
            <span>🌙 Night</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default WallpaperPicker;
