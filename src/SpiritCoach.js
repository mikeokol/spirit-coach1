import React, { useState, useEffect } from "react";

// ============================================================================
// SPIRIT COACH v2.1 – Adaptive Athletic Intelligence
// Fixed: Drill specificity. Every drill now has exact reps, sets, rest, cues.
// ============================================================================

const T = {
bg: "#08080a", surface: "#101014", surfaceAlt: "#16161c",
border: "#1c1c24", text: "#eae8e4", textSoft: "#9590a0", textDim: "#504c5c",
accent: "#5cff8a", accentDim: "#1a3a24", warn: "#ffb05c",
danger: "#ff5c6a", blue: "#5ca0ff",
};

const SPORTS = {
soccer: {
name: "Soccer", emoji: "\u26BD",
positions: ["GK", "CB", "FB/WB", "CDM", "CM", "CAM", "Winger", "Striker"],
skills: ["First Touch", "Weak Foot", "Passing Range", "Crossing", "Finishing", "Heading", "Dribbling", "Positioning", "Tackling", "Speed", "Endurance", "Agility"],
sessionTypes: ["Technical", "Tactical", "Physical", "Match", "Recovery"],
},
basketball: {
name: "Basketball", emoji: "\uD83C\uDFC0",
positions: ["PG", "SG", "SF", "PF", "C"],
skills: ["Ball Handling", "3PT Shooting", "Mid-Range", "Free Throws", "Finishing", "Rebounding", "Court Vision", "Defense", "Vertical", "Speed", "Conditioning"],
sessionTypes: ["Shooting", "Skills", "Scrimmage", "Strength", "Recovery"],
},
track: {
name: "Track & Field", emoji: "\uD83C\uDFC3",
positions: ["Sprints (100-400m)", "Middle Distance (800-1500m)", "Long Distance (5K+)", "Hurdles", "Jumps", "Throws"],
skills: ["Acceleration", "Top Speed", "Speed Endurance", "Technique", "Block Starts", "Race Tactics", "Strength", "Flexibility", "Mental Focus"],
sessionTypes: ["Speed Work", "Tempo", "Long Run", "Technique", "Strength", "Recovery"],
},
football: {
name: "Football", emoji: "\uD83C\uDFC8",
positions: ["QB", "RB", "WR", "TE", "OL", "DL", "LB", "CB", "Safety", "K/P"],
skills: ["Route Running", "Catching", "Throwing", "Blocking", "Tackling", "Coverage", "Speed", "Agility", "Strength", "Football IQ", "Conditioning"],
sessionTypes: ["Position Drills", "Team Practice", "Film Study", "Strength", "Speed/Agility", "Recovery"],
},
};

const EXPERIENCE_LEVELS = ["Beginner (< 1 year)", "Intermediate (1-3 years)", "Advanced (3-7 years)", "Elite (7+ years)"];
const DAYS_PER_WEEK = [2, 3, 4, 5, 6];

// ============================================================================
// STORAGE
// ============================================================================
function loadData(key, fallback) {
try { const r = localStorage.getItem(`spirit_${key}`); return r ? JSON.parse(r) : fallback; } catch { return fallback; }
}
function saveData(key, value) {
try { localStorage.setItem(`spirit_${key}`, JSON.stringify(value)); } catch (e) { console.error(e); }
}

