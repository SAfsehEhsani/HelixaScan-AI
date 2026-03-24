import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Camera as CameraIcon, RefreshCw, X, Mic, MicOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CameraProps {
  onCapture: (base64: string) => void;
  onClose: () => void;
}

export const Camera: React.FC<CameraProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setError('Could not access camera. Please check permissions.');
      console.error(err);
    }
  }, []);

  const capture = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL('image/jpeg');
        onCapture(base64);
        onClose();
      }
    }
  }, [onCapture, onClose]);

  // Voice Recognition Setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('')
          .toLowerCase();

        console.log('Transcript:', transcript);

        if (transcript.includes('capture now') || transcript.includes('start analysis')) {
          setVoiceStatus('Command Received: Capturing...');
          setTimeout(() => {
            capture();
          }, 1000);
        } else if (transcript.includes('hey dermscan')) {
          setVoiceStatus('Listening for command...');
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsVoiceActive(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [capture]);

  const toggleVoice = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (isVoiceActive) {
      recognitionRef.current.stop();
      setIsVoiceActive(false);
      setVoiceStatus(null);
    } else {
      recognitionRef.current.start();
      setIsVoiceActive(true);
      setVoiceStatus('Voice Active: Say "Hey DermScan"');
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [startCamera]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-wellness-ink flex flex-col items-center justify-center p-4"
    >
      <div className="relative w-full max-w-md aspect-[3/4] bg-black overflow-hidden rounded-[3rem] shadow-2xl border-4 border-white/10">
        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-10 text-center space-y-4">
            <div className="w-16 h-16 bg-rose-500/20 text-rose-500 rounded-2xl flex items-center justify-center">
              <X size={32} />
            </div>
            <p className="font-serif text-lg">{error}</p>
            <button 
              onClick={onClose}
              className="px-8 py-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all text-sm font-bold uppercase tracking-widest"
            >
              Go Back
            </button>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover opacity-90"
            />
            {/* Clinical Overlay */}
            <div className="absolute inset-0 border-[40px] border-black/20 pointer-events-none">
              <div className="w-full h-full border border-white/20 rounded-3xl relative">
                <div className="absolute top-1/2 left-0 w-8 h-[1px] bg-white/40 -translate-y-1/2" />
                <div className="absolute top-1/2 right-0 w-8 h-[1px] bg-white/40 -translate-y-1/2" />
                <div className="absolute top-0 left-1/2 w-[1px] h-8 bg-white/40 -translate-x-1/2" />
                <div className="absolute bottom-0 left-1/2 w-[1px] h-8 bg-white/40 -translate-x-1/2" />
              </div>
            </div>
          </>
        )}
        
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-12 h-12 bg-black/40 backdrop-blur-xl rounded-2xl text-white hover:bg-black/60 transition-all flex items-center justify-center border border-white/10 z-20"
        >
          <X size={24} />
        </button>

        <button
          onClick={toggleVoice}
          className={`absolute top-6 left-6 w-12 h-12 rounded-2xl transition-all flex items-center justify-center border border-white/10 z-20 ${isVoiceActive ? 'bg-wellness-accent text-white animate-pulse' : 'bg-black/40 backdrop-blur-xl text-white/60 hover:bg-black/60'}`}
        >
          {isVoiceActive ? <Mic size={24} /> : <MicOff size={24} />}
        </button>

        <AnimatePresence>
          {voiceStatus && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-20 left-0 right-0 flex justify-center z-20"
            >
              <div className="px-4 py-2 bg-wellness-accent/90 backdrop-blur-md rounded-full text-white text-[10px] font-bold uppercase tracking-widest shadow-xl flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                {voiceStatus}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute bottom-10 left-0 right-0 flex justify-center items-center">
          <button
            onClick={capture}
            className="group relative flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-wellness-accent/40 blur-2xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-all border-8 border-white/20 relative z-10">
              <div className="w-16 h-16 rounded-full border-4 border-wellness-ink/10 flex items-center justify-center">
                <div className="w-12 h-12 bg-wellness-accent rounded-full" />
              </div>
            </div>
          </button>
        </div>
      </div>
      
      <canvas ref={canvasRef} className="hidden" />
      
      <div className="mt-8 text-center space-y-2">
        <p className="text-white/60 text-sm font-serif italic">
          Position the skin area clearly within the frame
        </p>
        <div className="flex items-center justify-center gap-2">
          <div className="w-1 h-1 rounded-full bg-wellness-accent animate-pulse" />
          <p className="text-[10px] text-wellness-accent uppercase font-bold tracking-[0.3em]">AI Clinical Alignment Active</p>
        </div>
      </div>
    </motion.div>
  );
};
