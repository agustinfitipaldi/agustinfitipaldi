"use client";

import { useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

const MicrophoneTest = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const visualize = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        toast({
          title: "Microphone Access Granted",
          description: "Microphone is working correctly.",
          variant: "default",
        });

        const audioContext = new (window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext)();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        source.connect(analyser);
        const bufferLength = analyser.fftSize;
        const dataArray = new Uint8Array(bufferLength);

        const canvas = canvasRef.current;
        if (!canvas) return;
        const canvasCtx = canvas.getContext("2d");
        if (!canvasCtx) return;

        const draw = () => {
          requestAnimationFrame(draw);

          analyser.getByteTimeDomainData(dataArray);

          canvasCtx.fillStyle = "rgb(200, 200, 200)";
          canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

          canvasCtx.lineWidth = 2;
          canvasCtx.strokeStyle = "rgb(0, 0, 0)";

          canvasCtx.beginPath();

          const sliceWidth = (canvas.width * 1.0) / bufferLength;
          let x = 0;

          for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0;
            const y = (v * canvas.height) / 2;

            if (i === 0) {
              canvasCtx.moveTo(x, y);
            } else {
              canvasCtx.lineTo(x, y);
            }

            x += sliceWidth;
          }

          canvasCtx.lineTo(canvas.width, canvas.height / 2);
          canvasCtx.stroke();
        };

        draw();
      } catch (error) {
        console.error("Microphone Access Error:", error);
        toast({
          title: "Microphone Access Denied",
          description: "Please allow microphone access.",
          variant: "destructive",
        });
      }
    };

    visualize();
  }, [toast]);

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-xl font-semibold mb-4">Microphone Test</h2>
      <canvas
        ref={canvasRef}
        width="600"
        height="200"
        className="border"
      ></canvas>
    </div>
  );
};

export default MicrophoneTest;
