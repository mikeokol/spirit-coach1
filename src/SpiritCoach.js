import React, { useState, useEffect } from "react";

// ============================================================================
// SPIRIT COACH v2 — Adaptive Athletic Intelligence
// 
// Three-screen loop: Setup → Today's Plan → Reflect → (Plan adapts)
// localStorage for persistence (works on any web host)
// Mobile-first. No chat wrapper. No ChatGPT clone.
//
// What makes this different from v1:
// Spirit REMEMBERS. Every reflection changes the next plan.
// Spirit ADAPTS. It doesn't give the same plan twice.
// Spirit NOTICES. Patterns across sessions surface as insights.
// ============================================================================

// ============================================================================
// DESIGN SYSTEM
// ============================================================================
const T = {
  bg: "#08080a",
  surface: "#101014",
  surfaceAlt: "#16161c",
  border: "#1c1c24",
  borderHover: "#28283a",
  text: "#eae8e4",
  textSoft: "#9590a0",
  textDim: "#504c5c",
  accent: "#5cff8a",
  accentDim: "#1a3a24",
  accentSoft: "#5cff8a40",
  warn: "#ffb05c",
  danger: "#ff5c6a",
  blue: "#5ca0ff",
  purple: "#a05cff",
};

const SPORTS = {
  soccer: {
    name: "Soccer",
    emoji: "\u26BD",
    positions: ["GK", "CB", "FB/WB", "CDM", "CM", "CAM", "Winger", "Striker"],
    skills: ["First Touch", "Weak Foot", "Passing Range", "Crossing", "Finishing", "Heading", "Dribbling", "Positioning", "Tackling", "Speed", "Endurance", "Agility"],
    sessionTypes: ["Technical", "Tactical", "Physical", "Match", "Recovery"],
  },
  basketball: {
    name: "Basketball",
    emoji: "\uD83C\uDFC0",
    positions: ["PG", "SG", "SF", "PF", "C"],
    skills: ["Ball Handling", "3PT Shooting", "Mid-Range", "Free Throws", "Finishing", "Rebounding", "Court Vision", "Defense", "Vertical", "Speed", "Conditioning"],
    sessionTypes: ["Shooting", "Skills", "Scrimmage", "Strength", "Recovery"],
  },
  track: {
    name: "Track & Field",
    emoji: "\uD83C\uDFC3",
    positions: ["Sprints (100-400m)", "Middle Distance (800-1500m)", "Long Distance (5K+)", "Hurdles", "Jumps", "Throws"],
    skills: ["Acceleration", "Top Speed", "Speed Endurance", "Technique", "Block Starts", "Race Tactics", "Strength", "Flexibility", "Mental Focus"],
    sessionTypes: ["Speed Work", "Tempo", "Long Run", "Technique", "Strength", "Recovery"],
  },
  football: {
    name: "Football",
    emoji: "\uD83C\uDFC8",
    positions: ["QB", "RB", "WR", "TE", "OL", "DL", "LB", "CB", "Safety", "K/P"],
    skills: ["Route Running", "Catching", "Throwing", "Blocking", "Tackling", "Coverage", "Speed", "Agility", "Strength", "Football IQ", "Conditioning"],
    sessionTypes: ["Position Drills", "Team Practice", "Film Study", "Strength", "Speed/Agility", "Recovery"],
  },
};

const EXPERIENCE_LEVELS = ["Beginner (< 1 year)", "Intermediate (1-3 years)", "Advanced (3-7 years)", "Elite (7+ years)"];
const DAYS_PER_WEEK = [2, 3, 4, 5, 6];

