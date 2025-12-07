import { useState } from "react";
import { usePlaylistStore } from "../stores/usePlaylistStore";
import { Loader, Sparkles } from "lucide-react";

const MoodInput = () => {
  const [mood, setMood] = useState("");

  const { generatePlaylist, loading } = usePlaylistStore();

  const handleSubmit = async () => {
    if (!mood.trim()) return;
    await generatePlaylist(mood);
    setMood("");
  };

  return (
    <div className="relative bg-gradient-to-br from-base-200 to-base-300 p-2.5 sm:p-5 rounded-xl sm:rounded-2xl mb-3 sm:mb-5 shadow-xl border border-base-300 overflow-hidden">
      
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 pointer-events-none"></div>
      
      <div className="relative flex flex-row gap-2 sm:gap-3">
        
        {/* Input Field */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Describe your mood..."
            className="input input-sm sm:input-md input-bordered w-full focus:input-primary transition-all duration-300 shadow-sm hover:shadow-md bg-base-100 h-9 sm:h-12"
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSubmit();
              }
            }}
            disabled={loading}
          />
        </div>

        {/* Generate Button */}
        <button 
          className="btn btn-sm sm:btn-md bg-gradient-to-r from-primary to-secondary border-none font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 px-3 sm:px-6 text-white h-9 sm:h-12 min-h-0 sm:min-h-[3rem]"
          onClick={handleSubmit}
          disabled={loading || !mood.trim()}
        >
          {loading ? (
            <span className="loading loading-spinner loading-xs sm:loading-sm"></span>
          ) : (
            <>
              <Sparkles size={14} className="hidden sm:inline text-white sm:w-4 sm:h-4" />
              <span className="text-white text-xs sm:text-sm">Generate</span>
            </>
          )}
        </button>
      </div>

      {/* Helper text */}
      <p className="text-[10px] sm:text-xs text-base-content/60 mt-1.5 sm:mt-2 ml-0.5 hidden sm:block">
        💡 Try: "relaxing acoustic", "upbeat workout", "romantic evening"
      </p>
    </div>
  );
};

export default MoodInput;
