import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface VideoPlayerProps {
  src: string;
  title: string;
  autoPlay?: boolean;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
  onError?: (error: string) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  src, 
  title, 
  autoPlay = false,
  onLoadStart, 
  onLoadEnd, 
  onError 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isSeeking, setIsSeeking] = useState(false);

  const formatTime = useCallback((time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  const handlePlayPause = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(err => {
          console.error('Error playing video:', err);
          onError?.('Failed to play video');
        });
      }
    }
  }, [isPlaying, onError]);

  const handleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  const handleVolumeChange = useCallback((value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      if (newVolume === 0) {
        setIsMuted(true);
        videoRef.current.muted = true;
      } else if (isMuted) {
        setIsMuted(false);
        videoRef.current.muted = false;
      }
    }
  }, [isMuted]);

  const handleSeek = useCallback((value: number[]) => {
    const seekTime = value[0];
    setCurrentTime(seekTime);
    if (videoRef.current && !isSeeking) {
      videoRef.current.currentTime = seekTime;
    }
  }, [isSeeking]);

  const handleSeekStart = useCallback(() => {
    setIsSeeking(true);
  }, []);

  const handleSeekEnd = useCallback((value: number[]) => {
    const seekTime = value[0];
    if (videoRef.current) {
      videoRef.current.currentTime = seekTime;
    }
    setIsSeeking(false);
  }, []);

  const handleFullscreen = useCallback(() => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  }, []);

  const handleVideoClick = useCallback(() => {
    handlePlayPause();
  }, [handlePlayPause]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadStart = () => {
      setIsLoading(true);
      setCurrentTime(0);
      setDuration(0);
      onLoadStart?.();
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setVolume(video.volume);
    };

    const handleLoadedData = () => {
      setIsLoading(false);
      onLoadEnd?.();
      
      // Auto-play if enabled
      if (autoPlay) {
        video.play().catch(err => {
          console.error('Auto-play failed:', err);
          onError?.('Auto-play failed. Click play to start video.');
        });
      }
    };

    const handleTimeUpdate = () => {
      if (!isSeeking) {
        setCurrentTime(video.currentTime);
      }
    };

    const handleError = () => {
      setIsLoading(false);
      onError?.('Failed to load video');
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    const handleVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };

    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('error', handleError);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('volumechange', handleVolumeChange);

    return () => {
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('error', handleError);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('volumechange', handleVolumeChange);
    };
  }, [src, autoPlay, isSeeking, onLoadStart, onLoadEnd, onError]);

  return (
    <div className="video-container relative w-full max-w-4xl mx-auto">
      <div className="relative rounded-lg overflow-hidden bg-video-bg">
        <video
          ref={videoRef}
          src={src}
          className="w-full aspect-video object-cover cursor-pointer"
          controls={false}
          preload="metadata"
          poster=""
          onClick={handleVideoClick}
          playsInline
        />
        
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-video-bg flex items-center justify-center">
            <div className="loading-spinner w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Custom controls overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent">
          {/* Seek bar */}
          <div className="px-4 pt-2">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-white text-xs font-mono min-w-[40px]">
                {formatTime(currentTime)}
              </span>
              <div className="flex-1">
                <Slider
                  value={[currentTime]}
                  max={duration || 100}
                  step={0.1}
                  onValueChange={handleSeek}
                  onPointerDown={handleSeekStart}
                  onValueCommit={handleSeekEnd}
                  className="w-full"
                />
              </div>
              <span className="text-white text-xs font-mono min-w-[40px]">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Control buttons */}
          <div className="px-4 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 sm:gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePlayPause}
                  className="text-white hover:text-accent hover:bg-white/10 h-10 w-10 sm:h-auto sm:w-auto p-2"
                >
                  {isPlaying ? <Pause className="w-4 h-4 sm:w-5 sm:h-5" /> : <Play className="w-4 h-4 sm:w-5 sm:h-5" />}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMute}
                  className="text-white hover:text-accent hover:bg-white/10 h-10 w-10 sm:h-auto sm:w-auto p-2"
                >
                  {isMuted ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />}
                </Button>

                {/* Volume slider - hidden on mobile */}
                <div className="hidden sm:flex items-center gap-2 min-w-[100px]">
                  <Slider
                    value={[isMuted ? 0 : volume]}
                    max={1}
                    step={0.01}
                    onValueChange={handleVolumeChange}
                    className="w-20"
                  />
                </div>
                
                <span className="text-white text-xs sm:text-sm font-medium truncate max-w-[120px] sm:max-w-none">
                  {title}
                </span>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleFullscreen}
                className="text-white hover:text-accent hover:bg-white/10 h-10 w-10 sm:h-auto sm:w-auto p-2"
              >
                <Maximize className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};