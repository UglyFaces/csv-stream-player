import React, { useState } from 'react';
import { VideoPlayer } from '@/components/VideoPlayer';
import { VideoGrid } from '@/components/VideoGrid';
import { useVideoData } from '@/hooks/useVideoData';
import { Button } from '@/components/ui/button';
import { Play, AlertCircle, RefreshCw, Film } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Video {
  file_id: string;
  video_url: string;
}

const CSV_URL = 'https://raw.githubusercontent.com/UglyFaces/RDP/refs/heads/main/new.csv';

const Index = () => {
  const { videos, isLoading, error } = useVideoData(CSV_URL);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const { toast } = useToast();

  const handleVideoSelect = (video: Video) => {
    setSelectedVideo(video);
    toast({
      title: "Loading video...",
      description: `Playing video ${video.file_id}`,
    });
  };

  const handleVideoError = (errorMessage: string) => {
    toast({
      title: "Video Error",
      description: errorMessage,
      variant: "destructive",
    });
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Error Loading Videos</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={handleRefresh} className="bg-gradient-primary">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-primary rounded-lg">
                <Film className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Video Stream</h1>
                <p className="text-sm text-muted-foreground">
                  {videos.length} videos available
                </p>
              </div>
            </div>
            
            {selectedVideo && (
              <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                <Play className="w-4 h-4" />
                Now playing: Video {selectedVideo.file_id}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Video Player Section */}
        {selectedVideo ? (
          <div className="mb-12">
            <VideoPlayer
              src={selectedVideo.video_url}
              title={`Video ${selectedVideo.file_id}`}
              autoPlay={true}
              onLoadStart={() => setIsVideoLoading(true)}
              onLoadEnd={() => setIsVideoLoading(false)}
              onError={handleVideoError}
            />
            
            <div className="mt-6 text-center">
              <h2 className="text-2xl font-bold mb-2">Video {selectedVideo.file_id}</h2>
              <p className="text-muted-foreground">
                Select another video from the grid below to switch
              </p>
            </div>
          </div>
        ) : (
          <div className="mb-12 text-center">
            <div className="bg-gradient-card rounded-2xl p-12 max-w-2xl mx-auto border border-border/50">
              <div className="p-4 bg-gradient-primary rounded-full w-fit mx-auto mb-6">
                <Play className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Welcome to Video Stream</h2>
              <p className="text-muted-foreground text-lg mb-6">
                Select any video from the collection below to start watching
              </p>
              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Film className="w-4 h-4" />
                  HD Quality
                </span>
                <span>•</span>
                <span>Instant Streaming</span>
                <span>•</span>
                <span>No Downloads Required</span>
              </div>
            </div>
          </div>
        )}

        {/* Video Grid Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">Video Collection</h3>
            {!isLoading && videos.length > 0 && (
              <Button
                variant="outline"
                onClick={handleRefresh}
                className="border-accent/50 hover:bg-accent/10"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            )}
          </div>
          
          <VideoGrid
            videos={videos}
            onVideoSelect={handleVideoSelect}
            selectedVideoId={selectedVideo?.file_id}
            isLoading={isLoading}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>Video streaming powered by HTML5 • Responsive design for all devices</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
