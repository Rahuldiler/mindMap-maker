import React, { useState, useEffect, useRef } from "react";
import "./typing-practice.css";
const TypingPractice = () => {

  const longPracticeTexts = [
    `The concept of digital literacy has evolved significantly over the past few decades. Initially, it referred simply to the ability to use a computer and basic software applications. Today, it encompasses a broad range of skills and knowledge that enable individuals to navigate, evaluate, and create content in a digital environment. This includes understanding privacy settings, recognizing misinformation, creating multimedia content, and engaging in online communities responsibly. As our world becomes increasingly digitized, these skills are no longer optional but essential for full participation in society.`,
  ];

  // States
  const [text, setText] = useState("");
  const [userInput, setUserInput] = useState("");
  const [timer, setTimer] = useState(0);
  const [isActive, setIsActive] = useState(true); // Timer starts immediately
  const [startTime, setStartTime] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [cpm, setCpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [errors, setErrors] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [completed, setCompleted] = useState(false);
  const inputRef = useRef(null);

  // Get a random text
  const getRandomText = () => {
    // In a production app, this would fetch from an API
    // For demo purposes, using the sample texts
    const randomIndex = Math.floor(Math.random() * longPracticeTexts.length);
    return longPracticeTexts[randomIndex];
  };

  // Initialize with a random text and start timer
  useEffect(() => {
    setText(getRandomText());
    setStartTime(Date.now());
  }, []);

  // Timer effect
  useEffect(() => {
    let interval = null;

    if (isActive) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1);

        // Update WPM and CPM in real-time even if not typing
        const timeElapsed = (Date.now() - startTime) / 1000 / 60; // in minutes
        if (timeElapsed > 0 && userInput.length > 0) {
          const wordsTyped = userInput.trim().split(/\s+/).length;
          const charsTyped = userInput.length;

          setWpm((wordsTyped / timeElapsed).toFixed(2));
          setCpm((charsTyped / timeElapsed).toFixed(2));
        }
      }, 1000);
    } else if (!isActive && timer !== 0) {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isActive, timer, startTime, userInput]);

  // Calculate metrics in real-time
  useEffect(() => {
    if (userInput.length > 0) {
      // Calculate accuracy
      let errorCount = 0;
      for (let i = 0; i < userInput.length; i++) {
        if (userInput[i] !== text[i]) {
          errorCount++;
        }
      }
      setErrors(errorCount);
      const accuracyValue = Math.max(
        0,
        100 - (errorCount / userInput.length) * 100
      );
      setAccuracy(accuracyValue.toFixed(2));

      // Calculate typing speed in real-time
      const timeElapsed = (Date.now() - startTime) / 1000 / 60; // in minutes
      const wordsTyped = userInput.trim().split(/\s+/).length;
      const charsTyped = userInput.length;

      if (timeElapsed > 0) {
        setWpm((wordsTyped / timeElapsed).toFixed(2));
        setCpm((charsTyped / timeElapsed).toFixed(2));
      }
    }
  }, [userInput, startTime, text]);

  // Check for completion
  useEffect(() => {
    if (userInput === text && text !== "") {
      setIsActive(false);
      setCompleted(true);
    }
  }, [userInput, text]);

  // Handle user input
  const handleInputChange = (e) => {
    const value = e.target.value;
    setUserInput(value);
    setCurrentCharIndex(value.length);
  };

  // Mark as done
  const handleDone = () => {
    setIsActive(false);
    setCompleted(true);
  };

  // Start new practice
  const handlePracticeMore = () => {
    setText(getRandomText());
    setUserInput("");
    setTimer(0);
    setIsActive(true);
    setStartTime(Date.now());
    setWpm(0);
    setCpm(0);
    setAccuracy(100);
    setErrors(0);
    setCurrentCharIndex(0);
    setCompleted(false);
    inputRef.current.focus();
  };

  // Format time (mm:ss)
  const formatTime = () => {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Render text with character highlighting
  const renderText = () => {
    return text.split("").map((char, index) => {
      let charClass = "";

      if (index < userInput.length) {
        if (char === userInput[index]) {
          charClass = "correct-char";
        } else {
          charClass = "incorrect-char";
        }
      }

      if (index === currentCharIndex) {
        charClass += " current-char";
      }

      return (
        <span key={index} className={charClass}>
          {char}
        </span>
      );
    });
  };
  // Calculate progress percentage
  const progressPercentage = Math.min(
    100,
    (userInput.length / text.length) * 100
  );

  return (
    <div className="typing-practice-container">
      <div className="w-full max-w-4xl">
        <h1 className="typing-practice-title">Typing Practice</h1>

        {/* Timer and Metrics */}
        <div className="metrics-container">
          <div className="metrics-grid">
            <div className="metrics-item">
              <div className="metrics-value">{formatTime()}</div>
              <div className="metrics-label">Time</div>
            </div>
            <div className="metrics-item">
              <div className="metrics-value">{wpm}</div>
              <div className="metrics-label">WPM</div>
            </div>
            <div className="metrics-item">
              <div className="metrics-value">{cpm}</div>
              <div className="metrics-label">CPM</div>
            </div>
            <div className="metrics-item">
              <div className="metrics-value">{accuracy}%</div>
              <div className="metrics-label">Accuracy</div>
            </div>
            <div className="metrics-item">
              <div className="metrics-value">{errors}</div>
              <div className="metrics-label">Errors</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="progress-bar">
            <div
              className="progress-bar-fill"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="progress-text">
            {Math.floor(progressPercentage)}% completed
          </div>
        </div>

        {/* Practice Text */}
        <div className="practice-text-container">
          <div className="practice-text">{renderText()}</div>
        </div>

        {/* User Input */}
        <div className="w-full mb-4 md:mb-8">
          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={handleInputChange}
            placeholder="Start typing here..."
            className="user-input"
            disabled={completed}
            autoFocus
          />
        </div>

        {/* Controls */}
        <div className="flex justify-center">
          {!completed ? (
            <button onClick={handleDone} className="btn-done">
              Done
            </button>
          ) : (
            <div className="space-y-4 md:space-y-0 md:space-x-4 flex flex-col md:flex-row items-center">
              <div className="results-container">
                <h3 className="results-title">Session Results</h3>
                <p>Time: {formatTime()}</p>
                <p>Speed: {wpm} WPM</p>
                <p>Accuracy: {accuracy}%</p>
              </div>
              <button
                onClick={handlePracticeMore}
                className="btn-practice-more"
              >
                Practice More
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TypingPractice;
