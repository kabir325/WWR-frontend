'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Play, 
  Pause, 
  SkipForward, 
  Volume2, 
  Music, 
  Activity,
  AlertCircle,
  CheckCircle,
  HardDrive
} from 'lucide-react';

interface PlayerStatus {
  is_playing: boolean;
  current_song_id: number | null;
  volume: number;
  storage_mode: string;
  current_song?: {
    filename: string;
    title?: string;
    artist?: string;
  };
  storage_health?: string;
  primary_storage_available?: boolean;
  fallback_storage_available?: boolean;
}

interface PlayerCardProps {
  id: string;
  name: string;
  ip?: string;
  location?: string;
  status?: string;
  apiUrl: string;
  userRole?: 'admin' | 'operator' | 'viewer';
}

export default function PlayerCard({ id, name, ip, location, status: piStatus, apiUrl, userRole = 'operator' }: PlayerCardProps) {
  const [status, setStatus] = useState<PlayerStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [volume, setVolume] = useState(70);

  // Fetch status
  const fetchStatus = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/status`, {
        timeout: 5000,
      });
      
      if (response.data.success && response.data.status) {
        setStatus(response.data.status);
        setVolume(Math.round((response.data.status.volume || 0.7) * 100));
        setError(null);
      }
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to connect');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [apiUrl]);

  // Control actions
  const sendControl = async (action: string, data?: any) => {
    try {
      await axios.post(`${apiUrl}/api/control`, {
        action,
        ...data,
      });
      setTimeout(fetchStatus, 500);
    } catch (err: any) {
      setError(err.message || 'Control failed');
    }
  };

  const handlePlay = () => userRole !== 'viewer' && sendControl('play');
  const handlePause = () => userRole !== 'viewer' && sendControl('pause');
  const handleSkip = () => userRole !== 'viewer' && sendControl('skip');
  const handleVolumeChange = (newVolume: number) => {
    if (userRole === 'viewer') return;
    setVolume(newVolume);
    sendControl('volume', { volume: newVolume / 100 });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Music className="w-6 h-6 text-indigo-600" />
            {name}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            {location && (
              <span className="text-sm text-gray-500">
                📍 {location}
              </span>
            )}
            {ip && (
              <>
                <span className="text-gray-400">•</span>
                <span className="text-sm text-gray-500">
                  {ip}
                </span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {piStatus === 'offline' || error ? (
            <div className="flex items-center gap-1 text-red-500">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-xs font-medium">Offline</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-green-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium">Online</span>
            </div>
          )}
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-700 font-medium">Connection Error</p>
          <p className="text-sm text-red-600 mt-1">{error}</p>
          <button
            onClick={fetchStatus}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          {/* Now Playing */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3 mb-2">
              <Activity className={`w-5 h-5 ${status?.is_playing ? 'text-green-500 animate-pulse' : 'text-gray-400'}`} />
              <span className="text-sm font-medium text-gray-700">
                {status?.is_playing ? 'Now Playing' : 'Stopped'}
              </span>
            </div>
            
            {status?.current_song ? (
              <div>
                <p className="font-semibold text-gray-800 truncate">
                  {status.current_song.title || status.current_song.filename}
                </p>
                {status.current_song.artist && (
                  <p className="text-sm text-gray-600 truncate">
                    {status.current_song.artist}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No song playing</p>
            )}
          </div>

          {/* Storage Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Storage</span>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                status?.storage_mode === 'primary' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {status?.storage_mode || 'Unknown'}
              </span>
            </div>
            <div className="mt-2 flex gap-4 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${status?.primary_storage_available ? 'bg-green-500' : 'bg-red-500'}`}></div>
                Primary
              </div>
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${status?.fallback_storage_available ? 'bg-green-500' : 'bg-red-500'}`}></div>
                Fallback
              </div>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <button
              onClick={handlePause}
              disabled={!status?.is_playing || userRole === 'viewer'}
              className={`p-4 rounded-full transition-colors ${
                userRole === 'viewer'
                  ? 'bg-gray-200 cursor-not-allowed'
                  : 'bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              <Pause className={`w-6 h-6 ${userRole === 'viewer' ? 'text-gray-400' : 'text-gray-700'}`} />
            </button>
            
            <button
              onClick={handlePlay}
              disabled={status?.is_playing || userRole === 'viewer'}
              className={`p-6 rounded-full transition-colors shadow-lg ${
                userRole === 'viewer' 
                  ? 'bg-gray-300 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              <Play className="w-8 h-8 text-white" />
            </button>
            
            <button
              onClick={handleSkip}
              disabled={userRole === 'viewer'}
              className={`p-4 rounded-full transition-colors ${
                userRole === 'viewer'
                  ? 'bg-gray-200 cursor-not-allowed'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <SkipForward className={`w-6 h-6 ${userRole === 'viewer' ? 'text-gray-400' : 'text-gray-700'}`} />
            </button>
          </div>

          {/* Volume Control */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <Volume2 className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Volume</span>
              <span className="ml-auto text-sm font-semibold text-indigo-600">
                {volume}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              disabled={userRole === 'viewer'}
              onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
              className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
                userRole === 'viewer'
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-gray-200 accent-indigo-600'
              }`}
            />
          </div>
        </>
      )}
    </div>
  );
}
