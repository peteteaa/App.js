import React, { useState } from "react";
import "./styles.css";

// Home Component
function Home({ showAbout }) {
  return (
    <div className="App">
      <h1>Welcome to VocAI</h1>
      <p>How can I help you today?</p>
      <Button onClick={showAbout} />
    </div>
  );
}

// About Component
function About({ goBack }) {
  return (
    <div className="App">
      <h1>About VocAI</h1>
      <p>Here is some information about the app.</p>
     {/* Call goBack when button is clicked */}
    </div>
  );
}

// Button for navigation
function Button({ onClick }) {
  return <button className="square" onClick={onClick}>Go to About</button>;
}

// goBack Button to navigate back to Home
function goBack({ onClick }) {
  return <button className="square" onClick={onClick}>Go Back?</button>;
}

export default function App() {
  // State to determine which page to show
  const [showAboutPage, setShowAboutPage] = useState(false);

  // Function to show About page
  const showAbout = () => setShowAboutPage(true);

  // Function to go back to Home page
  const goBackToHome = () => setShowAboutPage(false);

  return (
    <div className="App">
      {showAboutPage ? <About goBack={goBackToHome} /> : <Home showAbout={showAbout} />}
    </div>
  );
}
