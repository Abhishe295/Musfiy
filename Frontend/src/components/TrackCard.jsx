import { useState } from "react";
import { Play, Pause, Music, Sparkles, Loader2, ListPlus } from "lucide-react";
import { usePlayerStore } from "../stores/usePlayerStore";
import { useTrackStore } from "../stores/useTrackStore";

const TrackCard = ({ track }) => {
  const playTrack = usePlayerStore((s) => s.playTrack);
  const setQueue = usePlayerStore((s) => s.setQueue);
  const queueTracks = usePlayerStore((s) => s.queueTracks);
  const allTracks = useTrackStore((s) => s.allTracks);
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);

  const fetchSimilarTracks = useTrackStore((s) => s.fetchSimilarTracks);
  const similarTracks = useTrackStore((s) => s.similarCache[track._id]);
  const similarLoading = useTrackStore((s) => s.similarLoading[track._id]);
  const [showSimilar, setShowSimilar] = useState(false);

  const isCurrent = currentTrack?._id === track._id;
  const isTrackPlaying = isCurrent && isPlaying;

  const handlePlay = () => {
    if (isCurrent) {
      usePlayerStore.setState((s) => ({ isPlaying: !s.isPlaying }));
    } else {
      setQueue(allTracks, "library");
      playTrack(track);
    }
  };

  const toggleSimilar = (e) => {
    e.stopPropagation();
    const next = !showSimilar;
    setShowSimilar(next);
    if (next && !similarTracks) {
      fetchSimilarTracks(track._id);
    }
  };

  const playSimilar = (similarTrack, e) => {
    e.stopPropagation();
    // A "more like this" list is its own short-lived queue — it shouldn't
    // get silently extended by background library pagination the way the
    // main library queue does.
    setQueue([track, ...similarTracks], "similar");
    playTrack(similarTrack);
  };

  const queueAllMatches = (e) => {
    e.stopPropagation();
    queueTracks(similarTracks);
  };

  return (
    <div>
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

        {/* "More like this" toggle — only worth showing once this track has
            acoustic features to compare against (uploaded post-feature, or
            backfilled). Older tracks just don't show the button. */}
        {track.audioFeatures?.energy != null && (
          <button
            title="More like this"
            className={`flex-shrink-0 btn btn-sm btn-circle transition-all duration-300 ${
              showSimilar
                ? 'bg-primary/20 text-primary'
                : 'btn-ghost hover:bg-primary/10 hover:text-primary opacity-0 group-hover:opacity-100 sm:opacity-100'
            }`}
            onClick={toggleSimilar}
          >
            <Sparkles size={15} />
          </button>
        )}

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

      {/* "More like this" panel — acoustic-similarity results (real DSP
          feature vectors + cosine similarity, computed server-side) */}
      {showSimilar && (
        <div className="ml-4 sm:ml-8 mb-3 pl-3 sm:pl-4 border-l-2 border-primary/20 space-y-1">
          {similarLoading ? (
            <div className="flex items-center gap-2 text-xs text-base-content/50 py-2">
              <Loader2 size={13} className="animate-spin" />
              Analyzing sound...
            </div>
          ) : !similarTracks || similarTracks.length === 0 ? (
            <p className="text-xs text-base-content/50 py-2">No similar tracks found yet.</p>
          ) : (
            <>
              <button
                onClick={queueAllMatches}
                className="flex items-center gap-1.5 text-[11px] text-primary/80 hover:text-primary px-2 py-1 -mt-1 mb-1"
              >
                <ListPlus size={12} />
                Queue all {similarTracks.length} matches
              </button>
              {similarTracks.map((s) => (
                <div
                  key={s._id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-base-200 cursor-pointer"
                  onClick={(e) => playSimilar(s, e)}
                >
                  <Play size={12} className="text-base-content/40 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm truncate">{s.title}</p>
                    <p className="text-[11px] text-base-content/50 truncate">{s.artist}</p>
                  </div>
                  <span className="text-[10px] text-primary/70 flex-shrink-0">
                    {Math.round(s.similarity * 100)}% match
                  </span>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default TrackCard;
