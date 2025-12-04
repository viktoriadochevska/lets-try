import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function SurveyPage({ participants, submitRatings }) {
  const { participantId } = useParams();
  const navigate = useNavigate();
  const participant = participants.find(p => p.id === participantId);
  
  const [success, setSuccess] = useState(1);
  const [satisfaction, setSatisfaction] = useState(1);
  const [risk, setRisk] = useState(1);
  const [stay, setStay] = useState(1);
  const [saved, setSaved] = useState(false);

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
    setSaved(true);
  }

  const instructions = {
    A: "Die Person, die Sie seit 6 Monaten daten, besitzt 4 der 5 Eigenschaften, die Ihnen wichtig sind, mit Ausnahme der ersten…",
    B: "Der Person, die Sie seit 6 Monaten daten, fehlt die wichtigste Eigenschaft…"
  };

  const questions = [
    { 
      key: "success", 
      label: "Wie erfolgreich schätzen Sie diese Beziehung ein?", 
      state: success, 
      setState: setSuccess,
      leftLabel: "gar nicht erfolgreich  - ",
      rightLabel: "sehr erfolgreich"
    },
    { 
      key: "satisfaction", 
      label: "Wie zufrieden wären Sie in dieser Beziehung?", 
      state: satisfaction, 
      setState: setSatisfaction,
      leftLabel: "überhaupt nicht zufrieden  - ",
      rightLabel: "sehr zufrieden"
    },
    { 
      key: "risk", 
      label: "Wie riskant ist die Entscheidung in der Beziehung zu bleiben?", 
      state: risk, 
      setState: setRisk,
      leftLabel: "sehr riskant  - ",
      rightLabel: "gar nicht riskant"
    },
    { 
      key: "stay", 
      label: "Wie wahrscheinlich würden Sie in dieser Beziehung bleiben?", 
      state: stay, 
      setState: setStay,
      leftLabel: "sehr unwahrscheinlich  - ",
      rightLabel: "sehr wahrscheinlich"
    }
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Survey für {participant.name}</h1>
      <p className=""text-gray-800 text-base leading-relaxed">
          {instructions[participant.group]}
        </p>
      </div>
      
      {saved && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 text-center text-lg font-semibold">
          Speichern erfolgt
        </div>
      )}
      
      <div className="space-y-8">
        {questions.map((q) => (
          <div key={q.key} className="border p-5 rounded">
            <label className="block font-semibold mb-5 text-lg">{q.label}</label>
            
            <div className="mb-4 grid grid-cols-2 gap-8 text-sm text-gray-600 italic">
              <span className="text-left">{q.leftLabel}</span>
              <span className="text-right">{q.rightLabel}</span>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-base text-gray-800 font-bold min-w-[20px]">1</span>
              <input
                type="range"
                min="1"
                max="7"
                step="1"
                value={q.state}
                onChange={(e) => q.setState(parseInt(e.target.value))}
                className="flex-1 h-2"
                style={{ accentColor: '#4F46E5' }}
              />
              <span className="text-base text-gray-800 font-bold min-w-[20px]">7</span>
              <div className="ml-8 min-w-[60px] text-center">
                <span className="font-bold text-3xl text-indigo-600">{q.state}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex gap-4 justify-center">
        <button
          onClick={() => navigate("/")}
          className="border border-gray-400 px-6 py-2 rounded hover:bg-gray-100"
        >
          Abbrechen
        </button>
        <button
          onClick={handleSubmit}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
          disabled={saved}
        >
          Speichern
        </button>
      </div>
    </div>
  );
}
