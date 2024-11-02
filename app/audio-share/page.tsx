"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

function AudioShare() {
  const [message, setMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [receivedMessage, setReceivedMessage] = useState("");
  const sendAudioContext = useRef<AudioContext | null>(null);
  const receiveAudioContext = useRef<AudioContext | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const { toast } = useToast();
  const [currentFrequency, setCurrentFrequency] = useState<number>(0);
  const [currentAmplitude, setCurrentAmplitude] = useState<number>(0);
  const [detectionStatus, setDetectionStatus] = useState<string>("Idle");

  // Convert text to binary
  const textToBinary = (text: string) => {
    return text
      .split("")
      .map((char) => char.charCodeAt(0).toString(2).padStart(8, "0"))
      .join("");
  };

  const sendMessage = async () => {
    try {
      if (!sendAudioContext.current) {
        sendAudioContext.current = new AudioContext();
      }

      if (sendAudioContext.current.state === "suspended") {
        await sendAudioContext.current.resume();
      }

      const duration = 0.02; // Reduced from 0.1 to 0.02 seconds per bit
      const freqHigh = 2000; // Increased frequency separation for better detection
      const freqLow = 1000;

      const binaryData = textToBinary(message);

      // Add start marker frequency
      const startMarker = sendAudioContext.current.createOscillator();
      const startGain = sendAudioContext.current.createGain();
      startGain.gain.value = 0.5;
      startMarker.connect(startGain);
      startGain.connect(sendAudioContext.current.destination);
      startMarker.frequency.value = 2500; // Start marker frequency
      startMarker.start(sendAudioContext.current.currentTime);
      startMarker.stop(sendAudioContext.current.currentTime + duration);

      // Create oscillator for each bit
      for (let i = 0; i < binaryData.length; i++) {
        const oscillator = sendAudioContext.current.createOscillator();
        const gainNode = sendAudioContext.current.createGain();
        gainNode.gain.value = 0.5;

        oscillator.connect(gainNode);
        gainNode.connect(sendAudioContext.current.destination);

        oscillator.frequency.value = binaryData[i] === "1" ? freqHigh : freqLow;

        oscillator.start(sendAudioContext.current.currentTime + i * duration);
        oscillator.stop(
          sendAudioContext.current.currentTime + (i + 1) * duration
        );
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

      if (!receiveAudioContext.current) {
        receiveAudioContext.current = new AudioContext();
      }

      if (receiveAudioContext.current.state === "suspended") {
        await receiveAudioContext.current.resume();
      }

      const source =
        receiveAudioContext.current.createMediaStreamSource(stream);
      analyser.current = receiveAudioContext.current.createAnalyser();
      analyser.current.fftSize = 2048;
      analyser.current.minDecibels = -90;
      analyser.current.maxDecibels = -10;
      analyser.current.smoothingTimeConstant = 0.85;

      source.connect(analyser.current);
      // Add this line to connect to destination (might help with debugging)
      // analyser.current.connect(receiveAudioContext.current.destination);

      console.log("Audio input setup complete", {
        sampleRate: receiveAudioContext.current.sampleRate,
        fftSize: analyser.current.fftSize,
        minDecibels: analyser.current.minDecibels,
        maxDecibels: analyser.current.maxDecibels,
      });

      setIsListening(true);
      processAudioData();
    } catch (error) {
      console.error("Microphone access error:", error);
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
    const timeData = new Uint8Array(bufferLength);

    analyser.current.getByteTimeDomainData(timeData);
    analyser.current.getByteFrequencyData(dataArray);

    // Debug raw data
    const sum = dataArray.reduce((a, b) => a + b, 0);
    const average = sum / bufferLength;

    console.log("Raw Audio Data:", {
      averageAmplitude: average,
      someTimeData: Array.from(timeData.slice(0, 5)),
      someFreqData: Array.from(dataArray.slice(0, 5)),
    });

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
    const sampleRate = receiveAudioContext.current!.sampleRate;
    const frequency = (maxIndex * sampleRate) / analyser.current.fftSize;

    // Update state less frequently to reduce UI updates
    setCurrentFrequency(Math.round(frequency));
    setCurrentAmplitude(maxValue);
    setDetectionStatus(`Raw Data: Avg=${average.toFixed(2)}, Max=${maxValue}`);

    // Example: Update receivedMessage when a specific frequency is detected
    if (frequency === 2500) {
      // Replace with your start marker frequency or condition
      setReceivedMessage("Starting to receive message...");
    }

    requestAnimationFrame(processAudioData);
  };

  // Add this helper function to convert binary back to text
  const binaryToText = (binary: string) => {
    const bytes = binary.match(/.{1,8}/g) || [];
    return bytes.map((byte) => String.fromCharCode(parseInt(byte, 2))).join("");
  };

  // Add this function near your other functions
  const playTestTone = () => {
    if (!sendAudioContext.current) {
      sendAudioContext.current = new AudioContext();
    }

    const oscillator = sendAudioContext.current.createOscillator();
    const gainNode = sendAudioContext.current.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(sendAudioContext.current.destination);

    oscillator.frequency.value = 2000; // Test frequency
    gainNode.gain.value = 0.2; // Increased gain for testing

    oscillator.start();
    setTimeout(() => oscillator.stop(), 1000); // Stop after 1 second
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

          <Button onClick={playTestTone} variant="secondary">
            Play Test Tone
          </Button>
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

          {isListening && (
            <div className="p-4 border rounded-lg space-y-2 bg-gray-50">
              <h3 className="font-semibold">Live Detection Stats:</h3>
              <div className="space-y-1 font-mono text-sm">
                <p>Frequency: {currentFrequency} Hz</p>
                <p>Amplitude: {currentAmplitude}</p>
                <p>Status: {detectionStatus}</p>
                <div className="w-full h-2 bg-gray-200 rounded">
                  <div
                    className="h-full bg-blue-500 rounded transition-all duration-100"
                    style={{ width: `${(currentAmplitude / 255) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )}

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
