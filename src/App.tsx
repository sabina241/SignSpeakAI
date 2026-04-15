/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Camera, Languages, Loader2, RefreshCw, StopCircle, Play, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const MODEL_NAME = "gemini-3-flash-preview";

export default function App() {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("American Sign Language (ASL)");
  const [translatedText, setTranslatedText] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<{ text: string; timestamp: Date }[]>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Gemini
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraActive(true);
        setError(null);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Could not access camera. Please ensure permissions are granted.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    stopTranslation();
  };

  const captureFrame = (): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
  };

  const translateFrame = async () => {
    const base64Image = captureFrame();
    if (!base64Image) return;

    try {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Image,
              },
            },
            {
              text: `You are an expert ${selectedLanguage} interpreter. Analyze the sign language gesture in this image and provide the corresponding English word or short phrase. If no clear sign is detected, respond with '...'. Be concise, only output the translation.`,
            },
          ],
        },
        config: {
          systemInstruction: "You are a specialized AI for sign language translation. Your goal is to provide accurate, real-time text representations of visual signs. Keep responses extremely brief.",
        }
      });

      const text = response.text?.trim() || "";
      if (text && text !== "...") {
        setTranslatedText(prev => {
          // Only update if it's different from the last one to avoid flickering
          if (prev !== text) {
            setHistory(h => [{ text, timestamp: new Date() }, ...h].slice(0, 10));
            return text;
          }
          return prev;
        });
      }
    } catch (err) {
      console.error("Translation error:", err);
    }
  };

  const startTranslation = () => {
    if (!isCameraActive) return;
    setIsTranslating(true);
    // Translate every 2 seconds to avoid hitting rate limits too hard while maintaining "real-time" feel
    intervalRef.current = setInterval(translateFrame, 2000);
  };

  const stopTranslation = () => {
    setIsTranslating(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans selection:bg-emerald-500/30">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Languages className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight">SignSpeak AI</h1>
              <p className="text-[10px] uppercase tracking-widest text-emerald-500 font-semibold">Real-time Interpreter</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <select 
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-zinc-900 border border-white/10 rounded-full px-4 py-2 text-xs font-bold text-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none cursor-pointer hover:bg-zinc-800 transition-colors"
            >
              <option value="American Sign Language (ASL)">ASL (American)</option>
              <option value="British Sign Language (BSL)">BSL (British)</option>
              <option value="Indian Sign Language (ISL)">ISL (Indian)</option>
              <option value="French Sign Language (LSF)">LSF (French)</option>
              <option value="Universal/Any">Universal (Best Effort)</option>
            </select>

            {isCameraActive ? (
              <button 
                onClick={stopCamera}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all text-sm font-medium"
              >
                <StopCircle className="w-4 h-4" />
                Stop Camera
              </button>
            ) : (
              <button 
                onClick={startCamera}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500 text-black hover:bg-emerald-400 transition-all text-sm font-bold shadow-lg shadow-emerald-500/20"
              >
                <Camera className="w-4 h-4" />
                Start Camera
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Camera View */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative aspect-video bg-zinc-900 rounded-3xl overflow-hidden border border-white/10 shadow-2xl group">
            {!isCameraActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500 p-12 text-center">
                <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center mb-6 border border-white/5">
                  <Camera className="w-10 h-10" />
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">Camera Offline</h2>
                <p className="max-w-xs text-sm opacity-60">
                  Enable your camera to start translating sign language into text in real-time.
                </p>
                <button 
                  onClick={startCamera}
                  className="mt-8 px-8 py-3 bg-white text-black rounded-full font-bold hover:scale-105 transition-transform"
                >
                  Activate Camera
                </button>
              </div>
            )}
            
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className={cn(
                "w-full h-full object-cover transition-opacity duration-700",
                isCameraActive ? "opacity-100" : "opacity-0"
              )}
            />
            
            {/* HUD Overlay */}
            <AnimatePresence>
              {isCameraActive && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 pointer-events-none"
                >
                  {/* Corners */}
                  <div className="absolute top-8 left-8 w-12 h-12 border-t-2 border-l-2 border-emerald-500/50 rounded-tl-lg" />
                  <div className="absolute top-8 right-8 w-12 h-12 border-t-2 border-r-2 border-emerald-500/50 rounded-tr-lg" />
                  <div className="absolute bottom-8 left-8 w-12 h-12 border-b-2 border-l-2 border-emerald-500/50 rounded-bl-lg" />
                  <div className="absolute bottom-8 right-8 w-12 h-12 border-b-2 border-r-2 border-emerald-500/50 rounded-br-lg" />
                  
                  {/* Status Bar */}
                  <div className="absolute top-6 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-black/60 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-3">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      isTranslating ? "bg-emerald-500 animate-pulse" : "bg-zinc-600"
                    )} />
                    <span className="text-[10px] uppercase tracking-widest font-bold">
                      {isTranslating ? "Analyzing Stream" : "Ready to Translate"}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between p-6 bg-zinc-900/50 rounded-3xl border border-white/5">
            <div className="flex items-center gap-4">
              {isTranslating ? (
                <button 
                  onClick={stopTranslation}
                  className="px-6 py-3 bg-red-500 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-red-600 transition-colors"
                >
                  <StopCircle className="w-5 h-5" />
                  Stop Translation
                </button>
              ) : (
                <button 
                  disabled={!isCameraActive}
                  onClick={startTranslation}
                  className="px-6 py-3 bg-emerald-500 text-black rounded-2xl font-bold flex items-center gap-2 hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play className="w-5 h-5" />
                  Start Translation
                </button>
              )}
              
              <button 
                onClick={() => {
                  setTranslatedText("");
                  setHistory([]);
                }}
                className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-colors"
                title="Clear History"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
            
            <div className="hidden sm:flex items-center gap-2 text-zinc-500 text-sm">
              <Info className="w-4 h-4" />
              <span>Position your hands clearly in view</span>
            </div>
          </div>
        </div>

        {/* Right Column: Output & History */}
        <div className="space-y-6">
          {/* Current Translation */}
          <div className="bg-zinc-900 rounded-3xl border border-white/10 overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Current Output</span>
              {isTranslating && <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />}
            </div>
            <div className="p-8 min-h-[160px] flex items-center justify-center text-center">
              <AnimatePresence mode="wait">
                {translatedText ? (
                  <motion.h3 
                    key={translatedText}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-4xl font-bold tracking-tight text-emerald-400"
                  >
                    {translatedText}
                  </motion.h3>
                ) : (
                  <p className="text-zinc-600 italic">Waiting for signs...</p>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* History */}
          <div className="bg-zinc-900 rounded-3xl border border-white/10 overflow-hidden flex flex-col h-[400px]">
            <div className="px-6 py-4 border-b border-white/5 bg-white/5">
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Recent History</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
              {history.length === 0 ? (
                <div className="h-full flex items-center justify-center text-zinc-600 text-sm italic">
                  No history yet
                </div>
              ) : (
                history.map((item, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={`${item.timestamp.getTime()}-${i}`}
                    className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between group hover:bg-white/10 transition-colors"
                  >
                    <span className="font-medium text-zinc-200">{item.text}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Error Toast */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-red-500 text-white rounded-full font-bold shadow-2xl flex items-center gap-3 z-[100]"
          >
            <Info className="w-5 h-5" />
            {error}
            <button onClick={() => setError(null)} className="ml-2 opacity-50 hover:opacity-100">✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}} />
    </div>
  );
}
