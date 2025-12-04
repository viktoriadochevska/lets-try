import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function SurveyPage({ participants, submitRatings }) {
  const { participantId } = useParams();
  const navigate = useNavigate();
  const participant = participants.find(p => p.id === participantId);
  
  const [success, setSuccess] = useState(4);
  const [satisfaction, setSatisfaction] = useState(4);
  const [risk, setRisk] = useState(4);
  const [stay, setStay] = useState(4);

  if (!participant) return (
    <div className="p-6">
      <p>Teilnehmende/r nicht gefunden</p>
      <button onClick={() => navigate("/")} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">
        Zurück
      </button>
    </div>
  );

  function handleSubmit() {
    submitRatings(participant.id, { success, satisfaction, risk, stay });
    navigate("/");
  }

  const questions = [
    { 
      key: "success", 
      label: "Wie erfolgreich schätzen Sie diese Person ein?", 
      state: success, 
      setState: setSuccess 
    },
    { 
      key: "satisfaction", 
      label: "Wie zufrieden wäre diese Person mit dem Ergebnis?", 
      state: satisfaction, 
      setState: setSatisfaction 
    },
    { 
      key: "risk", 
      label: "Wie riskant ist die Entscheidung?", 
      state: risk, 
      setState: setRisk 
    },
    { 
      key: "stay", 
      label: "Würde die Person bei ihrer Entscheidung bleiben?", 
      state: stay, 
      setState: setStay 
    }
  ];

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Survey für {participant.name}</h1>
      <p className="text-gray-600 mb-6">Gruppe: {participant.group}</p>
      
      <div className="space-y-6">
        {questions.map((q) => (
          <div key={q.key} className="border p-4 rounded">
            <label className="block font-semibold mb-3">{q.label}</label>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">1</span>
              <input
                type="range"
                min="1"
                max="7"
                value={q.state}
                onChange={(e) => q.setState(Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm text-gray-600">7</span>
              <span className="font-bold text-lg ml-2 w-8">{q.state}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex gap-4">
        <button
          onClick={() => navigate("/")}
          className="border px-4 py-2 rounded"
        >
          Abbrechen
        </button>
        <button
          onClick={handleSubmit}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Speichern
        </button>
      </div>
    </div>
  );
}
