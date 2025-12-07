import { useEffect } from "react";
import { useStatsStore } from "../stores/useStatsStore";
import { TrendingUp, Music, PlayCircle, Sparkles, Loader2 } from "lucide-react";

const Stats = () => {
  const { topTracks, fetchTopTracks, loading, cached } = useStatsStore();

  useEffect(() => {
    fetchTopTracks();
  }, []);

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-base-200 to-base-300 sm:rounded-2xl sm:shadow-2xl sm:border sm:border-base-300 overflow-hidden">
      
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-primary/10 to-secondary/10 backdrop-blur-md border-b border-base-300 p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
            <TrendingUp size={20} className="sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Top Tracks
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              {cached ? (
                <span className="text-xs sm:text-sm text-base-content/60 flex items-center gap-1">
                  <Sparkles size={12} className="text-secondary" />
                  Cached Result
                </span>
              ) : (
                <span className="text-xs sm:text-sm text-base-content/60 flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
                  Live Data
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 custom-scrollbar">
        {loading ? (
          // Loading State
          <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-4">
            <div className="relative">
              <Loader2 size={48} className="text-primary animate-spin" />
              <div className="absolute inset-0 blur-xl bg-primary/20 animate-pulse"></div>
            </div>
            <p className="text-sm text-base-content/60 animate-pulse">Loading top tracks...</p>
          </div>
        ) : topTracks.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-3 text-center px-4">
            <div className="w-16 h-16 rounded-2xl bg-base-300 flex items-center justify-center">
              <Music size={32} className="text-base-content/40" />
            </div>
            <p className="text-sm text-base-content/60">No tracks data available</p>
          </div>
        ) : (
          // Track List
          <div className="space-y-2">
            {topTracks.map((track, index) => (
              <div
                key={track._id}
                className="group relative p-3 sm:p-4 bg-base-100 hover:bg-base-200 rounded-xl transition-all duration-300 hover:shadow-md"
              >
                {/* Rank Badge */}
                <div className={`absolute -left-1 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-r-xl flex items-center justify-center font-bold text-sm sm:text-base shadow-lg ${
                  index === 0 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white' :
                  index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-white' :
                  index === 2 ? 'bg-gradient-to-r from-orange-600 to-orange-700 text-white' :
                  'bg-gradient-to-r from-primary to-secondary text-white'
                }`}>
                  {track.rank}
                </div>

                <div className="flex items-start gap-3 ml-8 sm:ml-10">
                  {/* Track Icon */}
                  <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Music size={18} className="sm:w-5 sm:h-5 text-primary" />
                  </div>

                  {/* Track Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base truncate text-base-content">
                      {track.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-base-content/60 truncate">
                      {track.artist}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="flex-shrink-0 text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <span className="font-bold text-sm sm:text-base text-primary">
                        {track.usagePercent}%
                      </span>
                    </div>
                    <div className="flex items-center gap-1 justify-end mt-0.5">
                      <PlayCircle size={12} className="text-base-content/40" />
                      <span className="text-xs text-base-content/60">
                        {track.timesUsed}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Custom Scrollbar */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 0px;
          display: none;
        }
        .custom-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default Stats;