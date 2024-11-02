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

  // Additional State for Visualization
  const [audioLevel, setAudioLevel] = useState<number>(0);

  // Helper function to convert text to binary
  const textToBinary = (text: string): string => {
    return text
      .split("")
      .map((char) => char.charCodeAt(0).toString(2).padStart(8, "0"))
      .join("");
  };

  // Helper function to convert binary to text
  //   const binaryToText = (binary: string): string => {
  //     const bytes = binary.match(/.{1,8}/g) || [];
  //     return bytes.map((byte) => String.fromCharCode(parseInt(byte, 2))).join("");
  //   };

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

    if (!analyser.current) {
      analyser.current = receiveAudioContext.current.createAnalyser();
      analyser.current.fftSize = 2048;
      const bufferLength = analyser.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);

      const source =
        receiveAudioContext.current.createMediaStreamSource(stream);
      source.connect(analyser.current);

      // **Visual Audio Level Meter Enhancement**
      const processor = receiveAudioContext.current.createScriptProcessor(
        2048,
        1,
        1
      );
      processor.onaudioprocess = () => {
        const dataArray = new Uint8Array(analyser.current!.frequencyBinCount);
        analyser.current!.getByteFrequencyData(dataArray);

        // Calculate average amplitude for visualization
        let sum = 0;
        dataArray.forEach((value) => {
          sum += value;
        });
        const avg = sum / dataArray.length;
        setAudioLevel(avg);
      };

      analyser.current.connect(processor);
      processor.connect(receiveAudioContext.current.destination);
    }
  };

  // Send Message Function
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

      const binaryData = textToBinary(message);
      const freqLow = 1100; // Frequency for bit '0'
      const freqHigh = 1700; // Frequency for bit '1'
      const durationPerBit = 0.2; // Increased duration per bit to 200ms
      const totalDuration = binaryData.length * durationPerBit;

      binaryData.split("").forEach((bit, index) => {
        const oscillator = sendAudioContext.current!.createOscillator();
        const gainNode = sendAudioContext.current!.createGain();
        gainNode.gain.value = 1.0; // Maximum gain without clipping

        oscillator.connect(gainNode);
        gainNode.connect(sendAudioContext.current!.destination);

        oscillator.frequency.value = bit === "1" ? freqHigh : freqLow;
        oscillator.start(index * durationPerBit + 0.05); // Slight delay
        oscillator.stop((index + 1) * durationPerBit + 0.05);
      });

      toast({
        title: "Sending Message",
        description: "Your message is being transmitted via audio.",
      });

      // Stop the audio context after transmission
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
    setDetectionStatus("Idle");
    setAudioLevel(0);
    toast({
      title: "Stopped Listening",
      description: "Stopped listening for incoming messages.",
    });
  };

  // Process Audio Data
  const processAudioData = () => {
    if (!analyser.current || !receiveAudioContext.current) return;

    analyser.current.getByteFrequencyData(dataArrayRef.current!);

    // Find the frequency with the highest amplitude
    let max = -Infinity;
    let index = -1;
    dataArrayRef.current!.forEach((value, i) => {
      if (value > max) {
        max = value;
        index = i;
      }
    });

    const nyquist = receiveAudioContext.current!.sampleRate / 2;
    const frequency = (index * nyquist) / analyser.current!.fftSize;

    setCurrentFrequency(frequency);
    setCurrentAmplitude(max);

    // Debugging: Log frequency data
    console.log("Frequency Data:", Array.from(dataArrayRef.current!));

    // Detect start marker
    if (frequency >= 2100 && frequency <= 2300 && max > 100) {
      setBinaryBuffer("");
      setReceivedMessage("");
      setDetectionStatus("Start Marker Detected. Receiving message...");
      return;
    }

    // Decode bits based on frequency ranges
    if (frequency >= 1700 && frequency <= 1900) {
      // Bit '1'
      setBinaryBuffer((prev) => prev + "1");
    } else if (frequency >= 1100 && frequency <= 1300) {
      // Bit '0'
      setBinaryBuffer((prev) => prev + "0");
    }

    // Update decoding status
    if (binaryBuffer.length > 0) {
      setDetectionStatus("Decoding...");
    }

    // Attempt to decode when a full byte is received
    if (binaryBuffer.length >= 8) {
      const byte = binaryBuffer.slice(0, 8);
      const remaining = binaryBuffer.slice(8);
      const char = String.fromCharCode(parseInt(byte, 2));
      setReceivedMessage((prev) => prev + char);
      setBinaryBuffer(remaining);
    }
  };

  // Initial Microphone Access Test
  useEffect(() => {
    const testMicrophone = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        toast({
          title: "Microphone Access",
          description: "Microphone is accessible.",
          variant: "default",
        });
        // **Handle Stream Properly**: Stop all tracks to release the microphone
        stream.getTracks().forEach((track) => track.stop());
      } catch (error) {
        console.error("Microphone Access Error:", error);
        toast({
          title: "Microphone Access Denied",
          description: "Please allow microphone access.",
          variant: "destructive",
        });
      }
    };

    testMicrophone();
  }, [toast]); // Added 'toast' to the dependency array

  // Effect to process audio data periodically
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isListening) {
      interval = setInterval(() => {
        processAudioData();
      }, 100); // Process audio every 100ms
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isListening, binaryBuffer]);

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
              {/* **Visual Audio Level Meter** */}
              <div className="w-full h-2 bg-green-200 rounded">
                <div
                  className="h-full bg-green-500 rounded transition-all duration-100"
                  style={{ width: `${(audioLevel / 255) * 100}%` }}
                />
              </div>
            </div>
          )}

          {receivedMessage && (
            <div className="p-4 border rounded-lg space-y-2">
              <h3 className="text-lg font-medium">Received Message:</h3>
              <Textarea
                value={receivedMessage}
                readOnly
                className="min-h-[100px] border p-2"
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default AudioShare;
