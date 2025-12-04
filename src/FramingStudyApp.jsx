import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function FramingStudyApp({ participants, setParticipants }) {
  const [nameInput, setNameInput] = useState("");
  const [groupAssignMode, setGroupAssignMode] = useState("auto");
  const [manualGroup, setManualGroup] = useState("A");
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();

  <button
  onClick={() => navigate(`/survey/${p.id}`)}
  className="border px-2 py-1 rounded text-sm"
>
  Survey
</button>

  function addParticipant() {
  if (!nameInput.trim()) return;
  const id = Date.now().toString(36);
  const group = groupAssignMode === "auto"
    ? participants.filter((p) => p.group === "A").length <= 
      participants.filter((p) => p.group === "B").length
      ? "A"
      : "B"
    : manualGroup;
  
  const newParticipant = { 
    id, 
    name: nameInput.trim(), 
    group, 
    ratings: null 
  };
  
  // Pass the new array directly, not a function
  setParticipants([...participants, newParticipant]);
  setNameInput("");
}

  function impressionScore(r) {
    return (r.success + (7 - r.satisfaction) + (7 - r.risk) + (7 - r.stay)) / 4;
  }

  const groupAScores = participants
    .filter((p) => p.group === "A" && p.ratings)
    .map((p) => impressionScore(p.ratings));
  const groupBScores = participants
    .filter((p) => p.group === "B" && p.ratings)
    .map((p) => impressionScore(p.ratings));

  function mean(values) {
    return values.length ? values.reduce((a, b) => a + b) / values.length : 0;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Framing Study – Seminar Tool</h1>

      <div className="border p-4 rounded mb-4">
        <h2 className="font-semibold mb-2">Teilnehmende</h2>
        <div className="flex gap-2 mb-3">
          <input
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            className="border rounded px-2 py-1 flex-1"
            placeholder="Name eingeben"
          />
          <button onClick={addParticipant} className="bg-indigo-600 text-white px-3 py-1 rounded">
            Hinzufügen
          </button>
        </div>

        <ul className="divide-y">
          {participants.map((p) => (
            <li key={p.id} className="py-2 flex justify-between items-center">
              <div>
                <strong>{p.name}</strong> ({p.group})
                {p.ratings ? (
                  <span className="ml-2 text-green-600">(fertig)</span>
                ) : (
                  <span className="ml-2 text-yellow-600">(offen)</span>
                )}
              </div>
              <button
                onClick={() => navigate(`/survey/${p.id}`)}
                className="border px-2 py-1 rounded text-sm"
              >
                Survey
              </button>
            </li>
          ))}
        </ul>
      </div>

      {!showResults && (
        <button
          onClick={() => setShowResults(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Auswertung anzeigen
        </button>
      )}

      {showResults && (
        <div className="mt-6 border p-4 rounded">
          <h2 className="font-semibold mb-4">Ergebnisse</h2>

          <div style={{ width: "100%", height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: "Gain", avg: mean(groupAScores) },
                  { name: "Loss", avg: mean(groupBScores) }
                ]}
              >
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="avg" fill="#4F46E5" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
