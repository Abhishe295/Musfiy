import { Play, Pause, Music, Music2, Clock } from "lucide-react";
import { usePlayerStore } from "../stores/usePlayerStore";

const PlaylistCard = ({ playlist }) => {
  const setQueue = usePlayerStore((s) => s.setQueue);
  const playTrack = usePlayerStore((s) => s.playTrack);
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);

  const handlePlay = (track) => {
    // If clicking the currently playing track, toggle play/pause
    if (currentTrack?._id === track._id) {
      usePlayerStore.setState((s) => ({ isPlaying: !s.isPlaying }));
    } else {
      // Otherwise, set queue and play new track
      setQueue(playlist);
      playTrack(track);
    }
  };

  const isCurrentTrack = (track) => currentTrack?._id === track._id;

  return (
    <div className="bg-gradient-to-br from-base-200 to-base-300 p-4 sm:p-6 rounded-2xl shadow-2xl border border-base-300 mb-4 sm:mb-6">
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-base-300">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
          <Music2 size={20} className="sm:w-6 sm:h-6 text-white" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Generated Playlist
          </h2>
          <p className="text-xs sm:text-sm text-base-content/60 flex items-center gap-1.5 mt-0.5">
            <Clock size={12} className="sm:w-3.5 sm:h-3.5" />
            {playlist.length} {playlist.length === 1 ? 'track' : 'tracks'}
          </p>
        </div>
      </div>

      {/* Playlist Items - Same UI as TrackCard */}
      <div className="space-y-2 max-h-[calc(100vh-20rem)] sm:max-h-[500px] overflow-y-auto custom-scrollbar">
        {playlist.map((track) => {
          const isCurrent = isCurrentTrack(track);
          const isTrackPlaying = isCurrent && isPlaying;

          return (
            <div
              key={track._id}
              className={`group relative p-3 sm:p-4 rounded-xl sm:rounded-2xl flex items-center gap-3 sm:gap-4 transition-all duration-300 cursor-pointer ${
                isCurrent
                  ? 'bg-gradient-to-r from-primary/20 to-secondary/20 shadow-lg ring-1 ring-primary/30'
                  : 'bg-base-200 hover:bg-base-300 hover:shadow-md'
              }`}
              onClick={() => handlePlay(track)}
            >
              {/* Album Art / Icon - Same as TrackCard */}
              <div
                className={`flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-300 shadow-md ${
                  isCurrent
                    ? 'bg-gradient-to-br from-primary to-secondary'
                    : 'bg-base-300 group-hover:bg-primary/20'
                }`}
              >
                {isTrackPlaying ? (
                  <div className="flex gap-1 items-end h-5">
                    <span className="w-1 bg-white animate-pulse" style={{ height: '40%', animationDelay: '0ms' }}></span>
                    <span className="w-1 bg-white animate-pulse" style={{ height: '100%', animationDelay: '150ms' }}></span>
                    <span className="w-1 bg-white animate-pulse" style={{ height: '60%', animationDelay: '300ms' }}></span>
                  </div>
                ) : (
                  <Music size={20} className={`sm:w-6 sm:h-6 ${isCurrent ? 'text-white' : 'text-base-content/60 group-hover:text-primary'}`} />
                )}
              </div>

              {/* Track Info - Same as TrackCard */}
              <div className="flex-1 min-w-0">
                <h3 className={`font-semibold text-sm sm:text-base truncate transition-colors ${isCurrent ? 'text-primary' : 'text-base-content'}`}>
                  {track.title}
                </h3>
                <p className="text-xs sm:text-sm text-base-content/60 truncate">
                  {track.artist}
                </p>
              </div>

              {/* Play/Pause Button - Same as TrackCard */}
              <button
                className={`flex-shrink-0 btn btn-sm btn-circle transition-all duration-300 ${
                  isCurrent
                    ? 'bg-gradient-to-br from-primary to-secondary border-none text-white shadow-lg hover:shadow-xl hover:scale-110'
                    : 'btn-ghost hover:bg-primary/10 hover:text-primary opacity-0 group-hover:opacity-100 sm:opacity-100'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  handlePlay(track);
                }}
              >
                {isTrackPlaying ? (
                  <Pause size={16} className="sm:w-[18px] sm:h-[18px]" fill="currentColor" />
                ) : (
                  <Play size={16} className="sm:w-[18px] sm:h-[18px]" fill="currentColor" />
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Custom Scrollbar Styles - Invisible */}
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

export default PlaylistCard;