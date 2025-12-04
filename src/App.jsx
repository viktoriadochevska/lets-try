import React, { useState } from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import FramingStudyApp from "./FramingStudyApp.jsx";
import SurveyPage from "./SurveyPage.jsx";

export default function App() {
  const [participants, setParticipants] = useState([]);

  // Funktion, die in SurveyPage weitergegeben wird
  function submitRatings(id, ratings) {
    setParticipants((s) => s.map((p) => (p.id === id ? { ...p, ratings } : p)));
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <FramingStudyApp
              participants={participants}
              setParticipants={setParticipants}
            />
          }
        />
        <Route
          path="/survey/:participantId"
          element={
            <SurveyPage participants={participants} submitRatings={submitRatings} />
          }
        />
      </Routes>
    </Router>
  );
}


