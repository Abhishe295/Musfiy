import UploadTrackModal from "../components/UploadTrackModal";
import { Upload, Sparkles } from "lucide-react";

const UploadPage = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] p-3 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4 mb-2">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
              <Upload size={24} className="sm:w-7 sm:h-7 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Upload a New Track
              </h2>
              <p className="text-xs sm:text-sm text-base-content/60 mt-1 flex items-center gap-1.5">
                <Sparkles size={14} className="text-secondary" />
                Share your music with the world
              </p>
            </div>
          </div>
        </div>

        {/* Upload Modal Component */}
        <div className="bg-gradient-to-br from-base-200 to-base-300 rounded-2xl sm:rounded-3xl shadow-2xl border border-base-300 p-4 sm:p-6 lg:p-8">
          <UploadTrackModal />
        </div>
      </div>
    </div>
  );
};

export default UploadPage;