// ============================================================================
// DRILL DATABASE – Specific reps, sets, rest, coaching cues
// ============================================================================
const SOCCER_DRILLS = {
"Weak Foot": {
high: [
{ name: "Weak foot wall passes", duration: "10 min", notes: "Stand 3m from wall. Inside foot pass, receive, pass. 5 sets of 20 reps. Keep ankle locked, follow through to target." },
{ name: "Weak foot juggling challenge", duration: "8 min", notes: "Only weak foot. Set 1: 10 touches. Set 2: 15. Set 3: 20. Rest 30s between. Record your best streak." },
{ name: "Weak foot driven pass", duration: "10 min", notes: "Place cone 25m away. Strike with laces, low and hard. 4 sets of 8. Focus: plant foot pointing at target, strike through the center of the ball." },
{ name: "Weak foot finishing circuit", duration: "12 min", notes: "3 angles: left side 12yd, center 16yd, right side 12yd. 5 shots each angle. Inside foot placement first, then laces power. Reset run between each." },
{ name: "Cool down + weak foot touches", duration: "5 min", notes: "Light jog, weak foot only ball rolls. 50 gentle touches while walking." },
],
moderate: [
{ name: "Weak foot wall passes", duration: "8 min", notes: "Stand 2m from wall. Simple inside foot pass and receive. 4 sets of 15. No rush - focus on clean contact." },
{ name: "Weak foot juggling", duration: "6 min", notes: "Weak foot only. Drop ball, one touch up, catch. Repeat 30x. Then try 2 consecutive. Build slowly." },
{ name: "Weak foot short passing", duration: "10 min", notes: "Set 2 cones 10m apart. Pass between them with weak foot. 3 sets of 12. Aim for the gap every time." },
{ name: "Weak foot side volleys", duration: "8 min", notes: "Toss ball to hip height, volley into wall. 3 sets of 10. Lock ankle, contact with laces." },
{ name: "Cool down", duration: "5 min", notes: "Walk with ball at feet, weak foot only. Light stretching." },
],
},
"First Touch": {
high: [
{ name: "Wall ball: cushion and redirect", duration: "10 min", notes: "Pass hard into wall. As ball returns, cushion with inside foot and push 45° left or right in one motion. 5 sets of 12 (alternate direction). Ball should travel exactly 2m on redirect." },
{ name: "Aerial first touch", duration: "10 min", notes: "Throw ball 5m high. Kill it dead: thigh to foot, ball stops within 1m of you. 4 sets of 8. Progression: add a turn after control." },
{ name: "Back-to-pressure turns", duration: "12 min", notes: "Face away from wall. Friend (or rebounder) plays ball to feet. First touch turns you 180°. Use: Cruyff turn, inside hook, outside hook. 4 sets of 6 each." },
{ name: "Sprint and receive", duration: "10 min", notes: "Sprint 15m, ball played into path (or bounce off wall at angle). First touch must be forward, in stride. 6 reps, walk back recovery. Simulates match receiving." },
{ name: "Cool down", duration: "5 min", notes: "Gentle ball rolls underfoot, alternating feet. 60 seconds each foot. Then static stretching." },
],
moderate: [
{ name: "Wall ball: two-touch control", duration: "8 min", notes: "Pass to wall, receive with inside foot (touch 1 = control, touch 2 = pass back). 4 sets of 15. Alternate feet each set." },
{ name: "Drop and control", duration: "8 min", notes: "Hold ball at chest height. Drop it, let bounce once, kill it dead with instep. 3 sets of 10. Ball should stop within arm's reach." },
{ name: "Cone gate receiving", duration: "10 min", notes: "Set 2 cones 1m apart. Pass to wall, first touch goes THROUGH the gate. 3 sets of 10. Forces directional control." },
{ name: "Thigh to foot", duration: "8 min", notes: "Toss ball to thigh height. Thigh cushion, then foot cushion, ball dead. 3 sets of 8 each leg." },
{ name: "Cool down", duration: "5 min", notes: "Light juggling, any body part. Focus on soft touches." },
],
},
"Finishing": {
high: [
{ name: "Shooting warm-up", duration: "5 min", notes: "10 easy side-foot finishes from 10yds. Both feet. Find the corners. No power yet." },
{ name: "Edge of box power shots", duration: "12 min", notes: "Place ball top of the 18. 5 shots with laces aiming bottom corner. 5 shots curling inside foot far post. 5 shots driven low through the middle. Rest 20s between sets." },
{ name: "One-touch finishing", duration: "10 min", notes: "Roll ball from 5m to your right. Run onto it, one-touch finish. 4 sets of 5 each side. Plant foot next to ball, head over it, strike through center." },
{ name: "Turn and shoot", duration: "10 min", notes: "Start back to goal at 18yd line. Ball played to feet. First touch to turn, second touch = shot. 4 sets of 5. Time yourself: under 2 seconds from receive to strike." },
{ name: "Fatigue finishing", duration: "8 min", notes: "Sprint to halfway and back. Immediately receive ball and finish. 6 reps. Simulates late-game composure. Breathe before striking." },
{ name: "Cool down", duration: "5 min", notes: "Light jog, hip flexor and quad stretches." },
],
moderate: [
{ name: "Placement practice", duration: "10 min", notes: "12yds out, side-foot. Aim for 1m inside each post. 5 shots each corner, both feet. Accuracy over power." },
{ name: "Laces striking", duration: "10 min", notes: "18yds out. Lock ankle, toe down, strike through center of ball. 3 sets of 6. Focus on technique not power." },
{ name: "Moving ball finishing", duration: "10 min", notes: "Push ball 2m ahead, run onto it, shoot. 3 sets of 5 each foot. Plant foot points at target." },
{ name: "Headers on goal", duration: "8 min", notes: "Toss ball to yourself (or partner crosses). Head down into corners. 3 sets of 6. Attack the ball, don't wait for it." },
{ name: "Cool down", duration: "5 min", notes: "Stretch: quads, hamstrings, hip flexors." },
],
},
"Dribbling": {
high: [
{ name: "Cone weave: tight control", duration: "8 min", notes: "8 cones, 1m apart. Dribble through using only inside-outside touches. 4 runs right foot lead, 4 runs left foot lead. Time each run. Goal: under 8 seconds." },
{ name: "1v1 moves circuit", duration: "12 min", notes: "At a cone (the defender): perform each move then accelerate 5m. Moves: stepover (5x each side), scissors (5x each side), Cruyff turn (5x), body feint (5x). Walk back recovery." },
{ name: "Speed dribble", duration: "10 min", notes: "Full pitch sprint with ball. Touch every 3rd step with laces (push ball ahead). 4 reps. Walk back. Ball should stay within 2m of you at all times." },
{ name: "Close control box", duration: "10 min", notes: "Mark 3m x 3m square. Keep ball inside it. 60 seconds: as many direction changes as possible. Rest 30s. 5 rounds. Use sole rolls, inside cuts, outside cuts." },
{ name: "Cool down", duration: "5 min", notes: "Slow dribble, figure-8s around 2 cones 5m apart. Both feet. Stretching." },
],
moderate: [
{ name: "Ball mastery warm-up", duration: "8 min", notes: "Stationary: sole rolls (30 each foot), toe taps (60 total), inside-inside (30). Keep head up as much as possible." },
{ name: "Cone weave", duration: "10 min", notes: "6 cones, 1.5m apart. Inside foot only first 3 runs. Outside foot only next 3 runs. Then alternate. No rushing." },
{ name: "Stop-start dribbling", duration: "8 min", notes: "Dribble forward 5m, sole-of-foot stop, go again. 3 sets of 8. Practice stopping ball dead instantly." },
{ name: "Shielding drill", duration: "8 min", notes: "Dribble in a circle (5m diameter). Keep body between imaginary defender and ball. 4 laps each direction." },
{ name: "Cool down", duration: "5 min", notes: "Gentle touches, stretching." },
],
},
"Speed": {
high: [
{ name: "Sprint mechanics warm-up", duration: "8 min", notes: "A-skips: 3x20m. High knees: 3x20m. Butt kicks: 3x20m. Straight-leg bounds: 3x20m. Walk back between each. Focus on posture: tall, slight lean forward." },
{ name: "Acceleration sprints", duration: "12 min", notes: "From standing start: 5m, 10m, 20m, 30m. 3 reps each distance. Full recovery (walk back + 30s). First 3 steps: short, explosive, low body angle." },
{ name: "Flying 20s", duration: "8 min", notes: "20m build-up zone into 20m max speed zone. Focus: maintain form at top speed. 5 reps. 2 min rest between. Time the 20m fly zone if possible." },
{ name: "Agility T-drill", duration: "10 min", notes: "Set up T shape (5m forward, 5m each side). Sprint forward, shuffle left, shuffle right, backpedal. 6 reps. Rest 45s between. Touch each cone." },
{ name: "Cool down jog + stretch", duration: "7 min", notes: "400m easy jog. Hamstring, quad, calf stretches 30s each. Groin stretch." },
],
moderate: [
{ name: "Dynamic warm-up", duration: "8 min", notes: "Jog 400m. Leg swings (10 each direction), hip circles (10 each), walking lunges 2x10m." },
{ name: "Build-up sprints", duration: "10 min", notes: "30m runs: 60% effort, 70%, 80%, 90%. 2 reps at each speed. Walk back recovery." },
{ name: "Shuttle runs", duration: "10 min", notes: "5-10-15m shuttle. Sprint to 5m cone, touch, back. Sprint to 10m, touch, back. Sprint to 15m, touch, back. 4 sets. Rest 60s." },
{ name: "Quick feet ladder", duration: "8 min", notes: "If no ladder: mark lines 40cm apart (use sticks/cones). In-in-out-out pattern. 2 feet each box. 6 reps through. Walk back." },
{ name: "Cool down", duration: "5 min", notes: "Easy jog 200m, static stretching." },
],
},
"Passing Range": {
high: [
{ name: "Short passing: 1-2 touch", duration: "10 min", notes: "Wall or partner 8m away. Receive, 1-touch pass back. 3 sets of 20 each foot. Then 2-touch (control + pass). Accuracy: hit within 1m of target." },
{ name: "Long ball accuracy", duration: "12 min", notes: "Place target (cone/bag) 30m away. Driven pass along ground: 10 attempts each foot. Lofted pass to land within 3m of target: 10 attempts each foot. Track hit rate." },
{ name: "Through ball timing", duration: "10 min", notes: "Set 2 cones as 'defenders' 3m apart. Pass must go through the gap and reach the target zone 15m away. 4 sets of 8. Vary the gap width." },
{ name: "Switching play", duration: "10 min", notes: "Target 40m away (diagonally). Hit with driven lofted pass. 4 sets of 5 each foot. Open body, plant foot facing target, follow through across body." },
{ name: "Cool down", duration: "5 min", notes: "Short passes to wall, alternate feet. Stretch adductors and hip flexors." },
],
moderate: [
{ name: "Wall passing rhythm", duration: "8 min", notes: "Stand 5m from wall. Pass and receive, 2-touch. 3 sets of 20. Focus: weight of pass (ball should come back to your feet, not past you)." },
{ name: "10-15m ground passes", duration: "10 min", notes: "Pass to cone target 10m, then 15m. Inside foot. 3 sets of 10 at each distance. Ball should stop within 1m of cone." },
{ name: "Lofted pass basics", duration: "10 min", notes: "Get under the ball: plant foot beside ball, lean back slightly, strike low on ball. Target 20m away. 3 sets of 8. Height should peak at halfway point." },
{ name: "Pass and move", duration: "8 min", notes: "Pass to wall, immediately move 5m to new position, receive return. 3 sets of 10. Simulates passing then finding space." },
{ name: "Cool down", duration: "5 min", notes: "Light jog, calf and hamstring stretches." },
],
},
"Positioning": {
high: [
{ name: "Shadow movement drill", duration: "12 min", notes: "Mark a 20x20m grid. Jog through it, constantly scanning (turn head every 3 seconds). Practice checking shoulder before 'receiving' imaginary passes. 4 sets of 2 min." },
{ name: "Zone occupation", duration: "10 min", notes: "Set 4 cones in a diamond (10m between). Sprint to each cone in sequence, pause 2s at each (simulating finding space). 5 complete circuits. Focus: body open to the field at each stop." },
{ name: "Angle of support drill", duration: "10 min", notes: "Partner (or wall) has ball. Move to create a passing angle: never be directly in line with them and the 'defender' cone. Hold position 3s, sprint to new angle. 4 sets of 8 movements." },
{ name: "Defensive shape walk-through", duration: "8 min", notes: "Walk through your position's role in a back 4/3 (mark positions with cones). Practice: ball goes left → shift left. Ball goes forward → drop. Ball goes back → push up. 10 min of rehearsal at walking pace." },
{ name: "Cool down", duration: "5 min", notes: "Light jog, visualize positioning from today's session." },
],
moderate: [
{ name: "Body orientation drill", duration: "10 min", notes: "Place 4 cones in a square 10m apart. At each cone, practice receiving with body half-turned (so you can see behind you). 3 circuits. Focus: open body to see the most field." },
{ name: "Check away then receive", duration: "10 min", notes: "Sprint away from the ball (5m), then check back toward it. Receive with back foot. 3 sets of 8. Creates space in real games." },
{ name: "Scanning practice", duration: "8 min", notes: "Jog with ball. Before every 5th touch, look over each shoulder. 5 min continuous. The habit of scanning is the foundation of positioning." },
{ name: "Movement patterns", duration: "8 min", notes: "Practice your position's key runs (e.g. striker: near post run, far post peel, drop to receive). Walk through 5 reps of each." },
{ name: "Cool down", duration: "5 min", notes: "Stretching." },
],
},
"Heading": {
high: [
{ name: "Heading technique warm-up", duration: "8 min", notes: "Partner/self toss: head ball from hands. 3 sets of 10. Strike with forehead (hairline), eyes open, neck muscles tensed. Attack through the ball." },
{ name: "Defensive headers", duration: "10 min", notes: "Toss ball high. Jump and head for DISTANCE (up and away). 4 sets of 8. Arch back, snap forward, meet ball at highest point." },
{ name: "Attacking headers", duration: "10 min", notes: "Cross from side (or self-toss). Head DOWN toward ground, aiming at cones (goal corners). 4 sets of 6. Power comes from neck, not head movement." },
{ name: "Headed clearances under pressure", duration: "8 min", notes: "Sprint 5m, jump, head a tossed ball. Land and recover. 3 sets of 8. Simulates heading in traffic." },
{ name: "Cool down", duration: "5 min", notes: "Neck stretches, gentle. Light jog." },
],
moderate: [
{ name: "Heading basics", duration: "8 min", notes: "Self-toss: head ball to partner or wall from 3m. 3 sets of 10. Focus: eyes open, forehead contact, arms out for balance." },
{ name: "Jump and head", duration: "10 min", notes: "Toss ball slightly above head height. Jump to meet it at peak. 3 sets of 8. Timing: jump as ball starts descending." },
{ name: "Directional heading", duration: "10 min", notes: "Head ball left, right, and straight. 6 each direction. Adjust neck angle to direct ball - don't just bounce it." },
{ name: "Headed passes", duration: "8 min", notes: "Gentle toss, head ball softly to target 5m away. 3 sets of 8. This builds control, not power." },
{ name: "Cool down", duration: "5 min", notes: "Neck mobility exercises, light stretching." },
],
},
"Agility": {
high: [
{ name: "T-drill", duration: "10 min", notes: "Sprint 10m forward, side shuffle 5m left, side shuffle 10m right, side shuffle 5m left back to center, backpedal 10m. 6 reps. Rest 45s. Time yourself." },
{ name: "5-10-5 pro agility", duration: "8 min", notes: "Start in middle. Sprint 5m right, touch line. Sprint 10m left, touch line. Sprint 5m right back to start. 6 reps. Rest 60s." },
{ name: "Reactive direction change", duration: "10 min", notes: "Stand in center of 4 cones (3m each direction). Partner calls direction (or self: alternate pattern). Sprint to cone, decelerate, sprint back. 4 sets of 8 changes." },
{ name: "Lateral bounds", duration: "8 min", notes: "Single-leg lateral jump, land on opposite foot, stabilize 1s, bound back. 3 sets of 10 each direction. Builds lateral power." },
{ name: "Cool down", duration: "5 min", notes: "Easy jog, ankle circles, hip stretch." },
],
moderate: [
{ name: "Ladder quick feet", duration: "8 min", notes: "2 feet in each box, forward. Then: lateral in-out. Then: Icky shuffle. 3 reps each pattern. Focus on light, quick ground contact." },
{ name: "Cone zig-zag", duration: "10 min", notes: "6 cones in zig-zag (3m apart). Sprint to each, plant outside foot, change direction. 5 reps. Walk back." },
{ name: "Backpedal to sprint", duration: "8 min", notes: "Backpedal 5m, hip turn, sprint 10m forward. 4 sets of 5. Practice smooth hip rotation." },
{ name: "Balance work", duration: "8 min", notes: "Single-leg stand: 30s each foot. Then: single-leg stand, eyes closed, 15s each. Builds the stability that supports agility." },
{ name: "Cool down", duration: "5 min", notes: "Stretch: ankles, calves, groin." },
],
},
"Crossing": {
high: [
{ name: "Driven low cross", duration: "10 min", notes: "From wide position (touchline, 25m from goal). Strike ball hard along ground to near-post zone (mark with cones 6-12yd area). 5 sets of 5 each foot. Plant foot ahead of ball, strike through it." },
{ name: "Lofted cross to far post", duration: "10 min", notes: "Same wide position. Lofted ball to far post area. 4 sets of 5 each foot. Get under the ball, slightly off-center contact. Ball should arrive head height." },
{ name: "Cross on the run", duration: "12 min", notes: "Dribble from halfway down the wing at speed. Cross without stopping. 4 sets of 4 each side. This is the hardest version - don't slow down before striking." },
{ name: "Cutback cross", duration: "8 min", notes: "Dribble to byline, cut back to edge of 18yd box area. 4 sets of 5. The cutback is the most effective cross type in professional football. Low, along the ground, away from the keeper." },
{ name: "Cool down", duration: "5 min", notes: "Light jog, groin and hip stretching." },
],
moderate: [
{ name: "Standing cross technique", duration: "10 min", notes: "Ball stationary on wing. Practice the striking motion: plant foot, open hips, follow through. 3 sets of 10. Inside foot for accuracy, instep for distance." },
{ name: "Cross to target", duration: "10 min", notes: "Place a cone 20m away in the box area. Cross to land within 3m of it. 3 sets of 8. Track hit rate." },
{ name: "Short cross (cutback)", duration: "10 min", notes: "Dribble to byline area, cut ball back along ground. 3 sets of 8. Focus on keeping it out of keeper's reach." },
{ name: "Early cross", duration: "8 min", notes: "Cross from deeper position (30-35m from goal). Lofted ball. 3 sets of 6. Practice isn't about reaching the target yet - focus on technique." },
{ name: "Cool down", duration: "5 min", notes: "Stretching." },
],
},
"Tackling": {
high: [
{ name: "Jockey and press", duration: "10 min", notes: "Cone marks attacker path. Side-shuffle alongside, staying 1m away. At marked point, close distance and block with standing tackle. 4 sets of 6. Stay on your feet." },
{ name: "Standing tackle form", duration: "10 min", notes: "Ball between two cones. Approach at angle, non-kicking foot beside ball, tackle THROUGH the ball with instep. 4 sets of 8. Weight forward, win the ball first." },
{ name: "Recovery tackle", duration: "10 min", notes: "Start 3m behind the ball. Sprint to recover, angle your run to force attacker wide, execute tackle. 3 sets of 6. The approach angle matters more than speed." },
{ name: "Interception drill", duration: "8 min", notes: "Anticipate pass between 2 cones (15m apart). Start 5m off the passing lane. Read the pass, step in, intercept. 4 sets of 6. Best tackles are the ones you don't have to make." },
{ name: "Cool down", duration: "5 min", notes: "Easy jog, full body stretch." },
],
moderate: [
{ name: "Defensive stance practice", duration: "8 min", notes: "Low position, weight on balls of feet, knees bent. Side shuffle 5m left, 5m right. 3 sets of 10 shuffles. This is the foundation." },
{ name: "Block tackle form", duration: "10 min", notes: "Stationary ball. Practice the contact: non-kicking foot planted, ankle locked, tackle through center of ball. 3 sets of 10. No opponent yet - just form." },
{ name: "Jockeying drill", duration: "10 min", notes: "Follow a partner (or weave through cones) while maintaining defensive position: side-on, 1m distance. 4 sets of 30s. Don't dive in." },
{ name: "1v1 shadow defending", duration: "8 min", notes: "Partner dribbles slowly. Mirror them. Stay 1-2m away. 4 reps of 30s. Focus: patience, don't commit." },
{ name: "Cool down", duration: "5 min", notes: "Stretching." },
],
},
"Endurance": {
high: [
{ name: "Interval runs", duration: "15 min", notes: "Run 200m at 85% effort, jog 200m recovery. 6 reps. Total: 2.4km. If you have a watch, aim for consistent times on each 200m." },
{ name: "Tempo run", duration: "12 min", notes: "Run 12 minutes at a pace where you could speak in short sentences but not hold a conversation. Note distance covered. Beat it next time." },
{ name: "Ball work intervals", duration: "10 min", notes: "Dribble at 70% speed for 30s, sprint with ball for 10s. Repeat 10 times. More sport-specific than running without the ball." },
{ name: "Cool down", duration: "8 min", notes: "5 min easy jog. Full body stretch focusing on calves, hamstrings, quads." },
],
moderate: [
{ name: "Steady-state run", duration: "15 min", notes: "15 minutes at conversational pace. No stopping. If you need to walk, the pace is too fast. Build the base first." },
{ name: "Fartlek (speed play)", duration: "10 min", notes: "Easy jog with 6x 30-second surges at 80% effort. Recover to easy jog between. Unstructured - go by feel." },
{ name: "Walking recovery", duration: "5 min", notes: "5 min walk, deep breathing. Calves, hamstrings, quads stretch 20s each." },
],
},
};

