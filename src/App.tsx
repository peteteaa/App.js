import React, { useState } from "react";
import "./styles.css";

// Define prop types for Home, About, and Contact components
interface HomeProps {
  showAbout: () => void;
  showContact: () => void;
  mode: string;
  toggleMode: () => void;
}

interface AboutProps {
  goBack: () => void;
  mode: string;
  toggleMode: () => void;
}

interface ContactProps {
  goBack: () => void;
}

// Home Component
function Home({ showAbout, showContact, mode, toggleMode }: HomeProps) {
  return (
    <div className="App">
      <h1>
        {mode === "formal" ? "Welcome to VocAI" : "Hey there! Welcome to VocAI"}
      </h1>
      <p>
        {mode === "formal"
          ? "How may I assist you today?"
          : "How can I help you out today?"}
      </p>
      <ModeToggle mode={mode} toggleMode={toggleMode} />
      <Button onClick={showContact} text="Start" />
      <Button onClick={showAbout} text=" About" />
    </div>
  );
}

// About Component
function About({ goBack, mode, toggleMode }: AboutProps) {
  return (
    <div className="App">
      <h1>{mode === "formal" ? "About VocAI" : "About Us at VocAI"}</h1>
      <h2 className="about-h2">
        {mode === "formal"
          ? "Here is some information about the application and its features."
          : "Here’s what our app can do for you!"}
      </h2>
      <p className="about-paragraph">
        {mode === "formal"
          ? "Our AI-powered web app is designed to generate customized scripts based on user prompts, allowing for a variety of writing styles and tones. It not only creates the script but also analyzes the delivery to determine whether it aligns more with a casual or formal presentation style. Our program also scores users based off levels of tonality, pitch and intonation. This feature helps users understand how different tones can impact the effectiveness and suitability of the script for different contexts, whether it’s for a professional setting, informal conversation, or anything in between."
          : "Our AI-powered app is built to help you generate custom scripts based on your prompts, giving you a range of writing styles and tones to choose from. Not only does it create the script, but it also checks how it reads — figuring out if it sounds more casual or formal. This lets you see how different tones can change the feel and impact of your script, whether you’re using it for a work setting, a casual chat, or anything in between."}
      </p>
      <ModeToggle mode={mode} toggleMode={toggleMode} />
      <GoBack onClick={goBack} />
    </div>
  );
}

// Contact Component with a text box

// Button for navigation
function Button({ onClick, text }: { onClick: () => void; text: string }) {
  return (
    <button className="square" onClick={onClick}>
      {text}
    </button>
  );
}

// GoBack Button to navigate back to Home

// Toggle switch component
function ModeToggle({
  mode,
  toggleMode,
}: {
  mode: string;
  toggleMode: () => void;
}) {
  return (
    <div className="mode-toggle">
      <label className="switch">
        <input
          type="checkbox"
          onChange={toggleMode}
          checked={mode === "casual"}
        />
        <span className="slider"></span>
      </label>
      <p>{mode === "formal" ? "Formal Mode" : "Casual Mode"}</p>
    </div>
  );
}

export default function App() {
  // State to determine which page to show
  const [page, setPage] = useState("home");

  // State to determine mode (formal or casual)
  const [mode, setMode] = useState("formal"); //where formal/casual will be stored

  // Toggle mode between formal and casual
  const toggleMode = () =>
    setMode((prevMode) => (prevMode === "formal" ? "casual" : "formal"));

  return (
    <div className="App">
      {page === "about" && (
        <About
          goBack={() => setPage("home")}
          mode={mode}
          toggleMode={toggleMode}
        />
      )}
      {page === "contact" && <Contact goBack={() => setPage("home")} />}
      {page === "home" && (
        <Home
          showAbout={() => setPage("about")}
          showContact={() => setPage("contact")}
          mode={mode}
          toggleMode={toggleMode}
        />
      )}
    </div>
  );
}

// Define prop types for Contact Component
interface ContactProps {
  goBack: () => void;
}

// Contact Component with a text box and message submission
function Contact({ goBack }: ContactProps) {
  const [message, setMessage] = useState(""); // State to store the message
  const [submitted, setSubmitted] = useState(false); // Track whether the message has been submitted

  const handleSubmit = () => {
    if (message.trim() !== "") {
      setSubmitted(true); // If the message is not empty, show the MessagePage
    }
  };

  return (
    <div className="App">
      {!submitted ? (
        // Show the text box and submit button if the message is not submitted yet
        <>
          <h1>Prompt</h1>
          <p>Please enter a script prompt below:</p>
          <textarea
            className="text-box"
            placeholder="....type a couple words"
            value={message}
            onChange={(e) => setMessage(e.target.value)} // Update message state on text change
          />
          <button className="square" onClick={handleSubmit}>
            Submit
          </button>
        </>
      ) : (
        // Show the MessagePage after the message is submitted
        <MessagePage message={message} goBack={goBack} />
      )}
      <GoBack onClick={goBack} />
    </div>
  );
}

// MessagePage component to display the message after submission
function MessagePage({
  message,
  goBack,
}: {
  message: string;
  goBack: () => void;
}) {
  return (
    <div className="App">
      <h1>Message Received</h1>
      <p>Your entered prompt:</p>
      <div className="message-box">{message}</div>
      <GoBack onClick={goBack} />
    </div>
  );
}

// GoBack Button to navigate back to the Home page
function GoBack({ onClick }: { onClick: () => void }) {
  return (
    <button className="square" onClick={onClick}>
      Go Back
    </button>
  );
}
