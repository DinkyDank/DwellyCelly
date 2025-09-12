import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function MatchCard({ m, isFocused, onToggle }) {
  const [prob, setProb] = useState(null);
  const [live, setLive] = useState(null);

  const loadProb = async () => {
    try {
      const r = await fetch(`${API}/probabilities/${m.id}`);
      const data = await r.json();
      setProb(data);
    } catch (err) {
      console.error("Kunde inte hämta sannolikheter", err);
    }
  };

  const loadLive = async () => {
    try {
      const r = await fetch(`${API}/live/${m.id}`);
      const data = await r.json();
      setLive(data);
    } catch (err) {
      console.error("Kunde inte hämta live-data", err);
    }
  };

  return (
    <div style={{ border: "1px solid #ccc", padding: 12, marginBottom: 12, borderRadius: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <strong>{m.home} – {m.away}</strong>
        <button onClick={() => onToggle(m.id)} style={{ fontSize: 20, background: "none", border: "none" }}>
          {isFocused ? "⭐" : "☆"}
        </button>
      </div>
      <small>{m.start_time}</small>
      <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
        <button onClick={loadProb}>Visa sannolikhet</button>
        <button onClick={loadLive}>Live</button>
      </div>
      {prob && (
        <div style={{ marginTop: 8 }}>
          <div>P(1): {(prob.p1*100).toFixed(0)}% | P(X): {(prob.px*100).toFixed(0)}% | P(2): {(prob.p2*100).toFixed(0)}%</div>
          <div>Värde: 1={prob.value["1"]} | X={prob.value["X"]} | 2={prob.value["2"]}</div>
        </div>
      )}
      {live && (
        <div style={{ marginTop: 8 }}>
          <div>Live: {live.score} ({live.minute}')</div>
          <ul>
            {live.events?.map((e, i) => (
              <li key={i}>{e.minute}': {e.type} – {e.player || ""}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [matches, setMatches] = useState([]);
  const [focusIds, setFocusIds] = useState(new Set());
  const [showFocusOnly, setShowFocusOnly] = useState(false);

  useEffect(() => {
    fetch(`${API}/matches`)
      .then(r => r.json())
      .then(setMatches)
      .catch(err => console.error("Kunde inte hämta matcher", err));
  }, []);

  const toggleFocus = (id) => {
    const next = new Set(focusIds);
    next.has(id) ? next.delete(id) : next.add(id);
    setFocusIds(next);
  };

  const list = showFocusOnly ? matches.filter(m => focusIds.has(m.id)) : matches;

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: 16 }}>
      <h1>StryktipsKollen</h1>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button onClick={() => setShowFocusOnly(false)}>Alla</button>
        <button onClick={() => setShowFocusOnly(true)}>⭐ Markerade</button>
      </div>
      {list.length === 0 && <p>Inga matcher att visa.</p>}
      {list.map(m => (
        <MatchCard key={m.id} m={m} isFocused={focusIds.has(m.id)} onToggle={toggleFocus} />
      ))}
    </div>
  );
}