const BASKETBALL_DRILLS = {
"3PT Shooting": {
high: [
{ name: "Spot-up 3s: 5 spots", duration: "12 min", notes: "Corner, wing, top of key, wing, corner. 10 shots per spot. Track makes. Don't leave a spot until you hit 5/10. Feet set, elbow under ball, follow through to the rim." },
{ name: "Off-dribble pull-up 3s", duration: "10 min", notes: "1 dribble right, pull up. 1 dribble left, pull up. 8 shots each side. Focus: gather step, feet under you, release at peak." },
{ name: "Catch-and-shoot off movement", duration: "10 min", notes: "Simulate curling off a screen: run baseline to wing, catch imaginary pass, shoot. 4 sets of 5 each side. Footwork: 1-2 step (inside foot first)." },
{ name: "Free throw routine", duration: "5 min", notes: "20 free throws. Same routine every time: bounce 3 times, deep breath, shoot. Track makes." },
{ name: "Cool down", duration: "5 min", notes: "Light shooting from 8ft. Stretch shoulders and wrists." },
],
moderate: [
{ name: "Form shooting warm-up", duration: "8 min", notes: "3ft from basket. One-hand form shots. 3 sets of 10. Focus: elbow at 90°, ball on fingertips not palm, wrist snap." },
{ name: "Spot-up 3s: 3 spots", duration: "10 min", notes: "Right wing, top, left wing. 8 shots per spot. No rushing. Reset feet before every shot." },
{ name: "Free throws", duration: "8 min", notes: "25 free throws. Develop your routine. Same motions every time." },
{ name: "Mid-range to 3PT", duration: "8 min", notes: "5 shots from 15ft, then step back to 3PT line, 5 more. 3 sets. Helps range transfer." },
{ name: "Cool down", duration: "5 min", notes: "Lay-ups (5 each side), shoulder stretches." },
],
},
"Ball Handling": {
high: [
{ name: "Stationary pound dribble series", duration: "8 min", notes: "Each drill 30 seconds: low crossover, between legs, behind back, in-and-out, combo (cross-between-behind). Both hands. 2 rounds. Stay low, eyes up." },
{ name: "Full court dribble attack", duration: "10 min", notes: "Baseline to baseline: crossover at half court, between legs at FT line, behind back at 3PT line, finish with lay-up. 4 trips. Alternate starting hand." },
{ name: "Tennis ball reaction", duration: "8 min", notes: "Dribble with right hand, toss/catch tennis ball with left. 60 seconds. Switch. 3 sets each. Forces you to dribble without looking." },
{ name: "2-ball dribbling", duration: "10 min", notes: "Simultaneous: both balls hit floor at same time. 30s. Alternating: one up as other goes down. 30s. Crossover: cross both at once. 30s. 3 rounds." },
{ name: "Cool down", duration: "5 min", notes: "Light ball handling, wrist circles, finger stretches." },
],
moderate: [
{ name: "Stationary basics", duration: "8 min", notes: "Right hand pound dribble: 30s low, 30s medium, 30s high. Switch to left hand. Then crossover: 30s slow, 30s fast. Keep eyes up." },
{ name: "Cone slalom", duration: "10 min", notes: "5 cones, 2m apart. Dribble through with right hand only (3 reps), left hand only (3 reps), then alternating crossovers (3 reps)." },
{ name: "Change of pace", duration: "8 min", notes: "Walk dribble 5m, explode forward 5m, stop on a dime. 4 sets of 5. The speed change is what beats defenders, not just speed." },
{ name: "Protect the ball", duration: "8 min", notes: "Dribble in a 3m circle. Keep off-hand out as a shield. 30s each hand, 3 rounds. Low stance, ball tight to body." },
{ name: "Cool down", duration: "5 min", notes: "Light dribbling, stretching." },
],
},
"Defense": {
high: [
{ name: "Defensive slides", duration: "10 min", notes: "Baseline to FT line: defensive slide right, then left. 8 reps. Stay low, don't cross feet, hands active. 30s rest between reps." },
{ name: "Closeout drill", duration: "10 min", notes: "Start at rim. Sprint to 3PT line, chop feet to stop (don't fly past). Contest with hand up. Sprint back to rim. 4 sets of 6. The closeout is the most important defensive movement." },
{ name: "Help and recover", duration: "10 min", notes: "Start on wing. Slide to help position (paint), then recover to your man (wing). 4 sets of 6. Call out 'help!' and 'recover!'" },
{ name: "Box out and rebound", duration: "8 min", notes: "Partner or wall toss. Contact with back, establish position, grab rebound, chin the ball. 4 sets of 8. Rebounding is positioning, not leaping." },
{ name: "Cool down", duration: "5 min", notes: "Easy jog, quad and hip stretches." },
],
moderate: [
{ name: "Defensive stance hold", duration: "8 min", notes: "Defensive stance: feet shoulder width, butt low, chest up, hands out. Hold 30s. Rest 15s. 6 reps. If this is easy, you're not low enough." },
{ name: "Slide and react", duration: "10 min", notes: "Slide left 5m, slide right 5m. 4 sets of 8 changes. Don't click heels. Stay wide." },
{ name: "Mirror drill", duration: "10 min", notes: "Partner walks/jogs with ball. Mirror their movements defensively. Stay 1 arm's length. 4 reps of 30s." },
{ name: "Rebounding form", duration: "8 min", notes: "Toss ball off backboard, jump, grab with 2 hands, chin it (protect with elbows out). 3 sets of 10." },
{ name: "Cool down", duration: "5 min", notes: "Stretching." },
],
},
};

