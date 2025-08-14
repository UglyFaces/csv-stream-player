import { useState, useEffect } from 'react';

interface Video {
  file_id: string;
  video_url: string;
}

export const useVideoData = (csvUrl: string) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAndParseCSV = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(csvUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch CSV: ${response.statusText}`);
        }

        const csvText = await response.text();
        const parsedVideos = parseCSV(csvText);
        
        if (parsedVideos.length === 0) {
          throw new Error('No valid video data found in CSV');
        }

        setVideos(parsedVideos);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        console.error('Error fetching CSV:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (csvUrl) {
      fetchAndParseCSV();
    }
  }, [csvUrl]);

  const parseCSV = (csvText: string): Video[] => {
    const lines = csvText.trim().split('\n');
    
    if (lines.length < 2) {
      throw new Error('CSV must have at least a header row and one data row');
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const fileIdIndex = headers.findIndex(h => h.includes('file_id') || h.includes('id'));
    const videoUrlIndex = headers.findIndex(h => h.includes('video_url') || h.includes('url'));

    if (fileIdIndex === -1 || videoUrlIndex === -1) {
      throw new Error('CSV must contain file_id and video_url columns');
    }

    const videos: Video[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(',');
      
      if (row.length >= Math.max(fileIdIndex, videoUrlIndex) + 1) {
        const file_id = row[fileIdIndex]?.trim();
        const video_url = row[videoUrlIndex]?.trim();
        
        if (file_id && video_url && isValidUrl(video_url)) {
          videos.push({ file_id, video_url });
        }
      }
    }

    return videos;
  };

  const isValidUrl = (string: string): boolean => {
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
  };

  return { videos, isLoading, error };
};