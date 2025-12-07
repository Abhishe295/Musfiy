import { useState } from "react";
import { useTrackStore } from "../stores/useTrackStore";
import { Upload, Music, User, File, X, Loader2, CheckCircle } from "lucide-react";

const UploadTrackModal = () => {
  const { uploadTrack, loading } = useTrackStore();

  const [open, setOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const handleUpload = async () => {
    if (!file || !title.trim()) return;

    const formData = new FormData();
    formData.append("track", file);
    formData.append("title", title);
    formData.append("artist", artist);

    await uploadTrack(formData);
    
    // Reset form
    setFile(null);
    setTitle("");
    setArtist("");
    setOpen(false);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type.startsWith("audio/")) {
        setFile(droppedFile);
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  return (
    <>
      <button 
        className="btn bg-gradient-to-r from-primary to-secondary border-none text-white font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 w-full"
        onClick={() => setOpen(true)}
      >
        <Upload size={20} />
        Upload New Track
      </button>

      {open && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-2xl bg-gradient-to-br from-base-200 to-base-300 border border-base-300 shadow-2xl p-0 overflow-hidden max-h-[90vh] flex flex-col">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 backdrop-blur-md border-b border-base-300 p-4 sm:p-5 lg:p-6 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                  <Upload size={20} className="sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Upload Track
                  </h3>
                  <p className="text-xs sm:text-sm text-base-content/60 mt-0.5">
                    Share your music with the world
                  </p>
                </div>
              </div>
              <button 
                className="btn btn-sm btn-circle btn-ghost hover:bg-error/10 hover:text-error transition-colors"
                onClick={() => setOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            {/* Body - Scrollable */}
            <div className="p-4 sm:p-5 lg:p-6 space-y-4 overflow-y-auto flex-1">
              
              {/* Title Input */}
              <div>
                <label className="label">
                  <span className="label-text font-semibold flex items-center gap-2">
                    <Music size={16} className="text-primary" />
                    Track Title *
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="Enter track title"
                  className="input input-bordered w-full focus:input-primary transition-all"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              {/* Artist Input */}
              <div>
                <label className="label">
                  <span className="label-text font-semibold flex items-center gap-2">
                    <User size={16} className="text-primary" />
                    Artist Name
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="Enter artist name"
                  className="input input-bordered w-full focus:input-primary transition-all"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                />
              </div>

              {/* File Upload - Drag & Drop */}
              <div>
                <label className="label">
                  <span className="label-text font-semibold flex items-center gap-2">
                    <File size={16} className="text-primary" />
                    Audio File *
                  </span>
                </label>
                
                <div
                  className={`relative border-2 border-dashed rounded-xl p-6 sm:p-8 text-center transition-all duration-300 ${
                    dragActive
                      ? "border-primary bg-primary/10 scale-105"
                      : file
                      ? "border-success bg-success/10"
                      : "border-base-300 bg-base-100 hover:border-primary hover:bg-primary/5"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    accept="audio/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileChange}
                  />
                  
                  {file ? (
                    <div className="space-y-2 sm:space-y-3">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-full bg-gradient-to-br from-success to-success/70 flex items-center justify-center">
                        <CheckCircle size={24} className="sm:w-8 sm:h-8 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-success text-sm sm:text-base truncate px-2">{file.name}</p>
                        <p className="text-xs text-base-content/60 mt-1">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                      <button
                        className="btn btn-xs sm:btn-sm btn-ghost hover:btn-error"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2 sm:space-y-3">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-full bg-base-300 flex items-center justify-center">
                        <Upload size={24} className="sm:w-8 sm:h-8 text-base-content/40" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm sm:text-base">Drop your audio file here</p>
                        <p className="text-xs sm:text-sm text-base-content/60 mt-1">
                          or click to browse
                        </p>
                        <p className="text-xs text-base-content/40 mt-2">
                          Supports: MP3, WAV, OGG, M4A
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer - Fixed at bottom */}
            <div className="bg-base-200/50 border-t border-base-300 p-4 sm:p-5 lg:p-6 flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 justify-end flex-shrink-0">
              <button 
                className="btn btn-ghost hover:bg-base-300"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </button>

              <button 
                className={`btn bg-gradient-to-r from-primary to-secondary border-none text-white font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all ${
                  loading ? "loading" : ""
                }`}
                onClick={handleUpload}
                disabled={!file || !title.trim() || loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    <span className="hidden sm:inline">Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload size={18} />
                    <span className="hidden sm:inline">Upload Track</span>
                    <span className="sm:hidden">Upload</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </dialog>
      )}
    </>
  );
};

export default UploadTrackModal;