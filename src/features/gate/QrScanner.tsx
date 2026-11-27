'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import { Camera, CameraOff, Loader2, X } from 'lucide-react';

interface QrScannerProps {
  onToken: (token: string) => void;
  onClose: () => void;
}

export function QrScanner({ onToken, onClose }: QrScannerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const stopRef = useRef<() => void>(() => undefined);
  const onTokenRef = useRef(onToken);

  useEffect(() => {
    onTokenRef.current = onToken;
  }, [onToken]);

  const stop = useCallback(() => {
    stopRef.current();
  }, []);

  useEffect(() => {
    let cancelled = false;
    let frame = 0;
    let stream: MediaStream | null = null;

    const cleanup = () => {
      cancelled = true;
      if (frame) cancelAnimationFrame(frame);
      stream?.getTracks().forEach((track) => track.stop());
      stream = null;
    };
    stopRef.current = cleanup;

    const tick = () => {
      if (cancelled) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video && canvas && video.readyState >= video.HAVE_ENOUGH_DATA) {
        const width = video.videoWidth;
        const height = video.videoHeight;
        if (width && height) {
          canvas.width = width;
          canvas.height = height;
          const context = canvas.getContext('2d', { willReadFrequently: true });
          if (context) {
            context.drawImage(video, 0, 0, width, height);
            const image = context.getImageData(0, 0, width, height);
            const code = jsQR(image.data, image.width, image.height, {
              inversionAttempts: 'dontInvert',
            });
            if (code?.data) {
              onTokenRef.current(code.data);
              cleanup();
              return;
            }
          }
        }
      }
      frame = requestAnimationFrame(tick);
    };

    const start = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError('This browser cannot open a camera. Paste the pass token instead.');
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          await video.play();
          setReady(true);
          frame = requestAnimationFrame(tick);
        }
      } catch {
        setError('Camera permission was denied or no camera is available. Paste the pass token instead.');
      }
    };

    void start();
    return cleanup;
  }, []);

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-950 p-3 text-slate-200">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs font-bold">
          <Camera className="h-4 w-4 text-emerald-400" />
          Scan the farmer&apos;s QR pass
        </span>
        <button
          type="button"
          onClick={() => {
            stop();
            onClose();
          }}
          className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-100"
          aria-label="Close QR scanner"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="relative overflow-hidden rounded-lg bg-black">
        <video ref={videoRef} playsInline muted className="mx-auto max-h-64 w-full object-cover" />
        {!ready && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-xs text-slate-300">
            <Loader2 className="h-5 w-5 animate-spin" />
            Opening camera…
          </div>
        )}
        {ready && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-40 w-40 rounded-xl border-2 border-emerald-400/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.25)]" />
          </div>
        )}
      </div>
      <canvas ref={canvasRef} className="hidden" />

      {error && (
        <p className="mt-2 flex items-start gap-1.5 text-[11px] text-rose-300">
          <CameraOff className="mt-0.5 h-3.5 w-3.5 flex-none" />
          {error}
        </p>
      )}
      <p className="mt-2 text-[10px] text-slate-400">
        Point the camera at the QR on the farmer&apos;s phone. It scans automatically.
      </p>
    </div>
  );
}
