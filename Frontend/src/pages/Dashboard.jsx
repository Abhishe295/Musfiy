import { useEffect, useState } from "react";
import MoodInput from "../components/MoodInput";
import PlaylistCard from "../components/PlaylistCard";
import TrackCard from "../components/TrackCard";
import UploadTrackModal from "../components/UploadTrackModal";
import AudioPlayer from "../components/AudioPlayer";


import { useTrackStore } from "../stores/useTrackStore";
import { useStatsStore } from "../stores/useStatsStore";
import { usePlaylistStore } from "../stores/usePlaylistStore";
import { Menu, X } from "lucide-react";
import Stats from "./Stats";

const Dashboard = () => {
  const { playlist } = usePlaylistStore();
  const { allTracks, fetchAllTracks } = useTrackStore();
  const { fetchTopTracks } = useStatsStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchAllTracks();
    fetchTopTracks();
  }, []);

  return (
    <div className="relative min-h-[calc(100vh-64px)]">
      
      {/* Mobile Sidebar Toggle Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-20 right-2 z-50 btn btn-circle bg-gradient-to-br from-primary to-secondary border-none text-white shadow-lg"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      <div className="max-w-[1600px] mx-auto flex gap-4 lg:gap-6 p-3 sm:p-4 lg:p-6">
        
        {/* LEFT SIDEBAR - Stats */}
        <aside
          className={`
            fixed lg:sticky top-16 lg:top-6 left-0 h-[calc(100vh-4rem)] lg:h-[calc(100vh-6rem)]
            w-[280px] sm:w-[320px] lg:w-[340px] xl:w-[380px]
            transition-transform duration-300 ease-in-out z-40
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          <div className="h-full lg:sticky lg:top-6">
            <Stats />
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 min-w-0 pb-32 lg:pb-36">
          
          {/* Mood Input */}
          <div className="mb-4 lg:mb-6">
            <MoodInput />
          </div>

          {/* Generated Playlist */}
          {playlist.length > 0 && (
            <div className="mb-4 lg:mb-6">
              <PlaylistCard playlist={playlist} />
            </div>
          )}

          {/* All Tracks Section */}
          <div className="bg-gradient-to-br from-base-200 to-base-300 rounded-2xl shadow-xl border border-base-300 p-4 sm:p-5 lg:p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                <span className="text-xl sm:text-2xl">🎵</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                All Tracks
              </h2>
            </div>

            <div className="space-y-2">
              {allTracks.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-base-content/60">No tracks available</p>
                </div>
              ) : (
                allTracks.map((track) => (
                  <TrackCard key={track._id} track={track} />
                ))
              )}
            </div>
          </div>

          {/* Upload Section */}
          <div className="bg-gradient-to-br from-base-200 to-base-300 rounded-2xl shadow-xl border border-base-300 p-4 sm:p-5 lg:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                <span className="text-xl sm:text-2xl">⬆️</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Upload Track
              </h2>
            </div>
            <UploadTrackModal />
          </div>
        </main>
      </div>

      {/* GLOBAL AUDIO PLAYER */}
      <AudioPlayer />
    </div>
  );
};

export default Dashboard;