// ============================================================================
// STORAGE — Simple localStorage wrapper
// ============================================================================
function loadData(key, fallback) {
  try {
    const raw = localStorage.getItem(`spirit_${key}`);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function saveData(key, value) {
  try {
    localStorage.setItem(`spirit_${key}`, JSON.stringify(value));
  } catch (e) { console.error("Storage error:", e); }
}

// ============================================================================
// ADAPTIVE PLAN ENGINE
// Reads ALL past reflections. Adapts based on patterns.
// This is what makes Spirit different from a static workout app.
// ============================================================================
function generateAdaptivePlan(profile, reflections, planHistory) {
  const sport = SPORTS[profile.sport];
  const today = new Date();
  const dayName = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][today.getDay()];
  
  // Analyze reflection patterns
  const recentReflections = reflections.slice(-10);
  const weaknessFrequency = {};
  const energyTrend = [];
  const performanceScores = [];
  
  recentReflections.forEach(r => {
    if (r.weaknesses) {
      r.weaknesses.forEach(w => {
        weaknessFrequency[w] = (weaknessFrequency[w] || 0) + 1;
      });
    }
    if (r.energy) energyTrend.push(r.energy);
    if (r.performance) performanceScores.push(r.performance);
  });
  
  // Persistent weaknesses: mentioned 2+ times
  const persistentWeaknesses = Object.entries(weaknessFrequency)
    .filter(([_, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .map(([skill]) => skill);
  
  // Energy analysis
  const avgEnergy = energyTrend.length > 0 
    ? energyTrend.reduce((a,b) => a+b, 0) / energyTrend.length : 3;
  const isLowEnergy = avgEnergy < 2.5;
  const lastEnergy = energyTrend[energyTrend.length - 1] || 3;
  
  // Performance trend
  const recentPerf = performanceScores.slice(-3);
  const perfTrend = recentPerf.length >= 2 
    ? recentPerf[recentPerf.length-1] - recentPerf[0] : 0;
  
  // Last plan info
  const lastPlan = planHistory[planHistory.length - 1];
  const lastSessionType = lastPlan?.sessionType || "";
  const daysSinceLastSession = lastPlan 
    ? Math.floor((today - new Date(lastPlan.date)) / 86400000) : 999;
  
  let sessionType, sessionFocus, intensity, adaptationNote;
  let drills = [];
  
  // DECISION TREE
  if (lastEnergy <= 2 || daysSinceLastSession === 0) {
    sessionType = "Recovery";
    intensity = "Low";
    sessionFocus = "Active recovery and mobility";
    adaptationNote = lastEnergy <= 2 
      ? "Your recent energy has been low. Today is about restoration, not output."
      : "You trained recently. Light movement only.";
    drills = [
      { name: "Dynamic stretching", duration: "10 min", notes: "Full body, slow tempo" },
      { name: "Foam rolling", duration: "15 min", notes: "Focus on legs and hips" },
      { name: "Light jogging or walking", duration: "15 min", notes: "Conversational pace" },
      { name: "Breathing exercises", duration: "5 min", notes: "Box breathing: 4-4-4-4" },
    ];
  }
  else if (persistentWeaknesses.length > 0 && Math.random() > 0.3) {
    const targetWeakness = persistentWeaknesses[0];
    sessionType = "Technical";
    intensity = isLowEnergy ? "Moderate" : "High";
    sessionFocus = `Targeted: ${targetWeakness}`;
    adaptationNote = `You've flagged ${targetWeakness.toLowerCase()} as a weakness ${weaknessFrequency[targetWeakness]} times across sessions. Today we attack it directly.`;
    drills = generateWeaknessDrills(profile.sport, targetWeakness, intensity);
  }
  else if (lastSessionType === "Technical" || Math.random() > 0.5) {
    sessionType = "Physical";
    intensity = isLowEnergy ? "Moderate" : "High";
    sessionFocus = "Athletic development";
    adaptationNote = perfTrend > 0 
      ? "Performance trending up. Building on momentum with physical work."
      : reflections.length < 3 
        ? "Building your baseline. Spirit customizes more as you log sessions."
        : "Mixing in physical development to complement technical work.";
    drills = generatePhysicalDrills(intensity);
  }
  else {
    sessionType = "Technical";
    intensity = "Moderate";
    sessionFocus = profile.topPriority || "General skill development";
    adaptationNote = reflections.length === 0
      ? "This is your first plan. After your session, tell Spirit how it went \u2014 that's how it learns you."
      : "Balanced technical session based on your profile priorities.";
    drills = generateTechnicalDrills(profile.sport, profile.position);
  }
  
  // Build insight
  let insight = null;
  if (reflections.length >= 3) {
    if (persistentWeaknesses.length > 0) {
      insight = {
        type: "pattern",
        text: `Across ${reflections.length} sessions, "${persistentWeaknesses[0]}" keeps showing up. Spirit is now prioritizing this in your plans until the data changes.`,
      };
    } else if (perfTrend > 0.5) {
      insight = {
        type: "positive",
        text: `Your self-rated performance has been trending up over recent sessions. Keep doing what you're doing.`,
      };
    } else if (isLowEnergy) {
      insight = {
        type: "warning",
        text: `Your energy has averaged ${avgEnergy.toFixed(1)}/5 recently. Spirit is reducing intensity. Sleep and nutrition matter more than extra reps right now.`,
      };
    }
  }
  
  return {
    id: `plan_${Date.now()}`,
    date: today.toISOString(),
    dayName,
    sessionType,
    sessionFocus,
    intensity,
    adaptationNote,
    drills,
    insight,
    basedOnReflections: reflections.length,
    persistentWeaknesses,
  };
}

function generateWeaknessDrills(sport, weakness, intensity) {
  const templates = {
    soccer: {
      "Weak Foot": [
        { name: "Wall passes (weak foot only)", duration: "10 min", notes: "2-touch: receive and pass. 50 reps minimum." },
        { name: "Weak foot juggling", duration: "8 min", notes: "Goal: 20 consecutive touches. Track your best." },
        { name: "Driven passes (weak foot)", duration: "10 min", notes: "30-yard passes to a target. Focus on laces." },
        { name: "Weak foot finishing", duration: "12 min", notes: "10 shots each: inside foot, laces, outside edge." },
        { name: "Cool down + stretch", duration: "5 min", notes: "" },
      ],
      "First Touch": [
        { name: "Wall ball: first touch redirect", duration: "10 min", notes: "Pass to wall, control into space. Alternate feet." },
        { name: "Aerial control", duration: "10 min", notes: "Throw ball high, kill it dead. Thigh-foot combo. 30 reps." },
        { name: "Turn and face drills", duration: "10 min", notes: "Receive back to goal, first touch to turn. Vary angle." },
        { name: "Pressure touch simulation", duration: "10 min", notes: "Sprint 10 yards, receive pass, one-touch control. 20x." },
        { name: "Cool down", duration: "5 min", notes: "" },
      ],
      "Speed": [
        { name: "Sprint mechanics warm-up", duration: "10 min", notes: "A-skips, high knees, butt kicks." },
        { name: "10-30m sprints", duration: "12 min", notes: "8 reps with 90s rest. Full recovery." },
        { name: "Flying sprints", duration: "8 min", notes: "20m build-up into 20m max effort. 5 reps." },
        { name: "Agility ladder + sprint", duration: "10 min", notes: "Ladder pattern into 10m sprint." },
        { name: "Cool down jog + stretch", duration: "5 min", notes: "" },
      ],
      "Dribbling": [
        { name: "Cone weave warm-up", duration: "8 min", notes: "Tight cones, both feet, increasing speed." },
        { name: "1v1 moves practice", duration: "12 min", notes: "Stepovers, scissors, Cruyff turn. 10 each side." },
        { name: "Speed dribbling", duration: "10 min", notes: "Full speed through cones. Touch every 2 steps." },
        { name: "Close control in tight space", duration: "10 min", notes: "Small box, keep ball within reach at all times." },
        { name: "Cool down", duration: "5 min", notes: "" },
      ],
      "Finishing": [
        { name: "Shooting warm-up", duration: "8 min", notes: "Easy shots from 12 yards, both feet." },
        { name: "Edge of box finishing", duration: "12 min", notes: "10 shots from each angle. Low driven." },
        { name: "One-touch finishes", duration: "10 min", notes: "Lay-off and shoot. First time. 20 reps." },
        { name: "Composure drills", duration: "10 min", notes: "Sprint then shoot. Simulate game fatigue." },
        { name: "Cool down", duration: "5 min", notes: "" },
      ],
      "Passing Range": [
        { name: "Short passing patterns", duration: "10 min", notes: "Wall passes. 1-2 touch. Both feet." },
        { name: "Long ball accuracy", duration: "12 min", notes: "30-50 yard passes to target zone. 20 attempts." },
        { name: "Through ball visualization", duration: "8 min", notes: "Set up cones as defenders. Thread passes through gaps." },
        { name: "Switching play", duration: "10 min", notes: "Practice cross-field diagonal balls. Both feet." },
        { name: "Cool down", duration: "5 min", notes: "" },
      ],
    },
    basketball: {
      "3PT Shooting": [
        { name: "Catch and shoot 3s", duration: "12 min", notes: "5 spots around arc. 10 shots per spot. Track makes." },
        { name: "Off-dribble 3s", duration: "10 min", notes: "1-2 dribble pull-ups from each wing." },
        { name: "Movement shooting", duration: "10 min", notes: "Curl off screen, catch, shoot. Both directions." },
        { name: "Free throw routine", duration: "5 min", notes: "20 free throws." },
        { name: "Stretch", duration: "5 min", notes: "" },
      ],
      "Ball Handling": [
        { name: "Stationary dribble series", duration: "8 min", notes: "Crossover, between legs, behind back. 30s each." },
        { name: "Full court moves", duration: "10 min", notes: "Attack move every 3 dribbles. Vary combos." },
        { name: "Tennis ball dribbling", duration: "8 min", notes: "Dribble one hand, catch/toss tennis ball other." },
        { name: "2-ball dribbling", duration: "10 min", notes: "Simultaneous, alternating, crossover." },
        { name: "Cool down", duration: "5 min", notes: "" },
      ],
      "Defense": [
        { name: "Defensive slides", duration: "10 min", notes: "Lateral slides, drop steps, closeouts." },
        { name: "1-on-1 positioning", duration: "12 min", notes: "Shadow drill: stay in front without ball." },
        { name: "Help and recover", duration: "10 min", notes: "Practice rotations and recovery sprints." },
        { name: "Rebounding box-out", duration: "8 min", notes: "Box out drill, secure rebound, outlet pass." },
        { name: "Cool down", duration: "5 min", notes: "" },
      ],
    },
  };
  
  const sportDrills = templates[sport];
  if (sportDrills && sportDrills[weakness]) return sportDrills[weakness];
  
  return [
    { name: `${weakness} focused warm-up`, duration: "10 min", notes: "Progressive intensity" },
    { name: `${weakness} drill set 1`, duration: "15 min", notes: `Isolate the movement patterns` },
    { name: `${weakness} drill set 2`, duration: "12 min", notes: "Add game-speed pressure" },
    { name: `${weakness} integration`, duration: "8 min", notes: "Combine with other skills" },
    { name: "Cool down + reflection", duration: "5 min", notes: "" },
  ];
}

function generatePhysicalDrills(intensity) {
  const isHigh = intensity === "High";
  return [
    { name: "Dynamic warm-up", duration: "8 min", notes: "Leg swings, hip circles, arm circles, light jog" },
    { name: isHigh ? "Plyometric circuit" : "Bodyweight strength", duration: "12 min", notes: isHigh ? "Box jumps, broad jumps, lateral bounds. 3x8 each." : "Squats, lunges, push-ups, planks. 3x12 each." },
    { name: "Sprint intervals", duration: "10 min", notes: isHigh ? "6x40m sprints, 2 min rest" : "8x20m at 80%, 90s rest" },
    { name: "Core circuit", duration: "8 min", notes: "Plank variations, dead bugs, bicycle crunches. 3 rounds." },
    { name: "Cool down + stretch", duration: "7 min", notes: "Static stretching, 30s per muscle group" },
  ];
}

function generateTechnicalDrills(sport, position) {
  const sportConfig = SPORTS[sport];
  if (!sportConfig) return [{ name: "General training", duration: "45 min", notes: "Sport-specific skill work" }];
  
  const skills = sportConfig.skills.slice(0, 4);
  const drills = [{ name: "Warm-up with ball/equipment", duration: "8 min", notes: "Light movement, get touches" }];
  
  skills.forEach((skill, i) => {
    drills.push({
      name: `${skill} development`,
      duration: i < 2 ? "12 min" : "8 min",
      notes: "Progressive difficulty. Quality over quantity.",
    });
  });
  
  drills.push({ name: "Cool down", duration: "5 min", notes: "" });
  return drills;
}

// ============================================================================
// STYLES
// ============================================================================
const S = {
  app: {
    minHeight: "100vh",
    background: T.bg,
    color: T.text,
    fontFamily: "'Outfit', 'DM Sans', system-ui, sans-serif",
    fontSize: 15,
    lineHeight: 1.55,
    WebkitFontSmoothing: "antialiased",
    maxWidth: 480,
    margin: "0 auto",
    position: "relative",
  },
  header: {
    padding: "16px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: `1px solid ${T.border}`,
    position: "sticky",
    top: 0,
    zIndex: 50,
    background: `${T.bg}f0`,
    backdropFilter: "blur(16px)",
  },
  logo: {
    fontFamily: "'Space Mono', 'Courier New', monospace",
    fontWeight: 700,
    fontSize: 15,
    letterSpacing: "0.15em",
    color: T.accent,
    textTransform: "uppercase",
  },
  screen: { padding: "24px 20px 100px" },
  h1: { fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", margin: "0 0 6px 0", lineHeight: 1.2 },
  h2: { fontSize: 18, fontWeight: 600, margin: "0 0 4px 0" },
  subtitle: { color: T.textSoft, fontSize: 14, margin: "0 0 28px 0" },
  label: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 10, fontWeight: 700, color: T.textDim,
    letterSpacing: "0.1em", textTransform: "uppercase",
    display: "block", marginBottom: 8,
  },
  card: {
    background: T.surface, border: `1px solid ${T.border}`,
    borderRadius: 14, padding: 20, marginBottom: 14,
  },
  input: {
    width: "100%", background: T.surfaceAlt, border: `1px solid ${T.border}`,
    borderRadius: 10, color: T.text, fontSize: 15, padding: "12px 16px",
    outline: "none", boxSizing: "border-box", fontFamily: "inherit",
  },
  btn: {
    width: "100%", background: T.accent, color: T.bg, border: "none",
    borderRadius: 12, fontSize: 15, fontWeight: 700, padding: "14px 24px",
    cursor: "pointer", fontFamily: "inherit",
  },
  btnSm: {
    background: T.surfaceAlt, color: T.textSoft, border: `1px solid ${T.border}`,
    borderRadius: 10, fontSize: 13, fontWeight: 600, padding: "10px 16px",
    cursor: "pointer", fontFamily: "inherit",
  },
  btnOutline: {
    background: "transparent", color: T.accent, border: `1px solid ${T.accent}40`,
    borderRadius: 12, fontSize: 14, fontWeight: 600, padding: "12px 20px",
    cursor: "pointer", fontFamily: "inherit", width: "100%",
  },
  tag: (color) => ({
    display: "inline-flex", alignItems: "center",
    fontFamily: "'Space Mono', monospace", fontSize: 10, fontWeight: 700,
    color: color || T.textDim, background: `${color || T.textDim}12`,
    border: `1px solid ${color || T.textDim}25`,
    padding: "3px 9px", borderRadius: 6,
    letterSpacing: "0.06em", textTransform: "uppercase",
  }),
  dot: (active, index) => {
    const colors = [T.danger, T.warn, T.textSoft, T.blue, T.accent];
    const c = colors[index] || T.textSoft;
    return {
      width: 40, height: 40, borderRadius: "50%",
      border: `2px solid ${active ? c : T.border}`,
      background: active ? `${c}18` : "transparent",
      color: active ? c : T.textDim,
      fontFamily: "'Space Mono', monospace", fontSize: 14, fontWeight: 700,
      display: "flex", alignItems: "center", justifyContent: "center",
      cursor: "pointer", transition: "all 0.12s", flexShrink: 0,
    };
  },
  chip: (active) => ({
    padding: "8px 14px", borderRadius: 20, fontSize: 13, fontWeight: 500,
    cursor: "pointer", transition: "all 0.12s",
    border: `1px solid ${active ? T.accent : T.border}`,
    background: active ? T.accentDim : "transparent",
    color: active ? T.accent : T.textSoft, whiteSpace: "nowrap",
  }),
  bottomNav: {
    position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
    width: "100%", maxWidth: 480, display: "flex",
    background: `${T.bg}f5`, backdropFilter: "blur(16px)",
    borderTop: `1px solid ${T.border}`, zIndex: 100,
  },
  navItem: (active) => ({
    flex: 1, padding: "12px 0 10px", display: "flex",
    flexDirection: "column", alignItems: "center", gap: 3,
    cursor: "pointer", background: "none", border: "none",
    fontFamily: "'Space Mono', monospace", fontSize: 9,
    fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase",
    color: active ? T.accent : T.textDim,
  }),
  progress: { height: 3, borderRadius: 2, background: T.border, overflow: "hidden" },
  progressFill: (pct) => ({
    height: "100%", width: `${Math.min(pct, 100)}%`,
    background: `linear-gradient(90deg, ${T.accent}, ${T.blue})`,
    borderRadius: 2, transition: "width 0.5s ease-out",
  }),
};

// ============================================================================
// SETUP SCREEN
// ============================================================================
function SetupScreen({ onComplete }) {
  const [step, setStep] = useState(0);
  const [sport, setSport] = useState("");
  const [position, setPosition] = useState("");
  const [experience, setExperience] = useState("");
  const [daysPerWeek, setDaysPerWeek] = useState(4);
  const [topPriority, setTopPriority] = useState("");
  const [weaknesses, setWeaknesses] = useState([]);

  const sportConfig = SPORTS[sport];

  if (step === 0) {
    return (
      <div style={S.screen}>
        <h1 style={S.h1}>Welcome to Spirit</h1>
        <p style={S.subtitle}>Your training adapts to you. Pick your sport.</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {Object.entries(SPORTS).map(([key, s]) => (
            <button key={key} style={{
              ...S.card, cursor: "pointer", textAlign: "center", marginBottom: 0, padding: 20,
              borderColor: sport === key ? T.accent : T.border,
              background: sport === key ? T.accentDim : T.surface,
            }} onClick={() => setSport(key)}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>{s.emoji}</div>
              <div style={{ fontWeight: 600, color: sport === key ? T.accent : T.text }}>{s.name}</div>
            </button>
          ))}
        </div>
        <div style={{ marginTop: 24 }}>
          <button style={{ ...S.btn, opacity: sport ? 1 : 0.3 }} disabled={!sport} onClick={() => setStep(1)}>Continue</button>
        </div>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div style={S.screen}>
        <div style={S.label}>STEP 2 OF 3</div>
        <h1 style={{ ...S.h1, fontSize: 22 }}>Your profile</h1>
        <p style={S.subtitle}>Spirit adjusts training based on your position and level.</p>
        <div style={{ marginBottom: 20 }}>
          <div style={S.label}>POSITION</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {sportConfig.positions.map((p) => (
              <button key={p} style={S.chip(position === p)} onClick={() => setPosition(p)}>{p}</button>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: 20 }}>
          <div style={S.label}>EXPERIENCE</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {EXPERIENCE_LEVELS.map((e) => (
              <button key={e} style={S.chip(experience === e)} onClick={() => setExperience(e)}>{e}</button>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: 24 }}>
          <div style={S.label}>TRAINING DAYS / WEEK</div>
          <div style={{ display: "flex", gap: 8 }}>
            {DAYS_PER_WEEK.map((d) => (
              <button key={d} style={S.dot(daysPerWeek === d, d - 2)} onClick={() => setDaysPerWeek(d)}>{d}</button>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={S.btnSm} onClick={() => setStep(0)}>Back</button>
          <button style={{ ...S.btn, flex: 1, opacity: position && experience ? 1 : 0.3 }} disabled={!position || !experience} onClick={() => setStep(2)}>Continue</button>
        </div>
      </div>
    );
  }

  return (
    <div style={S.screen}>
      <div style={S.label}>STEP 3 OF 3</div>
      <h1 style={{ ...S.h1, fontSize: 22 }}>What to work on</h1>
      <p style={S.subtitle}>Spirit will prioritize these and adapt as you train.</p>
      <div style={{ marginBottom: 20 }}>
        <div style={S.label}>TOP PRIORITY (pick one)</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {sportConfig.skills.slice(0, 8).map((s) => (
            <button key={s} style={S.chip(topPriority === s)} onClick={() => setTopPriority(s)}>{s}</button>
          ))}
        </div>
      </div>
      <div style={{ marginBottom: 24 }}>
        <div style={S.label}>KNOWN WEAKNESSES (select all)</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {sportConfig.skills.map((s) => (
            <button key={s} style={S.chip(weaknesses.includes(s))}
              onClick={() => setWeaknesses(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])}>{s}</button>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button style={S.btnSm} onClick={() => setStep(1)}>Back</button>
        <button style={{ ...S.btn, flex: 1, opacity: topPriority ? 1 : 0.3 }} disabled={!topPriority}
          onClick={() => onComplete({ sport, position, experience, daysPerWeek, topPriority, weaknesses, createdAt: new Date().toISOString() })}>
          Start training with Spirit
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// PLAN SCREEN
// ============================================================================
function PlanScreen({ profile, plan, reflections, onGenerate }) {
  if (!plan) {
    return (
      <div style={S.screen}>
        <div style={{ textAlign: "center", paddingTop: 60 }}>
          <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>{SPORTS[profile.sport]?.emoji}</div>
          <h2 style={S.h2}>Ready to train?</h2>
          <p style={{ ...S.subtitle, marginBottom: 24 }}>
            Spirit will build today's plan{reflections.length > 0 ? ` from ${reflections.length} past sessions` : ""}.
          </p>
          <button style={S.btn} onClick={onGenerate}>Generate today's plan</button>
        </div>
      </div>
    );
  }

  const totalMin = plan.drills.reduce((sum, d) => sum + (parseInt(d.duration) || 0), 0);

  return (
    <div style={S.screen}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <div style={S.label}>{plan.dayName?.toUpperCase()}'S PLAN</div>
          <h1 style={{ ...S.h1, fontSize: 24 }}>{plan.sessionFocus}</h1>
        </div>
        <div style={{ display: "flex", gap: 6, flexShrink: 0, marginTop: 4 }}>
          <span style={S.tag(plan.intensity === "High" ? T.danger : plan.intensity === "Low" ? T.blue : T.warn)}>{plan.intensity}</span>
          <span style={S.tag(T.textDim)}>{totalMin}m</span>
        </div>
      </div>

      <div style={{
        background: `${T.accent}06`, borderLeft: `3px solid ${T.accent}40`,
        borderRadius: "0 10px 10px 0", padding: "12px 16px", marginBottom: 20,
        fontSize: 13, color: T.textSoft, lineHeight: 1.6,
      }}>
        {plan.adaptationNote}
      </div>

      {plan.insight && (
        <div style={{
          background: `${plan.insight.type === "warning" ? T.warn : plan.insight.type === "positive" ? T.accent : T.blue}08`,
          border: `1px solid ${plan.insight.type === "warning" ? T.warn : plan.insight.type === "positive" ? T.accent : T.blue}20`,
          borderRadius: 12, padding: 16, marginBottom: 16,
        }}>
          <div style={{ ...S.label, color: plan.insight.type === "warning" ? T.warn : T.accent, marginBottom: 6 }}>SPIRIT INSIGHT</div>
          <div style={{ fontSize: 13, color: T.textSoft, lineHeight: 1.6 }}>{plan.insight.text}</div>
        </div>
      )}

      <div style={S.card}>
        <div style={S.label}>SESSION DRILLS</div>
        {plan.drills.map((drill, i) => (
          <div key={i} style={{ display: "flex", gap: 14, padding: "14px 0", borderBottom: i < plan.drills.length - 1 ? `1px solid ${T.border}08` : "none" }}>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, fontWeight: 700, color: T.accent, minWidth: 24, paddingTop: 2 }}>
              {String(i + 1).padStart(2, "0")}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{drill.name}</div>
              <div style={{ display: "flex", gap: 10, fontSize: 12, color: T.textDim }}>
                <span>{drill.duration}</span>
                {drill.notes && <span style={{ color: T.textSoft }}>{drill.notes}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: "center", marginTop: 8 }}>
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: T.textDim }}>
          Adapted from {plan.basedOnReflections} session{plan.basedOnReflections !== 1 ? "s" : ""}
          {plan.persistentWeaknesses?.length > 0 && ` \u00B7 Targeting: ${plan.persistentWeaknesses.join(", ")}`}
        </span>
      </div>

      <button style={{ ...S.btnOutline, marginTop: 20 }} onClick={onGenerate}>
        Regenerate plan
      </button>
    </div>
  );
}

// ============================================================================
// REFLECT SCREEN
// ============================================================================
function ReflectScreen({ profile, reflections, onSubmit }) {
  const [performance, setPerformance] = useState(null);
  const [energy, setEnergy] = useState(null);
  const [sessionType, setSessionType] = useState("");
  const [whatWorked, setWhatWorked] = useState("");
  const [struggled, setStruggled] = useState("");
  const [weaknessFlags, setWeaknessFlags] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  const sportConfig = SPORTS[profile.sport];

  const handleSubmit = () => {
    onSubmit({
      id: `ref_${Date.now()}`,
      date: new Date().toISOString(),
      performance, energy, sessionType, whatWorked, struggled,
      weaknesses: weaknessFlags,
    });
    setSubmitted(true);
  };

  const reset = () => {
    setSubmitted(false); setPerformance(null); setEnergy(null);
    setSessionType(""); setWhatWorked(""); setStruggled(""); setWeaknessFlags([]);
  };

  if (submitted) {
    return (
      <div style={S.screen}>
        <div style={{ textAlign: "center", paddingTop: 48 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>{"\u2705"}</div>
          <h2 style={S.h2}>Session logged</h2>
          <p style={{ ...S.subtitle, marginBottom: 8 }}>Spirit now has {reflections.length} sessions of data on you.</p>
          <p style={{ fontSize: 13, color: T.textDim, marginBottom: 32 }}>Your next plan will adapt based on what you just reported.</p>
          <button style={S.btnOutline} onClick={reset}>Log another session</button>
        </div>
        {reflections.length > 1 && (
          <div style={{ marginTop: 36 }}>
            <div style={S.label}>RECENT SESSIONS</div>
            {reflections.slice(-5).reverse().map((r) => (
              <div key={r.id} style={{ ...S.card, padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: T.textDim }}>{new Date(r.date).toLocaleDateString()}</span>
                  <div style={{ display: "flex", gap: 6 }}>
                    <span style={S.tag(r.performance >= 4 ? T.accent : r.performance >= 3 ? T.warn : T.danger)}>Perf: {r.performance}/5</span>
                  </div>
                </div>
                {r.struggled && <div style={{ fontSize: 13, color: T.textSoft }}>{r.struggled}</div>}
                {r.weaknesses?.length > 0 && (
                  <div style={{ display: "flex", gap: 4, marginTop: 6, flexWrap: "wrap" }}>
                    {r.weaknesses.map(w => <span key={w} style={S.tag(T.warn)}>{w}</span>)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={S.screen}>
      <h1 style={{ ...S.h1, fontSize: 22 }}>Post-Session Reflection</h1>
      <p style={S.subtitle}>60 seconds. This is how Spirit learns you.</p>

      <div style={{ marginBottom: 22 }}>
        <div style={S.label}>HOW DID YOU PERFORM?</div>
        <div style={{ display: "flex", gap: 8 }}>
          {[1,2,3,4,5].map(n => <button key={n} style={S.dot(performance === n, n-1)} onClick={() => setPerformance(n)}>{n}</button>)}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 10, color: T.textDim, fontFamily: "'Space Mono', monospace" }}>
          <span>Poor</span><span>Great</span>
        </div>
      </div>

      <div style={{ marginBottom: 22 }}>
        <div style={S.label}>ENERGY LEVEL</div>
        <div style={{ display: "flex", gap: 8 }}>
          {[1,2,3,4,5].map(n => <button key={n} style={S.dot(energy === n, n-1)} onClick={() => setEnergy(n)}>{n}</button>)}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 10, color: T.textDim, fontFamily: "'Space Mono', monospace" }}>
          <span>Drained</span><span>Full</span>
        </div>
      </div>

      <div style={{ marginBottom: 22 }}>
        <div style={S.label}>SESSION TYPE</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {sportConfig.sessionTypes.map(t => <button key={t} style={S.chip(sessionType === t)} onClick={() => setSessionType(t)}>{t}</button>)}
        </div>
      </div>

      <div style={{ marginBottom: 18 }}>
        <div style={S.label}>WHAT WENT WELL?</div>
        <input style={S.input} value={whatWorked} onChange={e => setWhatWorked(e.target.value)} placeholder="e.g. My passing was sharp today" />
      </div>

      <div style={{ marginBottom: 18 }}>
        <div style={S.label}>WHAT FELT OFF?</div>
        <input style={S.input} value={struggled} onChange={e => setStruggled(e.target.value)} placeholder="e.g. First touch was sloppy under pressure" />
      </div>

      <div style={{ marginBottom: 24 }}>
        <div style={S.label}>AREAS THAT NEED WORK</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {sportConfig.skills.map(s => (
            <button key={s} style={S.chip(weaknessFlags.includes(s))}
              onClick={() => setWeaknessFlags(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])}>{s}</button>
          ))}
        </div>
      </div>

      <button style={{ ...S.btn, opacity: performance && energy ? 1 : 0.3 }} disabled={!performance || !energy} onClick={handleSubmit}>
        Log session
      </button>
    </div>
  );
}

// ============================================================================
// PROGRESS SCREEN
// ============================================================================
function ProgressScreen({ profile, reflections }) {
  if (reflections.length === 0) {
    return (
      <div style={S.screen}>
        <div style={{ textAlign: "center", paddingTop: 60 }}>
          <div style={{ fontSize: 40, opacity: 0.3, marginBottom: 12 }}>{"\uD83D\uDCCA"}</div>
          <h2 style={S.h2}>No data yet</h2>
          <p style={S.subtitle}>Complete sessions and Spirit will show patterns.</p>
        </div>
      </div>
    );
  }

  const perfScores = reflections.filter(r => r.performance).map(r => r.performance);
  const energyScores = reflections.filter(r => r.energy).map(r => r.energy);
  const avgPerf = perfScores.reduce((a,b) => a+b, 0) / perfScores.length;
  const avgEnergy = energyScores.reduce((a,b) => a+b, 0) / energyScores.length;
  
  const weaknessCount = {};
  reflections.forEach(r => (r.weaknesses || []).forEach(w => { weaknessCount[w] = (weaknessCount[w] || 0) + 1; }));
  const sortedWeaknesses = Object.entries(weaknessCount).sort((a,b) => b[1] - a[1]);

  const first5 = perfScores.slice(0, Math.min(5, perfScores.length));
  const last5 = perfScores.slice(-Math.min(5, perfScores.length));
  const trend = (last5.reduce((a,b) => a+b, 0) / last5.length) - (first5.reduce((a,b) => a+b, 0) / first5.length);

  return (
    <div style={S.screen}>
      <h1 style={{ ...S.h1, fontSize: 22 }}>Your Progress</h1>
      <p style={S.subtitle}>{reflections.length} sessions logged</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
        {[
          { val: avgPerf.toFixed(1), label: "Avg Perf", color: T.accent },
          { val: avgEnergy.toFixed(1), label: "Avg Energy", color: T.blue },
          { val: `${trend > 0 ? "+" : ""}${trend.toFixed(1)}`, label: "Trend", color: trend > 0 ? T.accent : trend < 0 ? T.danger : T.textSoft },
        ].map((s, i) => (
          <div key={i} style={{ ...S.card, textAlign: "center", padding: 16, marginBottom: 0 }}>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 24, fontWeight: 700, color: s.color }}>{s.val}</div>
            <div style={{ fontSize: 10, color: T.textDim, marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {sortedWeaknesses.length > 0 && (
        <div style={S.card}>
          <div style={S.label}>RECURRING WEAKNESSES</div>
          <div style={{ fontSize: 12, color: T.textDim, marginBottom: 14, marginTop: -4 }}>
            Skills flagged across sessions. Spirit prioritizes these.
          </div>
          {sortedWeaknesses.map(([skill, count]) => (
            <div key={skill} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{skill}</div>
                <div style={S.progress}><div style={S.progressFill(count / reflections.length * 100)} /></div>
              </div>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: T.textDim }}>{count}/{reflections.length}</span>
            </div>
          ))}
        </div>
      )}

      <div style={S.card}>
        <div style={S.label}>SESSION LOG</div>
        {reflections.slice().reverse().slice(0, 10).map(r => (
          <div key={r.id} style={{ padding: "10px 0", borderBottom: `1px solid ${T.border}08`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 12, color: T.textDim }}>{new Date(r.date).toLocaleDateString()}</div>
              {r.sessionType && <div style={{ fontSize: 13, color: T.textSoft }}>{r.sessionType}</div>}
            </div>
            <span style={S.tag(r.performance >= 4 ? T.accent : r.performance >= 3 ? T.warn : T.danger)}>{r.performance}/5</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN APP
// ============================================================================
export default function SpiritCoach() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [reflections, setReflections] = useState([]);
  const [planHistory, setPlanHistory] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [tab, setTab] = useState("plan");

  useEffect(() => {
    const p = loadData("profile", null);
    const r = loadData("reflections", []);
    const h = loadData("plans", []);
    if (p) setProfile(p);
    setReflections(r);
    setPlanHistory(h);
    
    if (h.length > 0) {
      const latest = h[h.length - 1];
      if (new Date(latest.date).toDateString() === new Date().toDateString()) {
        setCurrentPlan(latest);
      }
    }
    setLoading(false);
  }, []);

  const handleSetup = (p) => { setProfile(p); saveData("profile", p); setTab("plan"); };
  
  const handleGenerate = () => {
    const plan = generateAdaptivePlan(profile, reflections, planHistory);
    setCurrentPlan(plan);
    const newHistory = [...planHistory, plan];
    setPlanHistory(newHistory);
    saveData("plans", newHistory);
  };

  const handleReflect = (r) => {
    const updated = [...reflections, r];
    setReflections(updated);
    saveData("reflections", updated);
    setCurrentPlan(null);
  };

  const handleReset = () => {
    localStorage.removeItem("spirit_profile");
    localStorage.removeItem("spirit_reflections");
    localStorage.removeItem("spirit_plans");
    setProfile(null); setReflections([]); setPlanHistory([]); setCurrentPlan(null); setTab("plan");
  };

  if (loading) {
    return (
      <div style={{ ...S.app, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ ...S.logo, fontSize: 18, marginBottom: 8 }}>SPIRIT</div>
          <div style={{ fontSize: 12, color: T.textDim }}>Loading...</div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={S.app}>
        <div style={S.header}><span style={S.logo}>SPIRIT</span></div>
        <SetupScreen onComplete={handleSetup} />
      </div>
    );
  }

  return (
    <div style={S.app}>
      <div style={S.header}>
        <span style={S.logo}>SPIRIT</span>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={S.tag(T.accent)}>{SPORTS[profile.sport]?.emoji} {profile.position}</span>
          <button style={{ background: "none", border: "none", color: T.textDim, fontSize: 16, cursor: "pointer", padding: 4 }}
            onClick={handleReset} title="Reset">{"\u2699\uFE0F"}</button>
        </div>
      </div>

      {tab === "plan" && <PlanScreen profile={profile} plan={currentPlan} reflections={reflections} onGenerate={handleGenerate} />}
      {tab === "reflect" && <ReflectScreen profile={profile} reflections={reflections} onSubmit={handleReflect} />}
      {tab === "progress" && <ProgressScreen profile={profile} reflections={reflections} />}

      <div style={S.bottomNav}>
        {[
          { id: "plan", icon: "\u26A1", label: "Plan" },
          { id: "reflect", icon: "\uD83D\uDCDD", label: "Reflect" },
          { id: "progress", icon: "\uD83D\uDCCA", label: "Progress" },
        ].map(n => (
          <button key={n.id} style={S.navItem(tab === n.id)} onClick={() => setTab(n.id)}>
            <span style={{ fontSize: 20 }}>{n.icon}</span><span>{n.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
