import { Play, Pause, Music } from "lucide-react";
import { usePlayerStore } from "../stores/usePlayerStore";
import { useTrackStore } from "../stores/useTrackStore";

const TrackCard = ({ track }) => {
  const playTrack = usePlayerStore((s) => s.playTrack);
  const setQueue = usePlayerStore((s) => s.setQueue);
  const allTracks = useTrackStore((s) => s.allTracks);
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);

  const isCurrent = currentTrack?._id === track._id;
  const isTrackPlaying = isCurrent && isPlaying;

  const handlePlay = () => {
    // If clicking the currently playing track, toggle play/pause
    if (isCurrent) {
      usePlayerStore.setState((s) => ({ isPlaying: !s.isPlaying }));
    } else {
      // Otherwise, set full queue and play selected track
      setQueue(allTracks);
      playTrack(track);
    }
  };

  return (
    <div
      className={`group relative p-3 sm:p-4 rounded-xl sm:rounded-2xl flex items-center gap-3 sm:gap-4 transition-all duration-300 mb-2 cursor-pointer ${
        isCurrent
          ? 'bg-gradient-to-r from-primary/20 to-secondary/20 shadow-lg ring-1 ring-primary/30'
          : 'bg-base-200 hover:bg-base-300 hover:shadow-md'
      }`}
      onClick={handlePlay}
    >
      {/* Album Art / Icon */}
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

      {/* Track Info */}
      <div className="flex-1 min-w-0">
        <h3 className={`font-semibold text-sm sm:text-base truncate transition-colors ${isCurrent ? 'text-primary' : 'text-base-content'}`}>
          {track.title}
        </h3>
        <p className="text-xs sm:text-sm text-base-content/60 truncate">
          {track.artist}
        </p>
      </div>

      {/* Play/Pause Button */}
      <button
        className={`flex-shrink-0 btn btn-sm btn-circle transition-all duration-300 ${
          isCurrent
            ? 'bg-gradient-to-br from-primary to-secondary border-none text-white shadow-lg hover:shadow-xl hover:scale-110'
            : 'btn-ghost hover:bg-primary/10 hover:text-primary opacity-0 group-hover:opacity-100 sm:opacity-100'
        }`}
        onClick={(e) => {
          e.stopPropagation();
          handlePlay();
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
};

export default TrackCard;