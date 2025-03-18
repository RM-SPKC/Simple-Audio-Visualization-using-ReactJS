import React, { useState, useEffect, useRef } from "react";

function Visualizer() {
  const [freqs, setFreqs] = useState(new Array(42).fill(0)); // Frequency data
  const audioRef = useRef(null); // Reference for the audio element
  const audioContextRef = useRef(null); // Reference for AudioContext
  const analyserRef = useRef(null); // Reference for AnalyserNode

  useEffect(() => {
    // Initialize AudioContext and AnalyserNode only once
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    analyserRef.current = audioContextRef.current.createAnalyser();
    analyserRef.current.fftSize = 64; // Frequency size
    const data = new Uint8Array(analyserRef.current.frequencyBinCount);

    // Create and set up audio element
    audioRef.current = new Audio("/music.mp3"); // Replace with MP3 path
    audioRef.current.loop = true; // Loop the audio

    // Wait for the audio element to be ready to play
    audioRef.current.oncanplaythrough = async () => {
      try {
        await audioRef.current.play(); // Start playing the audio
        console.log("Audio is playing!");
      } catch (err) {
        console.error("Error playing audio:", err);
      }
    };

    // Connect audio source to analyser and context
    const source = audioContextRef.current.createMediaElementSource(audioRef.current);
    source.connect(analyserRef.current);
    analyserRef.current.connect(audioContextRef.current.destination);

    // Update frequency data for visualization
    const update = () => {
      analyserRef.current.getByteFrequencyData(data);
      setFreqs([...data.slice(0, 42)]); // Show frequency data
      requestAnimationFrame(update); // Keep updating
    };

    update(); // Start updating

    // Cleanup on component unmount
    return () => {
      audioRef.current.pause();
      audioContextRef.current.close();
    };
  }, []);

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Audio Visualization</h2>
      <div style={styles.square}>
        {freqs.map((v, i) => (
          <div key={i} style={{ ...styles.bar, height: `${v}px` }} />
        ))}
      </div>
    </div>
  );
}

const styles = {
  heading: { position: "absolute", top: "20px", color: "maroon" },
  container: { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "white", flexDirection: "column" },
  square: { display: "flex", justifyContent: "center", alignItems: "flex-end", gap: "5px", width: "600px", height: "400px", background: "#ddd", padding: "10px", borderRadius: "20px" },
  bar: { width: "6px", background: "maroon", borderRadius: "5px", transition: "height 0.1s" },
};

export default Visualizer;
