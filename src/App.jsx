import React, { useState, useEffect } from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { ref, onValue, set } from "firebase/database";
import { database } from "./firebase";
import FramingStudyApp from "./FramingStudyApp.jsx";
import SurveyPage from "./SurveyPage.jsx";

export default function App() {
  const [participants, setParticipants] = useState([]);

  // Load participants from Firebase
  useEffect(() => {
    const participantsRef = ref(database, 'participants');
    const unsubscribe = onValue(participantsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setParticipants(Object.values(data));
      } else {
        setParticipants([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Save participants to Firebase
  function updateParticipants(newParticipants) {
    const participantsRef = ref(database, 'participants');
    const participantsObj = {};
    newParticipants.forEach(p => {
      participantsObj[p.id] = p;
    });
    set(participantsRef, participantsObj);
  }

  function submitRatings(id, ratings) {
    const updated = participants.map((p) => 
      p.id === id ? { ...p, ratings } : p
    );
    updateParticipants(updated);
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            <FramingStudyApp 
              participants={participants} 
              setParticipants={updateParticipants} 
            />
          } 
        />
        <Route 
          path="/survey/:participantId" 
          element={
            <SurveyPage 
              participants={participants} 
              submitRatings={submitRatings} 
            />
          } 
        />
      </Routes>
    </Router>
  );
}