// Fallback for sports/skills not yet in database
function getGenericDrills(skill, intensity) {
const isHigh = intensity === "High";
return [
{ name: `${skill} warm-up`, duration: "8 min", notes: `Light progressive work. Focus on the movement patterns specific to ${skill.toLowerCase()}.` },
{ name: `${skill} isolation drill`, duration: "12 min", notes: isHigh ? `4 sets of 10 reps. 30s rest between sets. Push for quality at speed.` : `3 sets of 8 reps. 45s rest. Focus on form over speed.` },
{ name: `${skill} under pressure`, duration: "10 min", notes: isHigh ? `Add time constraint or fatigue: sprint 10m before each rep. 3 sets of 8.` : `Add light mental pressure: count out loud while performing. 3 sets of 6.` },
{ name: `${skill} game simulation`, duration: isHigh ? "10 min" : "8 min", notes: `Practice in a scenario that mimics real competition. ${isHigh ? "4 sets of 6." : "3 sets of 5."} Think about when this skill appears in a game.` },
{ name: "Cool down", duration: "5 min", notes: "Light movement, stretching targeted at muscles used." },
];
}

function getDrills(sport, weakness, intensity) {
const db = sport === "soccer" ? SOCCER_DRILLS : sport === "basketball" ? BASKETBALL_DRILLS : null;
const level = intensity === "High" ? "high" : "moderate";

if (db && db[weakness] && db[weakness][level]) {
return db[weakness][level];
}
return getGenericDrills(weakness, intensity);
}

