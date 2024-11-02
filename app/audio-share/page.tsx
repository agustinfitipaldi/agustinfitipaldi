"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const AudioShare = () => {
  const [message, setMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [receivedMessage, setReceivedMessage] = useState("");
  const sendAudioContext = useRef<AudioContext | null>(null);
  const receiveAudioContext = useRef<AudioContext | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const { toast } = useToast();
  const [currentFrequency, setCurrentFrequency] = useState<number>(0);
  const [currentAmplitude, setCurrentAmplitude] = useState<number>(0);
  const [detectionStatus, setDetectionStatus] = useState<string>("Idle");
  const [binaryBuffer, setBinaryBuffer] = useState<string>("");

  // Helper function to convert text to binary
  const textToBinary = (text: string): string => {
    return text
      .split("")
      .map((char) => char.charCodeAt(0).toString(2).padStart(8, "0"))
      .join("");
  };

  // Helper function to convert binary to text
  const binaryToText = (binary: string): string => {
    const bytes = binary.match(/.{1,8}/g) || [];
    return bytes.map((byte) => String.fromCharCode(parseInt(byte, 2))).join("");
  };

  // Initialize Audio Context for Sending
  const initializeSendAudio = async () => {
    if (!sendAudioContext.current) {
      sendAudioContext.current = new AudioContext();
    }

    if (sendAudioContext.current.state === "suspended") {
      await sendAudioContext.current.resume();
    }
  };

  // Initialize Audio Context for Receiving
  const initializeReceiveAudio = async (stream: MediaStream) => {
    if (!receiveAudioContext.current) {
      receiveAudioContext.current = new AudioContext();
    }

    if (receiveAudioContext.current.state === "suspended") {
      await receiveAudioContext.current.resume();
    }

    const source = receiveAudioContext.current.createMediaStreamSource(stream);
    analyser.current = receiveAudioContext.current.createAnalyser();
    analyser.current.fftSize = 2048;
    analyser.current.minDecibels = -90;
    analyser.current.maxDecibels = -10;
    analyser.current.smoothingTimeConstant = 0.85;

    source.connect(analyser.current);

    dataArrayRef.current = new Uint8Array(analyser.current.frequencyBinCount);
  };

  // Send Message via Audio
  const sendMessage = async () => {
    if (!message) {
      toast({
        title: "No Message",
        description: "Please enter a message to send.",
        variant: "default",
      });
      return;
    }

    try {
      await initializeSendAudio();

      const durationPerBit = 0.05; // 50ms per bit
      const freqHigh = 2000;
      const freqLow = 1000;
      const startFreq = 2500;
      const pauseDuration = 0.1; // 100ms pause after message

      const binaryData = textToBinary(message);
      const totalDuration =
        durationPerBit * binaryData.length + pauseDuration + durationPerBit;

      // Schedule Start Marker
      const startMarker = sendAudioContext.current!.createOscillator();
      const startGain = sendAudioContext.current!.createGain();
      startGain.gain.value = 0.5;
      startMarker.connect(startGain);
      startGain.connect(sendAudioContext.current!.destination);
      startMarker.frequency.value = startFreq;
      startMarker.start();
      startMarker.stop(totalDuration);

      // Schedule Bits
      binaryData.split("").forEach((bit, index) => {
        const oscillator = sendAudioContext.current!.createOscillator();
        const gainNode = sendAudioContext.current!.createGain();
        gainNode.gain.value = 0.5;

        oscillator.connect(gainNode);
        gainNode.connect(sendAudioContext.current!.destination);

        oscillator.frequency.value = bit === "1" ? freqHigh : freqLow;
        oscillator.start(index * durationPerBit);
        oscillator.stop((index + 1) * durationPerBit);
      });

      toast({
        title: "Sending Message",
        description: "Your message is being transmitted via audio.",
      });

      // Optional: Stop the audio context after transmission
      setTimeout(() => {
        sendAudioContext.current?.close();
        sendAudioContext.current = null;
      }, (totalDuration + 1) * 1000); // Adding buffer
    } catch (error) {
      console.error("Send Message Error:", error);
      toast({
        title: "Error",
        description: "Failed to send audio message.",
        variant: "destructive",
      });
    }
  };

  // Start Listening for Incoming Audio
  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      await initializeReceiveAudio(stream);
      setIsListening(true);
      processAudioData();
      toast({
        title: "Listening",
        description: "Started listening for incoming messages.",
      });
    } catch (error) {
      console.error("Start Listening Error:", error);
      toast({
        title: "Error",
        description: "Failed to access microphone.",
        variant: "destructive",
      });
    }
  };

  // Stop Listening
  const stopListening = () => {
    if (receiveAudioContext.current) {
      receiveAudioContext.current.close();
      receiveAudioContext.current = null;
    }
    setIsListening(false);
    toast({
      title: "Stopped Listening",
      description: "Stopped listening for incoming messages.",
    });
  };

  // Process Audio Data in Real-Time
  const processAudioData = () => {
    if (!analyser.current || !dataArrayRef.current) return;

    analyser.current.getByteFrequencyData(dataArrayRef.current);

    // Find the dominant frequency
    let maxIndex = 0;
    let maxValue = 0;
    dataArrayRef.current.forEach((value, index) => {
      if (value > maxValue) {
        maxValue = value;
        maxIndex = index;
      }
    });

    const sampleRate = receiveAudioContext.current!.sampleRate;
    const frequency = (maxIndex * sampleRate) / analyser.current!.fftSize;

    setCurrentFrequency(frequency);
    setCurrentAmplitude(maxValue);
    setDetectionStatus(
      `Frequency Detected: ${frequency} Hz, Amplitude: ${maxValue}`
    );

    // Detect Start Marker
    if (frequency >= 2450 && frequency <= 2550 && maxValue > 150) {
      setBinaryBuffer("");
      setReceivedMessage("");
      setDetectionStatus("Start Marker Detected. Receiving message...");
      return;
    }

    // Decode Bits based on Frequency
    if (frequency >= 1950 && frequency <= 2050) {
      // Bit '1'
      setBinaryBuffer((prev) => prev + "1");
    } else if (frequency >= 950 && frequency <= 1050) {
      // Bit '0'
      setBinaryBuffer((prev) => prev + "0");
    }

    // Simple Decoding Logic (to be improved based on actual signal)
    if (binaryBuffer.length >= 8) {
      const lastEightBits = binaryBuffer.slice(-8);
      const decodedChar = binaryToText(lastEightBits);
      if (decodedChar) {
        setReceivedMessage((prev) => prev + decodedChar);
        setBinaryBuffer("");
      }
    }

    if (isListening) {
      requestAnimationFrame(processAudioData);
    }
  };

  // Cleanup on Component Unmount
  useEffect(() => {
    return () => {
      if (sendAudioContext.current) {
        sendAudioContext.current.close();
      }
      if (receiveAudioContext.current) {
        receiveAudioContext.current.close();
      }
    };
  }, []);

  return (
    <main className="min-h-screen p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Audio Data Transfer</h1>

      <div className="space-y-8">
        {/* Send Message Section */}
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

        {/* Receive Message Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Receive Message</h2>
          <Button
            onClick={() => (isListening ? stopListening() : startListening())}
            variant={isListening ? "destructive" : "default"}
          >
            {isListening ? "Stop Listening" : "Start Listening"}
          </Button>

          {isListening && (
            <div className="p-4 border rounded-lg space-y-2 bg-gray-50">
              <h3 className="font-semibold">Live Detection Stats:</h3>
              <div className="space-y-1 font-mono text-sm">
                <p>Frequency: {currentFrequency.toFixed(2)} Hz</p>
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
                Binary:{" "}
                {receivedMessage
                  .split("")
                  .map((char) =>
                    char.charCodeAt(0).toString(2).padStart(8, "0")
                  )
                  .join(" ")}
              </p>
              <p className="font-mono">Decoded: {receivedMessage}</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default AudioShare;
