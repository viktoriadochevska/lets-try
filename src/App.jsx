import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

// Single-file React component. TailwindCSS assumed to be available in the host app.
// Uses recharts for simple charts. Copy this file into a Create React App / Vite React
// project that has Tailwind CSS and recharts installed.

export default function FramingStudyApp() {
  const [showResults, setShowResults] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [nameInput, setNameInput] = useState("");
  const [groupAssignMode, setGroupAssignMode] = useState("auto"); // auto or manual
  const [manualGroup, setManualGroup] = useState("A");
  const [currentPrompt, setCurrentPrompt] = useState(null);

  // prompts
  const prompts = {
    A: {
      title: "Gruppe 1 — Gain Frame",
      text:
        "Stell dir vor, dein Partner besitzt 4 von 5 Eigenschaften, die dir wichtig sind. Bewerte bitte die Beziehungserwartungen. (hypothetisch)",
      frame: "gain",
    },
    B: {
      title: "Gruppe 2 — Loss Frame",
      text:
        "Stell dir vor, deinem Partner fehlt 1 von 5 Eigenschaften, die dir wichtig sind. Bewerte bitte die Beziehungserwartungen. (hypothetisch)",
      frame: "loss",
    },
  };

  function addParticipant() {
    if (!nameInput.trim()) return;
    const id = Date.now().toString(36);
    let group;
    if (groupAssignMode === "auto") {
      // assign to balance groups
      const countA = participants.filter((p) => p.group === "A").length;
      const countB = participants.filter((p) => p.group === "B").length;
      group = countA <= countB ? "A" : "B";
    } else {
      group = manualGroup;
    }
    const p = {
      id,
      name: nameInput.trim(),
      group,
      ratings: null, // {effort, satisfaction, risk, stayLikelihood}
    };
    setParticipants((s) => [...s, p]);
    setNameInput("");
  }

  function removeParticipant(id) {
    setParticipants((s) => s.filter((p) => p.id !== id));
  }

  function openSurveyFor(p) {
    setCurrentPrompt(p.id);
  }

  function submitRatings(id, ratings) {
    setParticipants((s) => s.map((p) => (p.id === id ? { ...p, ratings } : p)));
    setCurrentPrompt(null);
  }

  function randomizeGroups() {
    const shuffled = participants.slice().sort(() => Math.random() - 0.5);
    const reassigned = shuffled.map((p, i) => ({ ...p, group: i % 2 === 0 ? "A" : "B" }));
    setParticipants(reassigned);
  }

  // helper stats
  function mean(arr) {
    if (!arr.length) return null;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  }
  function sd(arr) {
    if (arr.length < 2) return 0;
    const m = mean(arr);
    return Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / (arr.length - 1));
  }

  function independentTTest(a, b) {
    // Welch's t-test
    if (a.length < 2 || b.length < 2) return { t: null, df: null, p: null };
    const ma = mean(a), mb = mean(b);
    const sa2 = sd(a) ** 2, sb2 = sd(b) ** 2;
    const t = (ma - mb) / Math.sqrt(sa2 / a.length + sb2 / b.length);
    const df = (sa2 / a.length + sb2 / b.length) ** 2 / ((sa2 ** 2) / (a.length ** 2 * (a.length - 1)) + (sb2 ** 2) / (b.length ** 2 * (b.length - 1)));
    // two-tailed p-value approximation using t-distribution is complex; we'll use a simple approximation via normal for moderate n
    const z = Math.abs(t);
    const p = (1 - gaussianCdf(z)) * 2;
    return { t, df, p };
  }

  function gaussianCdf(x) {
    // approximate CDF for standard normal
    return 0.5 * (1 + erf(x / Math.sqrt(2)));
  }
  function erf(x) {
    // numerical approximation (Abramowitz & Stegun)
    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;
    const t = 1 / (1 + p * x);
    const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    return sign * y;
  }

  // aggregated scores (impression index): higher = more pessimistic (like the paper)
  function impressionScore(r) {
    // r: {effort, satisfaction, risk, stayLikelihood}
    // The paper used four items with satisfaction and stayLikelihood reverse-scored.
    // We'll compute: effort + (7 - satisfaction) + risk + (7 - stay) then average
    if (!r) return null;
    const val = (r.effort + (7 - r.satisfaction) + r.risk + (7 - r.stay)) / 4;
    return val;
  }

  const groupAScores = participants
    .filter((p) => p.group === "A" && p.ratings)
    .map((p) => impressionScore(p.ratings));
  const groupBScores = participants
    .filter((p) => p.group === "B" && p.ratings)
    .map((p) => impressionScore(p.ratings));

  const ttest = independentTTest(groupAScores.filter(Boolean), groupBScores.filter(Boolean));

  function exportCSV() {
    const header = ["id,name,group,effort,satisfaction,risk,stay,impression"].join("\n");
    const rows = participants.map((p) => {
      if (!p.ratings) return `${p.id},${p.name},${p.group},,,,,`;
      const sc = impressionScore(p.ratings);
      return `${p.id},${p.name},${p.group},${p.ratings.effort},${p.ratings.satisfaction},${p.ratings.risk},${p.ratings.stay},${sc}`;
    });
    const csv = header + "\n" + rows.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "framing_study_data.csv";
    a.click();
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-2">Framing Study — Seminar-Tool</h1>
        <p className="text-sm text-gray-600 mb-4">
          Interaktives Tool, um die Gain-vs-Loss-Framing-Übung live im Seminar durchzuführen.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="col-span-2 border rounded p-4">
            <h2 className="font-semibold">Teilnehmende verwalten</h2>
            <div className="flex gap-2 mt-2">
              <input value={nameInput} onChange={(e) => setNameInput(e.target.value)} placeholder="Name eingeben" className="border rounded px-2 py-1 flex-1" />
              <button onClick={addParticipant} className="bg-indigo-600 text-white px-3 py-1 rounded">Hinzufügen</button>
            </div>

            <div className="mt-3 text-sm text-gray-700">
              <label className="mr-2">Zuweisung:</label>
              <select value={groupAssignMode} onChange={(e) => setGroupAssignMode(e.target.value)} className="border rounded px-2 py-1">
                <option value="auto">Automatisch ausbalancieren</option>
                <option value="manual">Manuell</option>
              </select>
              {groupAssignMode === "manual" && (
                <select value={manualGroup} onChange={(e) => setManualGroup(e.target.value)} className="ml-2 border rounded px-2 py-1">
                  <option value="A">Gruppe 1 (Gain)</option>
                  <option value="B">Gruppe 2 (Loss)</option>
                </select>
              )}
              <button onClick={randomizeGroups} className="ml-3 text-sm px-2 py-1 border rounded">Zufällig aufteilen</button>
            </div>

            <div className="mt-3">
              <ul className="divide-y">
                {participants.map((p) => (
                  <li key={p.id} className="py-2 flex items-center justify-between">
                    <div>
                      <strong>{p.name}</strong> <span className="text-xs text-gray-500">({p.group === 'A' ? 'Gruppe 1 — Gain' : 'Gruppe 2 — Loss'})</span>
                      {p.ratings ? <span className="ml-2 text-green-600 text-sm">(Eingetragen)</span> : <span className="ml-2 text-yellow-600 text-sm">(offen)</span>}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => openSurveyFor(p)} className="text-sm px-2 py-1 border rounded">Survey</button>
                      <button onClick={() => removeParticipant(p.id)} className="text-sm px-2 py-1 border rounded">Löschen</button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border rounded p-4">
            <h2 className="font-semibold">Anleitung (Kurz)</h2>
            <ol className="list-decimal pl-5 text-sm mt-2 text-gray-700">
              <li>Teilnehmende hinzufügen.</li>
              <li>Jede/r füllt kurz die Ratings zur hypothetischen Beziehung aus.</li>
              <li>Am Ende: Auswertung anzeigen und CSV exportieren.</li>
            </ol>

            <div className="mt-3">
              <button onClick={exportCSV} className="bg-green-600 text-white px-3 py-1 rounded">CSV exportieren</button>
            </div>
          </div>
        </div>

        {/* Survey modal-like area (inline) */}
        {currentPrompt && (
          <SurveyModal
            participant={participants.find((p) => p.id === currentPrompt)}
            prompt={prompts[participants.find((p) => p.id === currentPrompt).group === 'A' ? 'A' : 'B']}
            onCancel={() => setCurrentPrompt(null)}
            onSubmit={submitRatings}
          />
        )}

        {/* Results */}
        <div className="mt-6">
          <h2 className="font-semibold">Auswertung
          {!showResults && (
            <button onClick={() => setShowResults(true)} className="ml-4 px-3 py-1 bg-indigo-600 text-white rounded text-sm">Auswertung anzeigen</button>
          )}
          {showResults && (
          <div className="grid md:grid-cols-2 gap-4 mt-3">
            <div className="p-4 border rounded">
              <h3 className="font-medium">Gruppenstatistiken (Impression Index)</h3>
              <p className="text-sm text-gray-600 mt-2">Mittelwerte und Streuung (n = ausgefüllte Fälle)</p>
              <ul className="mt-2 text-sm">
                <li>Gruppe 1 (Gain): n = {groupAScores.length}, Mittelwert = {groupAScores.length ? mean(groupAScores).toFixed(2) : "-"}, SD = {groupAScores.length ? sd(groupAScores).toFixed(2) : "-"}</li>
                <li>Gruppe 2 (Loss): n = {groupBScores.length}, Mittelwert = {groupBScores.length ? mean(groupBScores).toFixed(2) : "-"}, SD = {groupBScores.length ? sd(groupBScores).toFixed(2) : "-"}</li>
                <li className="mt-2">t ≈ {ttest.t ? ttest.t.toFixed(3) : "-"}, df ≈ {ttest.df ? ttest.df.toFixed(1) : "-"}, p ≈ {ttest.p ? ttest.p.toFixed(3) : "-"} (approx.)</li>
              </ul>

              <div style={{ width: "100%", height: 240 }} className="mt-4">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart
                    data={[{ name: "Gain", avg: groupAScores.length ? mean(groupAScores) : 0 }, { name: "Loss", avg: groupBScores.length ? mean(groupBScores) : 0 }]}
                  >
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="avg" fill="#4F46E5" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="p-4 border rounded">
              <h3 className="font-medium">Rohdaten-Vorschau</h3>
              <div className="overflow-auto max-h-48 mt-2 text-sm">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-xs text-gray-500">
                      <th className="pr-2">Name</th>
                      <th className="pr-2">Gr.</th>
                      <th className="pr-2">Impression</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participants.map((p) => (
                      <tr key={p.id} className="border-t">
                        <td className="py-1">{p.name}</td>
                        <td>{p.group}</td>
                        <td>{p.ratings ? impressionScore(p.ratings).toFixed(2) : "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-3 text-xs text-gray-600">Hinweis: Impression Index skaliert so, dass höhere Werte pessimistischer sind (analog Paper).</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SurveyModal({ participant, prompt, onCancel, onSubmit }) {
  const [effort, setEffort] = useState(4);
  const [satisfaction, setSatisfaction] = useState(4);
  const [risk, setRisk] = useState(4);
  const [stay, setStay] = useState(4);

  if (!participant) return null;

  function handleSubmit() {
    onSubmit(participant.id, { effort, satisfaction, risk, stay });
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-xl w-full p-6">
        <h3 className="font-bold mb-2">{prompt.title} — {participant.name}</h3>
        <p className="text-sm text-gray-600 mb-4">{prompt.text}</p>

        <div className="grid grid-cols-1 gap-3">
          <RatingSlider label="Wie wahrscheinlich ist es, dass diese Beziehung erfolgreich wäre? (1 = überhaupt nicht, 7 = sehr wahrscheinlich)" value={effort} setValue={setEffort} />
          <RatingSlider label="Wie zufrieden wären Sie in dieser Beziehung? (1 = sehr zufrieden, 7 = überhaupt nicht zufrieden)" value={satisfaction} setValue={setSatisfaction} reverse />
          <RatingSlider label="Wie groß wäre das Risiko, diese Beziehung fortzusetzen? (1 = sehr groß, 7 = sehr gering)" value={risk} setValue={setRisk} />
          <RatingSlider label="Wie wahrscheinlich wäre es, in dieser Beziehung zu bleiben? (1 = sehr wahrscheinlich, 7 = sehr unwahrscheinlich)" value={stay} setValue={setStay} reverse />
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onCancel} className="px-3 py-1 border rounded">Abbrechen</button>
          <button onClick={handleSubmit} className="px-3 py-1 bg-indigo-600 text-white rounded">Speichern</button>
        </div>
      </div>
    </div>
  );
}

function RatingSlider({ label, value, setValue, reverse }) {
  // If reverse=true, the wording is reversed (we keep numeric scale same but interpret in impressionScore)
  return (
    <div>
      <label className="text-sm">{label}</label>
      <div className="flex items-center gap-3 mt-1">
        <input type="range" min="1" max="7" value={value} onChange={(e) => setValue(parseInt(e.target.value))} className="flex-1" />
        <div className="w-10 text-center text-sm">{value}</div>
      </div>
    </div>
  );
}

