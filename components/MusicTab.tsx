import React, { useState, useRef, useEffect } from 'react';
import { CustomAudioTrack, getAllTracks, saveTrack, deleteTrack, clearAllTracks } from '../services/audioDb';

interface MusicTabProps {
  lang: 'uz' | 'ru' | 'en';
  theme: 'dark' | 'light';
}

interface Soundscape {
  id: string;
  name: string;
  category: string;
  icon: string;
  color: string;
  type: 'rain' | 'waves' | 'fire' | 'alpha' | 'cafe';
}

export const MusicTab: React.FC<MusicTabProps> = ({ lang, theme }) => {
  // Mode: 'custom' (user playlist) or 'soundscapes' (ambient noises)
  const [activeMode, setActiveMode] = useState<'custom' | 'soundscapes'>('custom');

  // Custom Playlist State
  const [tracks, setTracks] = useState<CustomAudioTrack[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.8);
  const [loopMode, setLoopMode] = useState<'off' | 'all' | 'one'>('all');
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Soundscapes State
  const [activeSound, setActiveSound] = useState<string | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const noiseNodeRef = useRef<any>(null);

  // Audio HTML5 Element for screen-off & background playback
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const soundscapes: Soundscape[] = [
    { id: 'rain', name: 'Yengil Yomg\'ir', category: 'Tabiat', icon: 'fa-cloud-rain', color: 'bg-blue-500', type: 'rain' },
    { id: 'waves', name: 'Tungi Okean To\'lqini', category: 'Suv', icon: 'fa-water', color: 'bg-cyan-500', type: 'waves' },
    { id: 'fire', name: 'Kamin Olovi', category: 'Iliq', icon: 'fa-fire', color: 'bg-amber-500', type: 'fire' },
    { id: 'alpha', name: 'Alpha To\'lqinlari (14Hz)', category: 'Miya quvvati', icon: 'fa-brain', color: 'bg-purple-600', type: 'alpha' },
    { id: 'cafe', name: 'Shinam Qahvaxona', category: 'Shahar', icon: 'fa-mug-hot', color: 'bg-orange-600', type: 'cafe' }
  ];

  // Load custom tracks from IndexedDB on mount
  useEffect(() => {
    loadTracks();

    return () => {
      // Stop any ambient audio on unmount
      stopAmbient();
    };
  }, []);

  const loadTracks = async () => {
    try {
      const stored = await getAllTracks();
      setTracks(stored);
    } catch (e) {
      console.warn('Error loading tracks from IndexedDB:', e);
    }
  };

  const currentTrack = currentTrackIndex >= 0 && currentTrackIndex < tracks.length ? tracks[currentTrackIndex] : null;

  // MediaSession API setup for background and screen-off lock screen controls
  useEffect(() => {
    if (!('mediaSession' in navigator) || !currentTrack) return;

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.name.replace(/\.[^/.]+$/, ''),
        artist: 'Life Engine Player',
        album: 'Mening Pleylistim',
        artwork: [
          { src: '/icon.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon.png', sizes: '512x512', type: 'image/png' }
        ]
      });

      navigator.mediaSession.setActionHandler('play', () => {
        audioRef.current?.play();
        setIsPlaying(true);
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        audioRef.current?.pause();
        setIsPlaying(false);
      });
      navigator.mediaSession.setActionHandler('previoustrack', () => {
        handlePrevTrack();
      });
      navigator.mediaSession.setActionHandler('nexttrack', () => {
        handleNextTrack();
      });
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined && audioRef.current) {
          audioRef.current.currentTime = details.seekTime;
          setCurrentTime(details.seekTime);
        }
      });
    } catch (err) {
      console.debug('MediaSession registration note:', err);
    }
  }, [currentTrack]);

  // Sync volume with audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Handle Play track by index
  const playTrackByIndex = (index: number) => {
    if (index < 0 || index >= tracks.length) return;

    // Stop ambient noise if running
    stopAmbient();

    const track = tracks[index];
    if (!track.objectUrl && track.blob) {
      track.objectUrl = URL.createObjectURL(track.blob);
    }

    setCurrentTrackIndex(index);
    setIsPlaying(true);

    if (audioRef.current) {
      audioRef.current.src = track.objectUrl || '';
      audioRef.current.play().catch(e => {
        console.warn('Audio play request failed or interrupted:', e);
      });
    }
  };

  const handleTogglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (currentTrackIndex === -1 && tracks.length > 0) {
        playTrackByIndex(0);
      } else {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(e => {
          console.warn('Playback resume failed:', e);
        });
      }
    }
  };

  const handleNextTrack = () => {
    if (tracks.length === 0) return;

    if (isShuffle) {
      const randomIndex = Math.floor(Math.random() * tracks.length);
      playTrackByIndex(randomIndex);
      return;
    }

    const nextIndex = (currentTrackIndex + 1) % tracks.length;
    playTrackByIndex(nextIndex);
  };

  const handlePrevTrack = () => {
    if (tracks.length === 0) return;

    // If more than 3 seconds into track, seek to start
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      return;
    }

    const prevIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    playTrackByIndex(prevIndex);
  };

  // On track ended
  const handleAudioEnded = () => {
    if (loopMode === 'one' && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      return;
    }

    if (loopMode === 'all' || isShuffle) {
      handleNextTrack();
    } else if (currentTrackIndex < tracks.length - 1) {
      playTrackByIndex(currentTrackIndex + 1);
    } else {
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };

  // Upload file handlers
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadError(null);

    const added: CustomAudioTrack[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // Check if audio file
      if (!file.type.startsWith('audio/') && !/\.(mp3|wav|m4a|aac|ogg|flac|weba)$/i.test(file.name)) {
        continue;
      }

      try {
        const id = 'track_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
        const cleanName = file.name.replace(/\.[^/.]+$/, '');

        const saved = await saveTrack({
          id,
          name: cleanName,
          size: file.size,
          type: file.type || 'audio/mpeg',
          addedAt: Date.now(),
          blob: file
        });

        added.push(saved);
      } catch (err: any) {
        console.error('Failed to save track:', err);
        setUploadError('Faylni saqlashda xatolik yuz berdi');
      }
    }

    if (added.length > 0) {
      await loadTracks();
      // If no track currently playing, select the first newly added
      if (currentTrackIndex === -1) {
        setCurrentTrackIndex(0);
      }
    }

    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteTrack = async (e: React.MouseEvent, id: string, index: number) => {
    e.stopPropagation();
    try {
      await deleteTrack(id);
      if (currentTrackIndex === index) {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.src = '';
        }
        setIsPlaying(false);
        setCurrentTrackIndex(-1);
      } else if (currentTrackIndex > index) {
        setCurrentTrackIndex(currentTrackIndex - 1);
      }
      await loadTracks();
    } catch (err) {
      console.warn('Failed to delete track:', err);
    }
  };

  // Seek bar
  const handleSeek = (newTime: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  // Ambient sound synthesizer
  const stopAmbient = () => {
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch (e) {}
      audioCtxRef.current = null;
    }
    setActiveSound(null);
  };

  const playAmbient = (sound: Soundscape) => {
    // Pause custom music if playing
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }

    stopAmbient();

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(volume * 0.2, ctx.currentTime);
      gain.connect(ctx.destination);
      gainNodeRef.current = gain;

      if (sound.type === 'alpha') {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        osc1.frequency.setValueAtTime(214, ctx.currentTime);
        osc2.frequency.setValueAtTime(200, ctx.currentTime);
        osc1.connect(gain);
        osc2.connect(gain);
        osc1.start();
        osc2.start();
      } else {
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
          b6 = white * 0.115926;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        const filter = ctx.createBiquadFilter();
        if (sound.type === 'rain') {
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(800, ctx.currentTime);
        } else if (sound.type === 'waves') {
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(400, ctx.currentTime);
        } else {
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(1200, ctx.currentTime);
        }

        noise.connect(filter);
        filter.connect(gain);
        noise.start();
        noiseNodeRef.current = noise;
      }

      setActiveSound(sound.id);
    } catch (e) {
      console.warn('Web audio failed:', e);
    }
  };

  const handleToggleAmbient = (sound: Soundscape) => {
    if (activeSound === sound.id) {
      stopAmbient();
    } else {
      playAmbient(sound);
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-slide-up space-y-6 pb-12">
      {/* Hidden Real HTML5 Audio Element with playsInline and auto preload for screen-off playback */}
      <audio
        ref={audioRef}
        playsInline
        preload="auto"
        onTimeUpdate={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
          }
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration);
          }
        }}
        onEnded={handleAudioEnded}
      />

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        multiple
        accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg"
        onChange={(e) => handleFileUpload(e.target.files)}
        className="hidden"
      />

      {/* Modern Compact Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center text-sm">
              <i className="fas fa-headphones"></i>
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Musiqa va Tovushlar Zali
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Shaxsiy musiqalaringizni fayldan yuklab, telefon ekrani o'chiq bo'lsa ham eshiting
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl self-start sm:self-auto">
          <button
            onClick={() => setActiveMode('custom')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
              activeMode === 'custom'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <i className="fas fa-music mr-1.5 text-xs"></i>
            Pleylist ({tracks.length})
          </button>
          <button
            onClick={() => setActiveMode('soundscapes')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
              activeMode === 'soundscapes'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-purple-500'
            }`}
          >
            <i className="fas fa-wind mr-1.5 text-xs"></i>
            Tabiat & Fokus
          </button>
        </div>
      </div>

      {/* Screen-off Playback Notice Badge */}
      <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-800/60 p-3.5 sm:p-4 rounded-2xl flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center text-sm shrink-0">
          <i className="fas fa-mobile-screen"></i>
        </div>
        <p className="text-[11px] sm:text-xs text-purple-900 dark:text-purple-200 font-medium leading-relaxed">
          <strong>Orqa fonda va bloklangan ekranda ijro:</strong> Musiqani yoqqaningizdan so'ng telefon ekranini o'chirib qo'ysangiz ham musiqa to'xtovsiz davom etadi va blok ekrandan boshqariladi.
        </p>
      </div>

      {activeMode === 'custom' ? (
        <>
          {/* Main Music Player Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-xl relative overflow-hidden">
            {/* Background subtle glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 space-y-5">
              {/* Current Track Info */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white text-lg shadow-md shrink-0 transition-all ${
                    isPlaying ? 'bg-gradient-to-tr from-purple-600 to-indigo-600 shadow-purple-500/30 animate-pulse' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                  }`}>
                    <i className="fas fa-compact-disc text-xl"></i>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white truncate">
                      {currentTrack ? currentTrack.name : 'Musiqa tanlanmagan'}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                      {currentTrack ? (
                        <>
                          {formatFileSize(currentTrack.size)} • {isPlaying ? 'Ijro etilmoqda' : 'Pauzada'}
                        </>
                      ) : (
                        'Pleylistdan musiqa tanlang yoki fayl yuklang'
                      )}
                    </p>
                  </div>
                </div>

                {/* Upload Trigger Button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-lg shadow-purple-600/25 transition-all flex items-center gap-2 shrink-0 min-h-[42px]"
                >
                  <i className={`fas ${isUploading ? 'fa-spinner fa-spin' : 'fa-folder-plus'} text-xs`}></i>
                  <span className="hidden sm:inline">Fayldan Qo'shish</span>
                  <span className="sm:hidden">Yuklash</span>
                </button>
              </div>

              {/* Seek Progress Slider */}
              <div className="space-y-1.5">
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  step="0.5"
                  value={currentTime}
                  onChange={(e) => handleSeek(parseFloat(e.target.value))}
                  disabled={!currentTrack}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-600 focus:outline-none"
                />
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Player Controls (Prev, Play/Pause, Next, Shuffle, Repeat) */}
              <div className="flex items-center justify-between pt-1">
                {/* Shuffle Button */}
                <button
                  onClick={() => setIsShuffle(!isShuffle)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                    isShuffle ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 font-bold' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                  }`}
                  title={isShuffle ? "Aralashtirish: Yoqilgan" : "Aralashtirish: O'chiq"}
                >
                  <i className="fas fa-shuffle text-xs"></i>
                </button>

                {/* Center Audio Navigation */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={handlePrevTrack}
                    disabled={tracks.length === 0}
                    className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 flex items-center justify-center transition-all disabled:opacity-40"
                  >
                    <i className="fas fa-backward-step text-sm"></i>
                  </button>

                  <button
                    onClick={handleTogglePlay}
                    disabled={tracks.length === 0}
                    className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-xl shadow-purple-600/30 active:scale-95 flex items-center justify-center text-lg transition-all disabled:opacity-40"
                  >
                    <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'} ${isPlaying ? '' : 'ml-0.5'}`}></i>
                  </button>

                  <button
                    onClick={handleNextTrack}
                    disabled={tracks.length === 0}
                    className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 flex items-center justify-center transition-all disabled:opacity-40"
                  >
                    <i className="fas fa-forward-step text-sm"></i>
                  </button>
                </div>

                {/* Loop Mode Toggle */}
                <button
                  onClick={() => {
                    const next = loopMode === 'off' ? 'all' : loopMode === 'all' ? 'one' : 'off';
                    setLoopMode(next);
                  }}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all relative ${
                    loopMode !== 'off' ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 font-bold' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                  }`}
                  title={`Takrorlash: ${loopMode}`}
                >
                  <i className="fas fa-repeat text-xs"></i>
                  {loopMode === 'one' && (
                    <span className="absolute text-[8px] font-black top-1 right-1 leading-none">1</span>
                  )}
                </button>
              </div>

              {/* Volume Slider Bar */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-slate-400 text-xs">
                  <i className={`fas ${volume === 0 ? 'fa-volume-xmark' : volume < 0.5 ? 'fa-volume-low' : 'fa-volume-high'}`}></i>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Ovoz: {Math.round(volume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-32 sm:w-44 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>
            </div>
          </div>

          {/* Playlist Section */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Saqlangan Musiqalarim ({tracks.length})
              </h3>

              {tracks.length > 0 && (
                <button
                  onClick={async () => {
                    if (window.confirm("Barcha musiqalarni o'chirishni xohlaysizmi?")) {
                      await clearAllTracks();
                      if (audioRef.current) {
                        audioRef.current.pause();
                        audioRef.current.src = '';
                      }
                      setIsPlaying(false);
                      setCurrentTrackIndex(-1);
                      await loadTracks();
                    }
                  }}
                  className="text-[11px] font-bold text-slate-400 hover:text-rose-500 transition-colors"
                >
                  Pleylistni tozalash
                </button>
              )}
            </div>

            {uploadError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-300 text-xs rounded-xl font-bold">
                {uploadError}
              </div>
            )}

            {tracks.length === 0 ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-700 rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all group"
              >
                <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  <i className="fas fa-cloud-arrow-up"></i>
                </div>
                <h4 className="text-sm font-black text-slate-800 dark:text-white mb-1">
                  Hozircha musiqa yuklanmagan
                </h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
                  Telefoningiz yoki kompyuteringizdan istalgan .mp3, .m4a yoki audio fayllarni tanlab qo'shing.
                </p>
                <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-md">
                  <i className="fas fa-plus text-xs"></i>
                  <span>Fayllarni tanlash</span>
                </span>
              </div>
            ) : (
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {tracks.map((track, idx) => {
                  const isCurrent = currentTrackIndex === idx;
                  return (
                    <div
                      key={track.id}
                      onClick={() => playTrackByIndex(idx)}
                      className={`p-3 sm:p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                        isCurrent
                          ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-300 dark:border-purple-800/80 shadow-sm'
                          : 'bg-slate-50/60 dark:bg-slate-850/50 border-slate-100 dark:border-slate-800/60 hover:border-slate-200 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-xs transition-all ${
                          isCurrent
                            ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-500 group-hover:bg-purple-100 dark:group-hover:bg-purple-950/60 group-hover:text-purple-600'
                        }`}>
                          {isCurrent && isPlaying ? (
                            <i className="fas fa-volume-high animate-pulse"></i>
                          ) : (
                            <i className="fas fa-play"></i>
                          )}
                        </div>

                        <div className="min-w-0">
                          <h4 className={`text-xs sm:text-sm font-black truncate ${
                            isCurrent ? 'text-purple-700 dark:text-purple-300' : 'text-slate-800 dark:text-white'
                          }`}>
                            {track.name}
                          </h4>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            {formatFileSize(track.size)} • Musiqa fayli
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isCurrent && (
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-600/10 text-purple-600 dark:text-purple-300">
                            {isPlaying ? 'Ijro' : 'Pauza'}
                          </span>
                        )}

                        <button
                          onClick={(e) => handleDeleteTrack(e, track.id, idx)}
                          title="Pleylistdan o'chirish"
                          className="w-8 h-8 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-center transition-all opacity-60 group-hover:opacity-100"
                        >
                          <i className="fas fa-trash-alt text-xs"></i>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      ) : (
        /* Ambient Nature & Alpha Sounds Section */
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            {soundscapes.map((sound) => {
              const isPlayingAmbient = activeSound === sound.id;
              return (
                <div
                  key={sound.id}
                  onClick={() => handleToggleAmbient(sound)}
                  className={`p-4 sm:p-5 rounded-3xl border transition-all cursor-pointer flex items-center justify-between group ${
                    isPlayingAmbient
                      ? 'bg-purple-600 text-white border-purple-600 shadow-xl scale-[1.02]'
                      : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-800'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white text-base shadow-md shrink-0 ${sound.color}`}>
                      <i className={`fas ${sound.icon}`}></i>
                    </div>
                    <div className="min-w-0">
                      <h4 className={`text-xs sm:text-sm font-black truncate ${isPlayingAmbient ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                        {sound.name}
                      </h4>
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${isPlayingAmbient ? 'text-purple-200' : 'text-slate-400'}`}>
                        {sound.category}
                      </span>
                    </div>
                  </div>

                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all ${
                    isPlayingAmbient ? 'bg-white text-purple-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-purple-500'
                  }`}>
                    <i className={`fas ${isPlayingAmbient ? 'fa-pause' : 'fa-play'} text-xs`}></i>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
