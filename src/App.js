import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MindMap from "./MindMap";
import TypingPractice from "./TypingPractice";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MindMap />} />
        <Route path="/typing-practice" element={<TypingPractice />} />
      </Routes>
    </Router>
  );
}

export default App;

