"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

function AudioShare() {
  const [message, setMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [receivedMessage, setReceivedMessage] = useState("");
  const audioContext = useRef<AudioContext | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const { toast } = useToast();

  // Convert text to binary
  const textToBinary = (text: string) => {
    return text
      .split("")
      .map((char) => char.charCodeAt(0).toString(2).padStart(8, "0"))
      .join("");
  };

  const sendMessage = async () => {
    try {
      if (!audioContext.current) {
        audioContext.current = new AudioContext();
      }

      const duration = 0.1; // Duration of each bit in seconds
      const freqHigh = 1200; // Frequency for 1
      const freqLow = 600; // Frequency for 0

      const binaryData = textToBinary(message);

      // Create oscillator for each bit
      for (let i = 0; i < binaryData.length; i++) {
        const oscillator = audioContext.current.createOscillator();
        const gainNode = audioContext.current.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.current.destination);

        oscillator.frequency.value = binaryData[i] === "1" ? freqHigh : freqLow;

        oscillator.start(audioContext.current.currentTime + i * duration);
        oscillator.stop(audioContext.current.currentTime + (i + 1) * duration);
      }

      toast({
        title: "Sending message",
        description: "Playing audio signal...",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to send audio message",
        variant: "destructive",
      });
    }
  };

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      if (!audioContext.current) {
        audioContext.current = new AudioContext();
      }

      const source = audioContext.current.createMediaStreamSource(stream);
      analyser.current = audioContext.current.createAnalyser();
      analyser.current.fftSize = 2048;

      source.connect(analyser.current);

      setIsListening(true);
      processAudioData();
    } catch {
      toast({
        title: "Error",
        description: "Failed to access microphone",
        variant: "destructive",
      });
    }
  };

  const processAudioData = () => {
    if (!analyser.current || !isListening) return;

    const bufferLength = analyser.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.current.getByteFrequencyData(dataArray);

    // Process the frequencies and update receivedMessage
    // This is where we'll implement the actual decoding logic
    setReceivedMessage("Listening for audio signals...");

    requestAnimationFrame(processAudioData);
  };

  return (
    <main className="min-h-screen p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Audio Data Transfer</h1>

      <div className="space-y-8">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Send Message</h2>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message here..."
            className="min-h-[100px]"
          />
          <Button onClick={sendMessage}>Send via Audio</Button>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Receive Message</h2>
          <Button
            onClick={() =>
              isListening ? setIsListening(false) : startListening()
            }
            variant={isListening ? "destructive" : "default"}
          >
            {isListening ? "Stop Listening" : "Start Listening"}
          </Button>

          {receivedMessage && (
            <div className="p-4 border rounded-lg">
              <p className="font-mono">{receivedMessage}</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default AudioShare;
