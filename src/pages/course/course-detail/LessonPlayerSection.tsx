import type { RefObject } from "react";
import { formatDuration } from "../../../utils";
import type { LessonApi, LessonProgressOut } from "../../../types/types";
import {
  MdPlayCircle,
  MdPause,
  MdCheckCircle,
  MdVolumeUp,
  MdFullscreen,
  MdTimer,
  MdNavigateNext,
  MdNavigateBefore,
  MdSkipNext
} from "react-icons/md";
import { FiBarChart2 } from "react-icons/fi";
import { useState, useEffect } from "react";

type Props = {
  activeLesson: LessonApi | null;
  activeIndex: number;
  lessonsCount: number;
  youtubeEmbedUrl: string | null;
  videoSource: string;
  videoRef: RefObject<HTMLVideoElement | null>;
  lessonProgressMap: Map<string, LessonProgressOut>;
  persistLessonProgress: (lesson: LessonApi, forceComplete?: boolean) => Promise<void>;
  onMarkCompleted: () => void;
};

function LessonPlayerSection({
  activeLesson,
  // activeIndex,
  // lessonsCount,
  youtubeEmbedUrl,
  videoSource,
  videoRef,
  lessonProgressMap,
  persistLessonProgress,
  onMarkCompleted,
}: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);

  const progress = lessonProgressMap.get(activeLesson?.id || "")?.progress_percent || 0;
  // const isLessonCompleted = lessonProgressMap.get(activeLesson?.id || "")?.is_completed || false;

  useEffect(() => {
    if (activeLesson) {
      const saved = lessonProgressMap.get(activeLesson.id);
      setIsCompleted(saved?.is_completed || false);
    }
  }, [activeLesson, lessonProgressMap]);

  const handlePlayPause = () => {
    if (!videoRef.current) return;
    
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
    setDuration(videoRef.current.duration || activeLesson?.duration_sec || 0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const time = parseFloat(e.target.value);
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const vol = parseFloat(e.target.value);
    videoRef.current.volume = vol;
    setVolume(vol);
  };

  const handleMarkCompleted = () => {
    setIsCompleted(true);
    onMarkCompleted();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white shadow-2xl">
      {/* Header with progress */}
      <div className="relative bg-gradient-to-r from-cyan-600 via-teal-500 to-emerald-600 px-6 py-4">
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-white/20 backdrop-blur-sm p-2">
                <MdTimer className="text-white" size={20} />
              </div>
              <span className="text-sm font-medium text-white/90">
                {activeLesson ? formatDuration(activeLesson.duration_sec || 0) : "8-12 min"}
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-xs text-white/70">Lesson Progress</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-32 overflow-hidden rounded-full bg-white/30">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-white to-emerald-200"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-white">{progress}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white md:text-3xl">
                <span className="text-white/90">Lesson {activeLesson?.order || 1}:</span> {activeLesson?.title || "Lesson"}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Video Player */}
      <div className="relative">
        {/* Video Container */}
        <div className="relative bg-black">
          {youtubeEmbedUrl ? (
            <iframe
              className="aspect-video w-full"
              src={youtubeEmbedUrl}
              title={activeLesson?.title || "YouTube lesson"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : activeLesson?.video_url ? (
            <>
              <video
                ref={videoRef}
                className="aspect-video w-full object-cover"
                controls={false}
                autoPlay
                src={videoSource}
                onLoadedMetadata={(event) => {
                  if (!activeLesson) return;
                  const saved = lessonProgressMap.get(activeLesson.id);
                  if (!saved || saved.is_completed || saved.last_position_sec <= 0) return;

                  const video = event.currentTarget;
                  const safeMax = Math.max(0, Math.floor((video.duration || activeLesson.duration_sec || 0) - 3));
                  video.currentTime = Math.min(saved.last_position_sec, safeMax);
                  setDuration(video.duration);
                }}
                onTimeUpdate={handleTimeUpdate}
                onPlay={() => setIsPlaying(true)}
                onPause={() => {
                  setIsPlaying(false);
                  if (activeLesson) void persistLessonProgress(activeLesson);
                }}
                onEnded={() => {
                  setIsPlaying(false);
                  if (activeLesson) void persistLessonProgress(activeLesson, true);
                }}
              />
              
              {/* Custom Video Controls */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
                {/* Progress Bar */}
                <div className="mb-4">
                  <input
                    type="range"
                    min="0"
                    max={duration}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-1.5 bg-white/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                  />
                  <div className="flex justify-between text-xs text-white/70 mt-1">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={handlePlayPause}
                      className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                    >
                      {isPlaying ? <MdPause size={24} /> : <MdPlayCircle size={24} />}
                    </button>
                    
                    <div className="flex items-center gap-2">
                      <MdVolumeUp className="text-white" size={20} />
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="w-20 h-1.5 bg-white/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button className="text-sm font-medium text-white/90 hover:text-white flex items-center gap-1">
                      <MdNavigateBefore size={20} />
                      Previous
                    </button>
                    <button className="text-sm font-medium text-white/90 hover:text-white flex items-center gap-1">
                      Next
                      <MdNavigateNext size={20} />
                    </button>
                    <button className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors">
                      <MdFullscreen size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="grid aspect-video place-items-center bg-gradient-to-br from-slate-900 to-slate-800">
              <div className="text-center">
                <MdPlayCircle className="mx-auto text-slate-400 mb-4" size={64} />
                <p className="text-slate-300 font-medium">Video content not available</p>
                <p className="text-slate-500 text-sm mt-1">Check back later or contact support</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lesson Content */}
      <div className="p-6 space-y-6">
        {/* Description */}
        <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-white p-5 border border-slate-200/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 text-white">
              <FiBarChart2 size={20} />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Lesson Overview</h4>
          </div>
          <p className="text-slate-700 leading-relaxed">
            {activeLesson?.description || "This lesson covers essential concepts with practical examples and interactive exercises to reinforce learning."}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleMarkCompleted}
            disabled={isCompleted}
            className={`flex-1 rounded-xl px-6 py-4 font-semibold transition-all duration-300 flex items-center justify-center gap-3 ${
              isCompleted
                ? "bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 border border-emerald-200 cursor-default"
                : "bg-gradient-to-r from-cyan-500 to-emerald-500 text-white hover:shadow-xl hover:shadow-cyan-500/25 hover:-translate-y-0.5"
            }`}
          >
            {isCompleted ? (
              <>
                <MdCheckCircle size={24} />
                Lesson Completed ✓
              </>
            ) : (
              <>
                <MdCheckCircle size={24} />
                Mark as Completed
              </>
            )}
          </button>
        </div>

        {/* Quick Navigation */}
        <div className="rounded-2xl bg-gradient-to-r from-slate-50 to-cyan-50/30 border border-slate-200/50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-900">Continue Learning</h4>
              <p className="text-sm text-slate-600 mt-1">Move to next lesson when ready</p>
            </div>
            <div className="flex gap-3">
              <button className="p-3 rounded-xl border border-slate-300 text-slate-700 hover:border-cyan-400 hover:text-cyan-700 transition-colors">
                <MdNavigateBefore size={24} />
              </button>
              <button className="p-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-white hover:shadow-lg transition-all duration-300">
                <MdSkipNext size={24} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default LessonPlayerSection;