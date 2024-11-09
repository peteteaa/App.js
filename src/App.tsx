import React, { useState } from "react";
import "./styles.css";

// Define prop types for Home and About components
interface HomeProps {
  showAbout: () => void;
  mode: string;
  toggleMode: () => void;
}

interface AboutProps {
  goBack: () => void;
  mode: string;
  toggleMode: () => void;
}

// Home Component
function Home({ showAbout, mode, toggleMode }: HomeProps) {
  return (
    <div className="App">
      <h1>{mode === "formal" ? "Welcome to VocAI" : "Hey there! Welcome to VocAI"}</h1>
      <p>{mode === "formal" ? "How may I assist you today?" : "How can I help you out today?"}</p>
      <ModeToggle mode={mode} toggleMode={toggleMode} />
      <Button onClick={showAbout} text="Go to About" />
    </div>
  );
}

// About Component
function About({ goBack, mode, toggleMode }: AboutProps) {
  return (
    <div className="App">
      <h1>{mode === "formal" ? "About VocAI" : "About Us at VocAI"}</h1>
      <p>
        {mode === "formal"
          ? "Here is some information about the application and its features."
          : "Here’s what our app can do for you!"}
      </p>
      <ModeToggle mode={mode} toggleMode={toggleMode} />
      <GoBack onClick={goBack} />
    </div>
  );
}

// Button for navigation
function Button({ onClick, text }: { onClick: () => void; text: string }) {
  return <button className="square" onClick={onClick}>{text}</button>;
}

// GoBack Button to navigate back to Home
function GoBack({ onClick }: { onClick: () => void }) {
  return (
    <button className="square" onClick={onClick}>
      Go Back?
    </button>
  );
}

// Toggle switch component
function ModeToggle({ mode, toggleMode }: { mode: string; toggleMode: () => void }) {
  return (
    <div className="mode-toggle">
      <label className="switch">
        <input type="checkbox" onChange={toggleMode} checked={mode === "casual"} />
        <span className="slider"></span>
      </label>
      <p>{mode === "formal" ? "Formal Mode" : "Casual Mode"}</p>
    </div>
  );
}

export default function App() {
  // State to determine which page to show
  const [showAboutPage, setShowAboutPage] = useState(false);

  // State to determine mode (formal or casual)
  const [mode, setMode] = useState("formal");

  // Toggle mode between formal and casual
  const toggleMode = () => setMode((prevMode) => (prevMode === "formal" ? "casual" : "formal"));

  return (
    <div className="App">
      {showAboutPage ? (
        <About goBack={() => setShowAboutPage(false)} mode={mode} toggleMode={toggleMode} />
      ) : (
        <Home showAbout={() => setShowAboutPage(true)} mode={mode} toggleMode={toggleMode} />
      )}
    </div>
  );
}