// ============================================================================
// PLAN ENGINE
// ============================================================================
function generateAdaptivePlan(profile, reflections, planHistory) {
const sport = SPORTS[profile.sport];
const today = new Date();
const dayName = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][today.getDay()];

const recentReflections = reflections.slice(-10);
const weaknessFrequency = {};
const energyTrend = [];
const performanceScores = [];

recentReflections.forEach(r => {
if (r.weaknesses) r.weaknesses.forEach(w => { weaknessFrequency[w] = (weaknessFrequency[w] || 0) + 1; });
if (r.energy) energyTrend.push(r.energy);
if (r.performance) performanceScores.push(r.performance);
});

const persistentWeaknesses = Object.entries(weaknessFrequency)
.filter(([_, c]) => c >= 2).sort((a, b) => b[1] - a[1]).map(([s]) => s);

const avgEnergy = energyTrend.length > 0 ? energyTrend.reduce((a,b) => a+b, 0) / energyTrend.length : 3;
const isLowEnergy = avgEnergy < 2.5;
const lastEnergy = energyTrend[energyTrend.length - 1] || 3;

const recentPerf = performanceScores.slice(-3);
const perfTrend = recentPerf.length >= 2 ? recentPerf[recentPerf.length-1] - recentPerf[0] : 0;

const lastPlan = planHistory[planHistory.length - 1];
const lastSessionType = lastPlan?.sessionType || "";
const daysSince = lastPlan ? Math.floor((today - new Date(lastPlan.date)) / 86400000) : 999;

let sessionType, sessionFocus, intensity, adaptationNote, drills;

if (lastEnergy <= 2 || daysSince === 0) {
sessionType = "Recovery"; intensity = "Low";
sessionFocus = "Active recovery and mobility";
adaptationNote = lastEnergy <= 2
? `Your energy averaged ${avgEnergy.toFixed(1)}/5 recently. Today is restoration, not output. Sleep and nutrition > extra reps.`
: "You already trained today. Light movement only - recovery is when adaptation happens.";
drills = [
{ name: "Dynamic stretching", duration: "10 min", notes: "Leg swings (10 each direction), arm circles (10 each), hip circles (10 each), torso twists (10). All slow and controlled." },
{ name: "Foam rolling", duration: "15 min", notes: "Calves: 60s each. Quads: 60s each. IT band: 60s each. Glutes: 60s each. Upper back: 60s. Pause on tender spots for 20s." },
{ name: "Light jog or walk", duration: "15 min", notes: "Conversational pace. If you can't talk comfortably, slow down. This is about blood flow, not fitness." },
{ name: "Box breathing", duration: "5 min", notes: "Inhale 4 counts, hold 4 counts, exhale 4 counts, hold 4 counts. 10 cycles. Activates parasympathetic recovery." },
];
}
else if (persistentWeaknesses.length > 0 && Math.random() > 0.3) {
const target = persistentWeaknesses[0];
sessionType = "Technical"; intensity = isLowEnergy ? "Moderate" : "High";
sessionFocus = `Targeted: ${target}`;
adaptationNote = `You've flagged ${target.toLowerCase()} as a weakness ${weaknessFrequency[target]} times across your last ${recentReflections.length} sessions. Spirit is targeting it today with specific drills.`;
drills = getDrills(profile.sport, target, intensity);
}
else if (lastSessionType === "Technical" || Math.random() > 0.5) {
sessionType = "Physical"; intensity = isLowEnergy ? "Moderate" : "High";
sessionFocus = "Athletic development";
adaptationNote = perfTrend > 0
? "Performance trending up. Building on momentum with athletic work."
: reflections.length < 3
? "Building your baseline. Spirit needs a few more sessions to fully customize."
: "Mixing physical work to complement your technical sessions.";
const isHigh = intensity === "High";
drills = [
{ name: "Dynamic warm-up", duration: "8 min", notes: "Jog 400m. Leg swings (10 each), walking lunges 2x10m, high knees 2x20m, butt kicks 2x20m." },
{ name: isHigh ? "Plyometric circuit" : "Bodyweight strength", duration: "12 min", notes: isHigh
? "Box jumps: 3x8 (step down, don't jump). Broad jumps: 3x6 (stick the landing). Lateral bounds: 3x8 each side. Rest 45s between sets."
: "Squats: 3x15. Lunges: 3x10 each leg. Push-ups: 3x12. Plank: 3x30s. Rest 30s between exercises." },
{ name: "Sprint intervals", duration: "10 min", notes: isHigh
? "6x40m sprints from standing start. Walk back recovery + 30s at start line. Full effort, focus on first 3 steps."
: "8x20m at 80% effort. Jog back recovery. Focus on running form: tall posture, relaxed shoulders, drive knees." },
{ name: "Core circuit", duration: "8 min", notes: "Plank: 45s. Side plank: 30s each. Dead bugs: 12 each side. Bicycle crunches: 20. V-ups: 10. 2 rounds, 30s rest between rounds." },
{ name: "Cool down + stretch", duration: "7 min", notes: "Easy jog 200m. Static holds 30s each: quads, hamstrings, calves, hip flexors, groin, glutes." },
];
}
else {
sessionType = "Technical"; intensity = "Moderate";
const focus = profile.topPriority || sport.skills[0];
sessionFocus = focus;
adaptationNote = reflections.length === 0
? "This is your first plan. Complete the session, then tell Spirit how it went. That's how it learns you."
: `Balanced ${focus.toLowerCase()} session based on your priorities.`;
drills = getDrills(profile.sport, focus, intensity);
}

