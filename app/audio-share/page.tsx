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

      const duration = 0.02; // Reduced from 0.1 to 0.02 seconds per bit
      const freqHigh = 2000; // Increased frequency separation for better detection
      const freqLow = 1000;

      const binaryData = textToBinary(message);

      // Add start marker frequency
      const startMarker = audioContext.current.createOscillator();
      const startGain = audioContext.current.createGain();
      startMarker.connect(startGain);
      startGain.connect(audioContext.current.destination);
      startMarker.frequency.value = 2500; // Start marker frequency
      startMarker.start(audioContext.current.currentTime);
      startMarker.stop(audioContext.current.currentTime + duration);

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

    // Find the dominant frequency
    let maxIndex = 0;
    let maxValue = 0;
    for (let i = 0; i < bufferLength; i++) {
      if (dataArray[i] > maxValue) {
        maxValue = dataArray[i];
        maxIndex = i;
      }
    }

    // Convert index to frequency
    const sampleRate = audioContext.current!.sampleRate;
    const frequency = (maxIndex * sampleRate) / analyser.current.fftSize;

    // Decode frequencies
    if (maxValue > 128) {
      // Threshold for detection
      if (Math.abs(frequency - 2500) < 100) {
        // Start marker detected
        setReceivedMessage("Starting to receive message...");
      } else if (Math.abs(frequency - 2000) < 100) {
        // High frequency detected (1)
        setReceivedMessage((prev) => prev + "1");
      } else if (Math.abs(frequency - 1000) < 100) {
        // Low frequency detected (0)
        setReceivedMessage((prev) => prev + "0");
      }
    }

    requestAnimationFrame(processAudioData);
  };

  // Add this helper function to convert binary back to text
  const binaryToText = (binary: string) => {
    const bytes = binary.match(/.{1,8}/g) || [];
    return bytes.map((byte) => String.fromCharCode(parseInt(byte, 2))).join("");
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
            <div className="p-4 border rounded-lg space-y-2">
              <p className="font-mono text-sm text-gray-600">
                Binary: {receivedMessage}
              </p>
              <p className="font-mono">
                Decoded:{" "}
                {binaryToText(
                  receivedMessage.replace("Starting to receive message...", "")
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default AudioShare;
