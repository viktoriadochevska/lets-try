import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function SurveyPage({ participants, submitRatings }) {
  const { participantId } = useParams();
  const navigate = useNavigate();
  const participant = participants.find(p => p.id === participantId);

  const [effort, setEffort] = useState(4);
  const [satisfaction, setSatisfaction] = useState(4);
  const [risk, setRisk] = useState(4);
  const [stay, setStay] = useState(4);

  if (!participant) return <div>Teilnehmende/r nicht gefunden</div>;

  function handleSubmit() {
    submitRatings(participant.id, { effort, satisfaction, risk, stay });
    navigate("/"); // zurück zur Hauptseite
  }

  return (
    <div className="p-6">
      <h2>Survey für {participant.name}</h2>
      {/* Hier kannst du wieder deine RatingSlider-Komponente verwenden */}
      <button onClick={handleSubmit}>Speichern</button>
    </div>
  );
}