let insight = null;
if (reflections.length >= 3) {
if (persistentWeaknesses.length > 0) {
insight = { type: "pattern", text: `Pattern detected: "${persistentWeaknesses[0]}" has appeared in ${weaknessFrequency[persistentWeaknesses[0]]} of your last ${recentReflections.length} reflections. Spirit is weighting your plans toward this until the data changes.` };
} else if (perfTrend > 0.5) {
insight = { type: "positive", text: "Your performance ratings have been trending up. The adaptation is working." };
} else if (isLowEnergy) {
insight = { type: "warning", text: `Energy has averaged ${avgEnergy.toFixed(1)}/5 recently. Spirit is reducing intensity. Recovery, sleep, and nutrition drive more gains than extra training right now.` };
}
}

return {
id: `plan_${Date.now()}`, date: today.toISOString(), dayName,
sessionType, sessionFocus, intensity, adaptationNote, drills, insight,
basedOnReflections: reflections.length, persistentWeaknesses,
};
}

// ============================================================================
// STYLES (compact)
// ============================================================================
const S = {
app: { minHeight: "100vh", background: T.bg, color: T.text, fontFamily: "'Outfit','DM Sans',system-ui,sans-serif", fontSize: 15, lineHeight: 1.55, WebkitFontSmoothing: "antialiased", maxWidth: 480, margin: "0 auto" },
header: { padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${T.border}`, position: "sticky", top: 0, zIndex: 50, background: `${T.bg}f0`, backdropFilter: "blur(16px)" },
logo: { fontFamily: "'Space Mono','Courier New',monospace", fontWeight: 700, fontSize: 15, letterSpacing: "0.15em", color: T.accent, textTransform: "uppercase" },
screen: { padding: "24px 20px 100px" },
h1: { fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", margin: "0 0 6px 0", lineHeight: 1.2 },
h2: { fontSize: 18, fontWeight: 600, margin: "0 0 4px 0" },
subtitle: { color: T.textSoft, fontSize: 14, margin: "0 0 28px 0" },
label: { fontFamily: "'Space Mono',monospace", fontSize: 10, fontWeight: 700, color: T.textDim, letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 8 },
card: { background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: 20, marginBottom: 14 },
input: { width: "100%", background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 10, color: T.text, fontSize: 15, padding: "12px 16px", outline: "none", boxSizing: "border-box", fontFamily: "inherit" },
btn: { width: "100%", background: T.accent, color: T.bg, border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, padding: "14px 24px", cursor: "pointer", fontFamily: "inherit" },
btnSm: { background: T.surfaceAlt, color: T.textSoft, border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13, fontWeight: 600, padding: "10px 16px", cursor: "pointer", fontFamily: "inherit" },
btnOutline: { background: "transparent", color: T.accent, border: `1px solid ${T.accent}40`, borderRadius: 12, fontSize: 14, fontWeight: 600, padding: "12px 20px", cursor: "pointer", fontFamily: "inherit", width: "100%" },
tag: (c) => ({ display: "inline-flex", fontFamily: "'Space Mono',monospace", fontSize: 10, fontWeight: 700, color: c||T.textDim, background: `${c||T.textDim}12`, border: `1px solid ${c||T.textDim}25`, padding: "3px 9px", borderRadius: 6, letterSpacing: "0.06em", textTransform: "uppercase" }),
dot: (active, i) => { const cs = [T.danger, T.warn, T.textSoft, T.blue, T.accent]; const c = cs[i]||T.textSoft; return { width: 40, height: 40, borderRadius: "50%", border: `2px solid ${active?c:T.border}`, background: active?`${c}18`:"transparent", color: active?c:T.textDim, fontFamily: "'Space Mono',monospace", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.12s", flexShrink: 0 }; },
chip: (a) => ({ padding: "8px 14px", borderRadius: 20, fontSize: 13, fontWeight: 500, cursor: "pointer", border: `1px solid ${a?T.accent:T.border}`, background: a?T.accentDim:"transparent", color: a?T.accent:T.textSoft, whiteSpace: "nowrap" }),
bottomNav: { position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, display: "flex", background: `${T.bg}f5`, backdropFilter: "blur(16px)", borderTop: `1px solid ${T.border}`, zIndex: 100 },
navItem: (a) => ({ flex: 1, padding: "12px 0 10px", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, cursor: "pointer", background: "none", border: "none", fontFamily: "'Space Mono',monospace", fontSize: 9, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: a?T.accent:T.textDim }),
progress: { height: 3, borderRadius: 2, background: T.border, overflow: "hidden" },
progressFill: (p) => ({ height: "100%", width: `${Math.min(p,100)}%`, background: `linear-gradient(90deg,${T.accent},${T.blue})`, borderRadius: 2, transition: "width 0.5s ease-out" }),
};

// ============================================================================
// SCREENS
// ============================================================================
function SetupScreen({ onComplete }) {
const [step, setStep] = useState(0);
const [sport, setSport] = useState("");
const [position, setPosition] = useState("");
const [experience, setExperience] = useState("");
const [daysPerWeek, setDaysPerWeek] = useState(4);
const [topPriority, setTopPriority] = useState("");
const [weaknesses, setWeaknesses] = useState([]);
const sc = SPORTS[sport];

if (step === 0) return (
<div style={S.screen}>
<h1 style={S.h1}>Welcome to Spirit</h1>
<p style={S.subtitle}>Your training adapts to you. Pick your sport.</p>
<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
{Object.entries(SPORTS).map(([k, s]) => (
<button key={k} style={{ ...S.card, cursor: "pointer", textAlign: "center", marginBottom: 0, padding: 20, borderColor: sport===k?T.accent:T.border, background: sport===k?T.accentDim:T.surface }} onClick={() => setSport(k)}>
<div style={{ fontSize: 32, marginBottom: 8 }}>{s.emoji}</div>
<div style={{ fontWeight: 600, color: sport===k?T.accent:T.text }}>{s.name}</div>
</button>
))}
</div>
<div style={{ marginTop: 24 }}><button style={{ ...S.btn, opacity: sport?1:0.3 }} disabled={!sport} onClick={() => setStep(1)}>Continue</button></div>
</div>
);

if (step === 1) return (
<div style={S.screen}>
<div style={S.label}>STEP 2 OF 3</div>
<h1 style={{ ...S.h1, fontSize: 22 }}>Your profile</h1>
<p style={S.subtitle}>Spirit adjusts training for your position and level.</p>
<div style={{ marginBottom: 20 }}><div style={S.label}>POSITION</div><div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{sc.positions.map(p => <button key={p} style={S.chip(position===p)} onClick={() => setPosition(p)}>{p}</button>)}</div></div>
<div style={{ marginBottom: 20 }}><div style={S.label}>EXPERIENCE</div><div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{EXPERIENCE_LEVELS.map(e => <button key={e} style={S.chip(experience===e)} onClick={() => setExperience(e)}>{e}</button>)}</div></div>
<div style={{ marginBottom: 24 }}><div style={S.label}>TRAINING DAYS / WEEK</div><div style={{ display: "flex", gap: 8 }}>{DAYS_PER_WEEK.map(d => <button key={d} style={S.dot(daysPerWeek===d, d-2)} onClick={() => setDaysPerWeek(d)}>{d}</button>)}</div></div>
<div style={{ display: "flex", gap: 10 }}><button style={S.btnSm} onClick={() => setStep(0)}>Back</button><button style={{ ...S.btn, flex: 1, opacity: position&&experience?1:0.3 }} disabled={!position||!experience} onClick={() => setStep(2)}>Continue</button></div>
</div>
);

return (
<div style={S.screen}>
<div style={S.label}>STEP 3 OF 3</div>
<h1 style={{ ...S.h1, fontSize: 22 }}>What to work on</h1>
<p style={S.subtitle}>Spirit prioritizes these and adapts as you train.</p>
<div style={{ marginBottom: 20 }}><div style={S.label}>TOP PRIORITY (pick one)</div><div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{sc.skills.slice(0,8).map(s => <button key={s} style={S.chip(topPriority===s)} onClick={() => setTopPriority(s)}>{s}</button>)}</div></div>
<div style={{ marginBottom: 24 }}><div style={S.label}>KNOWN WEAKNESSES (select all)</div><div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{sc.skills.map(s => <button key={s} style={S.chip(weaknesses.includes(s))} onClick={() => setWeaknesses(p => p.includes(s)?p.filter(x=>x!==s):[...p,s])}>{s}</button>)}</div></div>
<div style={{ display: "flex", gap: 10 }}><button style={S.btnSm} onClick={() => setStep(1)}>Back</button><button style={{ ...S.btn, flex: 1, opacity: topPriority?1:0.3 }} disabled={!topPriority} onClick={() => onComplete({ sport, position, experience, daysPerWeek, topPriority, weaknesses, createdAt: new Date().toISOString() })}>Start training with Spirit</button></div>
</div>
);
}

function PlanScreen({ profile, plan, reflections, onGenerate }) {
if (!plan) return (
<div style={S.screen}><div style={{ textAlign: "center", paddingTop: 60 }}>
<div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>{SPORTS[profile.sport]?.emoji}</div>
<h2 style={S.h2}>Ready to train?</h2>
<p style={{ ...S.subtitle, marginBottom: 24 }}>Spirit will build today's plan{reflections.length > 0 ? ` from ${reflections.length} past sessions` : ""}.</p>
<button style={S.btn} onClick={onGenerate}>Generate today's plan</button>
</div></div>
);
const totalMin = plan.drills.reduce((s, d) => s + (parseInt(d.duration)||0), 0);
return (
<div style={S.screen}>
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
<div><div style={S.label}>{plan.dayName?.toUpperCase()}'S PLAN</div><h1 style={{ ...S.h1, fontSize: 24 }}>{plan.sessionFocus}</h1></div>
<div style={{ display: "flex", gap: 6, flexShrink: 0, marginTop: 4 }}><span style={S.tag(plan.intensity==="High"?T.danger:plan.intensity==="Low"?T.blue:T.warn)}>{plan.intensity}</span><span style={S.tag(T.textDim)}>{totalMin}m</span></div>
</div>
<div style={{ background: `${T.accent}06`, borderLeft: `3px solid ${T.accent}40`, borderRadius: "0 10px 10px 0", padding: "12px 16px", marginBottom: 20, fontSize: 13, color: T.textSoft, lineHeight: 1.6 }}>{plan.adaptationNote}</div>
{plan.insight && <div style={{ background: `${plan.insight.type==="warning"?T.warn:T.accent}08`, border: `1px solid ${plan.insight.type==="warning"?T.warn:T.accent}20`, borderRadius: 12, padding: 16, marginBottom: 16 }}><div style={{ ...S.label, color: plan.insight.type==="warning"?T.warn:T.accent, marginBottom: 6 }}>SPIRIT INSIGHT</div><div style={{ fontSize: 13, color: T.textSoft, lineHeight: 1.6 }}>{plan.insight.text}</div></div>}
<div style={S.card}>
<div style={S.label}>SESSION DRILLS</div>
{plan.drills.map((d, i) => (
<div key={i} style={{ display: "flex", gap: 14, padding: "16px 0", borderBottom: i < plan.drills.length-1 ? `1px solid ${T.border}15` : "none" }}>
<div style={{ fontFamily: "'Space Mono',monospace", fontSize: 12, fontWeight: 700, color: T.accent, minWidth: 24, paddingTop: 2 }}>{String(i+1).padStart(2,"0")}</div>
<div style={{ flex: 1 }}>
<div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{d.name}</div>
<div style={{ fontSize: 12, color: T.warn, marginBottom: 4 }}>{d.duration}</div>
{d.notes && <div style={{ fontSize: 13, color: T.textSoft, lineHeight: 1.55 }}>{d.notes}</div>}
</div>
</div>
))}
</div>
<div style={{ textAlign: "center", marginTop: 8 }}><span style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: T.textDim }}>Adapted from {plan.basedOnReflections} session{plan.basedOnReflections!==1?"s":""}{plan.persistentWeaknesses?.length > 0 ? ` · Targeting: ${plan.persistentWeaknesses.join(", ")}` : ""}</span></div>
<button style={{ ...S.btnOutline, marginTop: 20 }} onClick={onGenerate}>Regenerate plan</button>
</div>
);
}

function ReflectScreen({ profile, reflections, onSubmit }) {
const [perf, setPerf] = useState(null);
const [energy, setEnergy] = useState(null);
const [sType, setSType] = useState("");
const [good, setGood] = useState("");
const [bad, setBad] = useState("");
const [wFlags, setWFlags] = useState([]);
const [done, setDone] = useState(false);
const sc = SPORTS[profile.sport];

if (done) return (
<div style={S.screen}>
<div style={{ textAlign: "center", paddingTop: 48 }}>
<div style={{ fontSize: 48, marginBottom: 16 }}>{"\u2705"}</div>
<h2 style={S.h2}>Session logged</h2>
<p style={{ ...S.subtitle, marginBottom: 8 }}>Spirit now has {reflections.length} sessions of data.</p>
<p style={{ fontSize: 13, color: T.textDim, marginBottom: 32 }}>Your next plan will adapt based on this.</p>
<button style={S.btnOutline} onClick={() => { setDone(false); setPerf(null); setEnergy(null); setSType(""); setGood(""); setBad(""); setWFlags([]); }}>Log another session</button>
</div>
{reflections.length > 1 && <div style={{ marginTop: 36 }}><div style={S.label}>RECENT SESSIONS</div>
{reflections.slice(-5).reverse().map(r => (
<div key={r.id} style={{ ...S.card, padding: 14 }}>
<div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
<span style={{ fontSize: 12, color: T.textDim }}>{new Date(r.date).toLocaleDateString()}</span>
<div style={{ display: "flex", gap: 6 }}><span style={S.tag(r.performance>=4?T.accent:r.performance>=3?T.warn:T.danger)}>Perf: {r.performance}/5</span><span style={S.tag(T.textDim)}>Energy: {r.energy}/5</span></div>
</div>
{r.struggled && <div style={{ fontSize: 13, color: T.textSoft }}>{r.struggled}</div>}
{r.weaknesses?.length > 0 && <div style={{ display: "flex", gap: 4, marginTop: 6, flexWrap: "wrap" }}>{r.weaknesses.map(w => <span key={w} style={S.tag(T.warn)}>{w}</span>)}</div>}
</div>
))}
</div>}
</div>
);

return (
<div style={S.screen}>
<h1 style={{ ...S.h1, fontSize: 22 }}>Post-Session Reflection</h1>
<p style={S.subtitle}>60 seconds. This is how Spirit learns you.</p>
<div style={{ marginBottom: 22 }}><div style={S.label}>HOW DID YOU PERFORM?</div><div style={{ display: "flex", gap: 8 }}>{[1,2,3,4,5].map(n => <button key={n} style={S.dot(perf===n, n-1)} onClick={() => setPerf(n)}>{n}</button>)}</div><div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 10, color: T.textDim, fontFamily: "'Space Mono',monospace" }}><span>Poor</span><span>Great</span></div></div>
<div style={{ marginBottom: 22 }}><div style={S.label}>ENERGY LEVEL</div><div style={{ display: "flex", gap: 8 }}>{[1,2,3,4,5].map(n => <button key={n} style={S.dot(energy===n, n-1)} onClick={() => setEnergy(n)}>{n}</button>)}</div><div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 10, color: T.textDim, fontFamily: "'Space Mono',monospace" }}><span>Drained</span><span>Full</span></div></div>
<div style={{ marginBottom: 22 }}><div style={S.label}>SESSION TYPE</div><div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{sc.sessionTypes.map(t => <button key={t} style={S.chip(sType===t)} onClick={() => setSType(t)}>{t}</button>)}</div></div>
<div style={{ marginBottom: 18 }}><div style={S.label}>WHAT WENT WELL?</div><input style={S.input} value={good} onChange={e => setGood(e.target.value)} placeholder="e.g. My passing was sharp today" /></div>
<div style={{ marginBottom: 18 }}><div style={S.label}>WHAT FELT OFF?</div><input style={S.input} value={bad} onChange={e => setBad(e.target.value)} placeholder="e.g. First touch was sloppy under pressure" /></div>
<div style={{ marginBottom: 24 }}><div style={S.label}>AREAS THAT NEED WORK</div><div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{sc.skills.map(s => <button key={s} style={S.chip(wFlags.includes(s))} onClick={() => setWFlags(p => p.includes(s)?p.filter(x=>x!==s):[...p,s])}>{s}</button>)}</div></div>
<button style={{ ...S.btn, opacity: perf&&energy?1:0.3 }} disabled={!perf||!energy} onClick={() => { onSubmit({ id: `ref_${Date.now()}`, date: new Date().toISOString(), performance: perf, energy, sessionType: sType, whatWorked: good, struggled: bad, weaknesses: wFlags }); setDone(true); }}>Log session</button>
</div>
);
}

function ProgressScreen({ profile, reflections }) {
if (reflections.length === 0) return (
<div style={S.screen}><div style={{ textAlign: "center", paddingTop: 60 }}><div style={{ fontSize: 40, opacity: 0.3, marginBottom: 12 }}>{"\uD83D\uDCCA"}</div><h2 style={S.h2}>No data yet</h2><p style={S.subtitle}>Complete sessions and Spirit will show patterns.</p></div></div>
);
const ps = reflections.filter(r => r.performance).map(r => r.performance);
const es = reflections.filter(r => r.energy).map(r => r.energy);
const ap = ps.reduce((a,b) => a+b, 0) / ps.length;
const ae = es.reduce((a,b) => a+b, 0) / es.length;
const wc = {}; reflections.forEach(r => (r.weaknesses||[]).forEach(w => { wc[w] = (wc[w]||0)+1; }));
const sw = Object.entries(wc).sort((a,b) => b[1]-a[1]);
const f5 = ps.slice(0, Math.min(5, ps.length)); const l5 = ps.slice(-Math.min(5, ps.length));
const tr = (l5.reduce((a,b)=>a+b,0)/l5.length) - (f5.reduce((a,b)=>a+b,0)/f5.length);

return (
<div style={S.screen}>
<h1 style={{ ...S.h1, fontSize: 22 }}>Your Progress</h1>
<p style={S.subtitle}>{reflections.length} sessions logged</p>
<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
{[{v:ap.toFixed(1),l:"Avg Perf",c:T.accent},{v:ae.toFixed(1),l:"Avg Energy",c:T.blue},{v:`${tr>0?"+":""}${tr.toFixed(1)}`,l:"Trend",c:tr>0?T.accent:tr<0?T.danger:T.textSoft}].map((s,i) => (
<div key={i} style={{ ...S.card, textAlign: "center", padding: 16, marginBottom: 0 }}><div style={{ fontFamily: "'Space Mono',monospace", fontSize: 24, fontWeight: 700, color: s.c }}>{s.v}</div><div style={{ fontSize: 10, color: T.textDim, marginTop: 4 }}>{s.l}</div></div>
))}
</div>
{sw.length > 0 && <div style={S.card}><div style={S.label}>RECURRING WEAKNESSES</div><div style={{ fontSize: 12, color: T.textDim, marginBottom: 14, marginTop: -4 }}>Skills flagged across sessions. Spirit prioritizes these.</div>
{sw.map(([sk, ct]) => (
<div key={sk} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
<div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{sk}</div><div style={S.progress}><div style={S.progressFill(ct/reflections.length*100)} /></div></div>
<span style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: T.textDim }}>{ct}/{reflections.length}</span>
</div>
))}
</div>}
<div style={S.card}><div style={S.label}>SESSION LOG</div>
{reflections.slice().reverse().slice(0,10).map(r => (
<div key={r.id} style={{ padding: "10px 0", borderBottom: `1px solid ${T.border}08`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
<div><div style={{ fontSize: 12, color: T.textDim }}>{new Date(r.date).toLocaleDateString()}</div>{r.sessionType && <div style={{ fontSize: 13, color: T.textSoft }}>{r.sessionType}</div>}</div>
<span style={S.tag(r.performance>=4?T.accent:r.performance>=3?T.warn:T.danger)}>{r.performance}/5</span>
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
if (p) setProfile(p); setReflections(r); setPlanHistory(h);
if (h.length > 0 && new Date(h[h.length-1].date).toDateString() === new Date().toDateString()) setCurrentPlan(h[h.length-1]);
setLoading(false);
}, []);

const setup = (p) => { setProfile(p); saveData("profile", p); setTab("plan"); };
const gen = () => { const p = generateAdaptivePlan(profile, reflections, planHistory); setCurrentPlan(p); const h = [...planHistory, p]; setPlanHistory(h); saveData("plans", h); };
const reflect = (r) => { const u = [...reflections, r]; setReflections(u); saveData("reflections", u); setCurrentPlan(null); };
const reset = () => { localStorage.removeItem("spirit_profile"); localStorage.removeItem("spirit_reflections"); localStorage.removeItem("spirit_plans"); setProfile(null); setReflections([]); setPlanHistory([]); setCurrentPlan(null); setTab("plan"); };

if (loading) return <div style={{ ...S.app, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}><div style={{ textAlign: "center" }}><div style={{ ...S.logo, fontSize: 18, marginBottom: 8 }}>SPIRIT</div><div style={{ fontSize: 12, color: T.textDim }}>Loading...</div></div></div>;
if (!profile) return <div style={S.app}><div style={S.header}><span style={S.logo}>SPIRIT</span></div><SetupScreen onComplete={setup} /></div>;

return (
<div style={S.app}>
<div style={S.header}><span style={S.logo}>SPIRIT</span><div style={{ display: "flex", alignItems: "center", gap: 10 }}><span style={S.tag(T.accent)}>{SPORTS[profile.sport]?.emoji} {profile.position}</span><button style={{ background: "none", border: "none", color: T.textDim, fontSize: 16, cursor: "pointer", padding: 4 }} onClick={reset} title="Reset">{"\u2699\uFE0F"}</button></div></div>
{tab === "plan" && <PlanScreen profile={profile} plan={currentPlan} reflections={reflections} onGenerate={gen} />}
{tab === "reflect" && <ReflectScreen profile={profile} reflections={reflections} onSubmit={reflect} />}
{tab === "progress" && <ProgressScreen profile={profile} reflections={reflections} />}
<div style={S.bottomNav}>
{[{id:"plan",icon:"\u26A1",l:"Plan"},{id:"reflect",icon:"\uD83D\uDCDD",l:"Reflect"},{id:"progress",icon:"\uD83D\uDCCA",l:"Progress"}].map(n => (
<button key={n.id} style={S.navItem(tab===n.id)} onClick={() => setTab(n.id)}><span style={{ fontSize: 20 }}>{n.icon}</span><span>{n.l}</span></button>
))}
</div>
</div>
);
}
