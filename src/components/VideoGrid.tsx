import React from 'react';
import { Play, Film } from 'lucide-react';

interface Video {
  file_id: string;
  video_url: string;
}

interface VideoGridProps {
  videos: Video[];
  onVideoSelect: (video: Video) => void;
  selectedVideoId?: string;
  isLoading?: boolean;
}

export const VideoGrid: React.FC<VideoGridProps> = ({ 
  videos, 
  onVideoSelect, 
  selectedVideoId,
  isLoading 
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="video-grid-item animate-pulse">
            <div className="video-thumbnail bg-muted">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="loading-spinner w-8 h-8 border-2 border-accent border-t-transparent rounded-full"></div>
              </div>
            </div>
            <div className="p-4">
              <div className="h-4 bg-muted rounded mb-2"></div>
              <div className="h-3 bg-muted/60 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="text-center py-12">
        <Film className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">No videos found</h3>
        <p className="text-muted-foreground">
          Check your CSV file or try refreshing the page.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {videos.map((video) => (
        <div
          key={video.file_id}
          className={`video-grid-item cursor-pointer group ${
            selectedVideoId === video.file_id ? 'ring-2 ring-accent shadow-glow' : ''
          }`}
          onClick={() => onVideoSelect(video)}
        >
          <div className="video-thumbnail relative">
            {/* Placeholder thumbnail with gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-primary/20">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black/40 rounded-full p-4 group-hover:bg-accent/80 transition-colors">
                  <Play className="w-8 h-8 text-white fill-current" />
                </div>
              </div>
            </div>
            
            {/* Video ID badge */}
            <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-xs text-white font-medium">
              #{video.file_id}
            </div>
          </div>
          
          <div className="p-4">
            <h3 className="font-semibold text-sm mb-1 line-clamp-2">
              Video {video.file_id}
            </h3>
            <p className="text-xs text-muted-foreground">
              Click to play
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};