import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function App() {
  const [participants, setParticipants] = useState([]);
  const [nameInput, setNameInput] = useState("");
  const [groupAssignMode, setGroupAssignMode] = useState("auto");
  const [manualGroup, setManualGroup] = useState("A");
  const [currentPrompt, setCurrentPrompt] = useState(null);
  const [showResults, setShowResults] = useState(false);

  const prompts = {
    A: {
      title: "Gruppe 1 — Gain Frame",
      text: "Stell dir vor, dein Partner besitzt 4 von 5 Eigenschaften, die dir wichtig sind."
    },
    B: {
      title: "Gruppe 2 — Loss Frame",
      text: "Stell dir vor, deinem Partner fehlt 1 von 5 Eigenschaften, die dir wichtig sind."
    }
  };

  function addParticipant() {
    if (!nameInput.trim()) return;
    const id = Date.now().toString(36);

    const group =
      groupAssignMode === "auto"
        ? participants.filter((p) => p.group === "A").length <=
          participants.filter((p) => p.group === "B").length
          ? "A"
          : "B"
        : manualGroup;

    setParticipants((s) => [...s, { id, name: nameInput.trim(), group, ratings: null }]);
    setNameInput("");
  }

  function submitRatings(id, ratings) {
    setParticipants((s) => s.map((p) => (p.id === id ? { ...p, ratings } : p)));
    setCurrentPrompt(null);
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
                onClick={() => setCurrentPrompt(p.id)}
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

      {currentPrompt && (
        <SurveyModal
          participant={participants.find((p) => p.id === currentPrompt)}
          prompt={prompts[participants.find((p) => p.id === currentPrompt).group]}
          onCancel={() => setCurrentPrompt(null)}
          onSubmit={submitRatings}
        />
      )}
    </div>
  );
}

function SurveyModal({ participant, prompt, onCancel, onSubmit }) {
  const [success, setSuccess] = useState(4);
  const [satisfaction, setSatisfaction] = useState(4);
  const [risk, setRisk] = useState(4);
  const [stay, setStay] = useState(4);

  function save() {
    onSubmit(participant.id, { success, satisfaction, risk, stay });
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded shadow max-w-xl w-full">
        <h3 className="font-bold mb-2">
          {prompt.title} — {participant.name}
        </h3>
        <p className="text-sm text-gray-600 mb-4">{prompt.text}</p>

        <Rating
          label="Wie wahrscheinlich ist es, dass diese Beziehung erfolgreich wäre? (1 = überhaupt nicht, 7 = sehr wahrscheinlich)"
          value={success}
          setValue={setSuccess}
        />
        <Rating
          label="Wie zufrieden wären Sie in dieser Beziehung? (1 = sehr zufrieden, 7 = überhaupt nicht zufrieden)"
          value={satisfaction}
          setValue={setSatisfaction}
        />
        <Rating
          label="Wie groß wäre das Risiko, diese Beziehung fortzusetzen? (1 = sehr groß, 7 = sehr gering)"
          value={risk}
          setValue={setRisk}
        />
        <Rating
          label="Wie wahrscheinlich wäre es, in dieser Beziehung zu bleiben? (1 = sehr wahrscheinlich, 7 = sehr unwahrscheinlich)"
          value={stay}
          setValue={setStay}
        />

        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onCancel} className="border px-3 py-1 rounded">
            Abbrechen
          </button>
          <button onClick={save} className="bg-indigo-600 text-white px-3 py-1 rounded">
            Speichern
          </button>
        </div>
      </div>
    </div>
  );
}

function Rating({ label, value, setValue }) {
  return (
    <div className="mb-3">
      <label className="text-sm">{label}</label>
      <div className="flex items-center gap-3 mt-1">
        <input
          type="range"
          min={1}
          max={7}
          value={value}
          onChange={(e) => setValue(parseInt(e.target.value))}
          className="flex-1"
        />
        <div className="w-8 text-center text-sm">{value}</div>
      </div>
    </div>
  );
}

