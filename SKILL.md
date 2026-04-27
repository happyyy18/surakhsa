# 🛡️ SKILL.md — Suraksha Safety Protocols

> **App Name:** Suraksha (सुरक्षा) — *"Protection"*  
> **Version:** 2.0  
> **Purpose:** Women's Personal Safety Mobile Application  
> **Classification:** Safety-Critical Software

---

## Table of Contents

1. [Safety Architecture Overview](#1-safety-architecture-overview)
2. [SOS Trigger Mechanisms](#2-sos-trigger-mechanisms)
3. [AI Threat Detection](#3-ai-threat-detection)
4. [GPS & Location Services](#4-gps--location-services)
5. [Communication Alerts](#5-communication-alerts)
6. [Privacy & Encryption Design](#6-privacy--encryption-design)
7. [Offline Resilience](#7-offline-resilience)
8. [Ghost Authentication](#8-ghost-authentication)
9. [Fake Call Protocol](#9-fake-call-protocol)
10. [Incident Log Management](#10-incident-log-management)
11. [Demo Instructions](#11-demo-instructions)
12. [Judge Q&A Cheat Sheet](#12-judge-qa-cheat-sheet)

---

## 1. Safety Architecture Overview

Suraksha is designed around a **"Defense in Depth"** model — multiple independent layers ensure the user can get help even when one layer fails.

```
Layer 1: Detection   →  Tap SOS | Shake | Voice Command | Volume Keys
Layer 2: Location    →  Live GPS every 30 sec | Last known GPS (offline)
Layer 3: Alerts      →  SMS (Twilio) | Email (SendGrid) | In-app notification
Layer 4: Evidence    →  Audio recording | Encrypted incident log
Layer 5: Fallback    →  Offline queue | Cached map tiles | Local storage
```

### Design Principles
- **Speed Over Features:** SOS triggers in < 300ms (no confirmation dialogs in panic mode)
- **Privacy by Default:** Never stores real names; all logs are AES-256 encrypted
- **Fail Safe:** If internet fails, SOS is queued and auto-sent when connectivity restores
- **Disguise:** App appears as a calculator to casual observers

---

## 2. SOS Trigger Mechanisms

### 2.1 One-Tap SOS Button
- **UI:** Large (120px diameter), pulsing crimson button in screen center
- **Trigger:** Single tap starts 5-second countdown
- **Cancel:** Must solve a shape-challenge puzzle (prevents pocket triggers)
- **On Activate:** Simultaneously starts GPS tracking, audio recording, and alert pipeline

### 2.2 Shake-to-Alert (AI Threat Detection)
- **Sensor:** `DeviceMotionEvent` — `accelerationIncludingGravity`
- **Threshold:** Acceleration magnitude > 15 m/s² sustained for 300ms
- **Algorithm:** Rolling window of 10 samples, triggers if 3+ exceed threshold
- **Desktop Simulation:** Press `S` key to simulate shake (demo mode)
- **Cooldown:** 10-second cooldown after trigger to prevent re-fires

### 2.3 Voice Command Activation
- **API:** `webkitSpeechRecognition` / `SpeechRecognition` (Web Speech API)
- **Keywords:** "Suraksha Help", "Help Help", "Help Me Now"
- **Processing:** On-device — no audio data sent to any server
- **Privacy:** Microphone activates only when user enables voice mode
- **Fallback:** Keyboard shortcut `V` for demo mode

### 2.4 Volume Key Simulation (Web)
- **Browser:** Long-press `Space` for 3 seconds triggers SOS (web simulation)
- **Native Mobile (React Native path):** `react-native-volume-key-listener`

---

## 3. AI Threat Detection

### 3.1 Shake Detection Algorithm
```javascript
// Pseudocode
function onMotionEvent(event) {
  const { x, y, z } = event.accelerationIncludingGravity;
  const magnitude = Math.sqrt(x² + y² + z²);
  
  if (magnitude > SHAKE_THRESHOLD) {
    shakeCount++;
    if (shakeCount >= SHAKE_REQUIRED && !cooldown) {
      triggerSOS('shake');
    }
  }
}
```

### 3.2 Voice Keyword Spotting
```javascript
// On-device, continuous recognition
recognition.continuous = true;
recognition.onresult = (event) => {
  const transcript = event.results[last].transcript.toLowerCase();
  const KEYWORDS = ['suraksha help', 'help help', 'help me now'];
  if (KEYWORDS.some(kw => transcript.includes(kw))) {
    triggerSOS('voice');
  }
};
```

### 3.3 AI Assistant (Gemini 1.5 Flash)
- Analyzes user's situation description
- Returns 3 action cards: A (immediate action), B (contact), C (report)
- Offline fallback: keyword-matched pre-trained responses
- Gemini API: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash`

---

## 4. GPS & Location Services

### 4.1 Continuous Tracking (SOS Active)
- Uses `navigator.geolocation.watchPosition()` for real-time updates
- Fallback: `getCurrentPosition()` polled every 30 seconds
- Accuracy: High accuracy mode enabled
- **Location update interval:** 30 seconds during SOS, off otherwise (battery saving)

### 4.2 Location Data Format
```json
{
  "lat": 28.6139,
  "lng": 77.2090,
  "accuracy": 15,
  "timestamp": "2024-01-15T14:30:00Z",
  "mapsLink": "https://maps.google.com/?q=28.6139,77.2090",
  "address": "New Delhi, India"  // via Geocoding API
}
```

### 4.3 Safe Route Algorithm (Demo)
- Weighted scoring based on: lighting, population density, police proximity
- Score 1-10: 8-10 = Green (Safe), 5-7 = Amber (Caution), 1-4 = Red (Avoid)
- Historical data: Crowdsourced incident reports (mock for V2)

---

## 5. Communication Alerts

### 5.1 SMS via Twilio
```
Suraksha SOS ALERT — [ALIAS] needs help!
Time: [TIMESTAMP]
📍 Location: https://maps.google.com/?q=[LAT],[LNG]
🔴 SOS has been activated. Please respond immediately.
This message was sent automatically by Suraksha Safety App.
```

### 5.2 Email via SendGrid
- Subject: `🆘 URGENT: Suraksha SOS Alert — [ALIAS]`
- HTML template with red header, GPS embed, timestamp
- Includes: "Reply immediately or call emergency services if you cannot reach them"

### 5.3 Alert Priority Order
1. SMS to all trusted contacts (parallel)
2. Email to all trusted contacts (parallel)
3. In-app notification (if contacts have app)
4. Queue for retry if failed (offline mode)

### 5.4 Environment Variables Required
```env
VITE_TWILIO_ACCOUNT_SID=ACxxxxxxxxx
VITE_TWILIO_AUTH_TOKEN=xxxxxxxxx
VITE_TWILIO_FROM_NUMBER=+1xxxxxxxxxx
VITE_SENDGRID_API_KEY=SG.xxxxxxxxx
VITE_SENDGRID_FROM_EMAIL=alerts@suraksha.app
VITE_GOOGLE_MAPS_KEY=AIzaxxxxxxxxx
VITE_GEMINI_API_KEY=AIzaxxxxxxxxx
```

---

## 6. Privacy & Encryption Design

### 6.1 AES-256-GCM Implementation
- **Algorithm:** AES-256-GCM (Authenticated Encryption)
- **Key Derivation:** PBKDF2-SHA256 (100,000 iterations) from user PIN
- **IV:** Cryptographically random 96-bit per encryption
- **API:** `window.crypto.subtle` (native browser, no library needed)
- **Storage:** Ciphertext only stored in localStorage — never plaintext

### 6.2 What Is NEVER Stored
| Data | Storage Policy |
|---|---|
| Real name | ❌ Never stored |
| Phone number | ✅ Stored encrypted |
| GPS history | ✅ Stored encrypted, auto-purged after 30 days |
| Audio recordings | ✅ Stored as blob, encrypted, not uploaded |
| Contacts | ✅ Stored encrypted |
| App usage patterns | ❌ No analytics, no tracking |

### 6.3 Panic Wipe
- Long-press the "Exit" button for 3 seconds
- Deletes all localStorage keys
- Resets to fresh calculator state
- Irreversible

---

## 7. Offline Resilience

### 7.1 SOS Queue
When internet is unavailable during SOS:
1. Saves `{ timestamp, lastGPS, alias, contacts, audioRef }` to localStorage
2. Displays "📴 OFFLINE — SOS queued" indicator on screen
3. Background service polls for connectivity every 30 seconds
4. On reconnect: sends all queued SOS events with original timestamp
5. Queue cleared after successful transmission

### 7.2 Offline Map Tiles
- Pre-cached OpenStreetMap tiles for major cities (via Leaflet)
- "Download offline map" option in Settings

### 7.3 AI Offline Fallback
```javascript
const OFFLINE_RESPONSES = {
  'followed':  [enterPublicSpace, callContact, callPolice],
  'unsafe':    [moveToLight, callContact, shareLocation],
  'emergency': [callPolice, activateSOS, shoutHelp],
  'default':   [enterPublicSpace, callContact, activateSOS],
};
```

---

## 8. Ghost Authentication

### 8.1 Calculator Disguise
- App opens as a fully functional iOS-style calculator
- Zero visual indication it's a safety app
- Unlock sequence: type `1337=` (configurable in Settings)
- Incorrect sequences just show normal calculator results

### 8.2 Alias System
- Generated on first launch: `User_XXXXXXXX` (random alphanumeric)
- Shown in SOS alerts instead of real name (privacy protection)
- Can be changed in Settings
- Never linked to real identity

### 8.3 Auto-Lock
- Configurable timeout: 1, 5, 10, 30 minutes (default: 5 min)
- On lock: returns to calculator screen
- SOS remains active even when locked

---

## 9. Fake Call Protocol

### 9.1 Activation
- Swipe the "Fake Call" slider on Home screen
- Or hold `F` key in demo mode
- Trigger delay: 0, 10, 30, 60 seconds (configurable)

### 9.2 Call UI
- Full-screen incoming call screen
- Configurable contact name (e.g., "Mom", "Dr. Sharma")
- Realistic ringtone via Web Audio API
- "Answer" (green) → shows conversation script
- "Decline" (red) → closes immediately

### 9.3 Conversation Script (when answered)
```
"Hey, where are you? I'm waiting outside... Yes, I'll be right there...
Oh don't worry, I'm almost done... Yes, the car is running...
Okay, see you in 2 minutes!"
```
Script plays as text + optional TTS via `window.speechSynthesis`

---

## 10. Incident Log Management

### 10.1 Log Entry Structure
```json
{
  "id": "uuid-v4",
  "timestamp": "ISO-8601",
  "trigger": "tap | shake | voice",
  "duration": 145,
  "location": { "lat": 0, "lng": 0 },
  "contactsAlerted": ["Contact 1", "Contact 2"],
  "audioRef": "blob://...",
  "notes": "User-added text",
  "encrypted": true
}
```

### 10.2 Export Formats
- **Police Report (`.txt`):** Plain text, formatted for official use
- **Encrypted Backup (`.json`):** AES-256 encrypted, portable
- **Location History (`.kml`):** Google Earth compatible

---

## 11. Demo Instructions

### Quick Demo Flow (5 minutes)
| Time | Action | What Judges See |
|---|---|---|
| 0:00 | Open app | Black calculator — "It's just a calculator?" |
| 0:15 | Type `1337=` | 🔓 Unlock animation → Shield logo |
| 0:30 | Complete onboarding | Auto-alias `User_XXXXX`, privacy setup |
| 1:00 | Home screen | Pulsing crimson SOS button |
| 1:30 | Tap SOS | 5-second countdown, shape cancel challenge |
| 2:00 | SOS Active | Waveform + contact notifications |
| 2:30 | Press `S` | Shake trigger demo |
| 3:00 | Safety Map tab | Live map, police stations, safe routes |
| 3:30 | AI Assistant | Type "being followed" → 3 action cards |
| 4:00 | Swipe fake call | Incoming call screen with ringtone |
| 4:30 | Incident Log | Encrypted badge, export options |
| 5:00 | Settings | Ghost identity, auto-lock, panic wipe |

### Keyboard Shortcuts (Demo Mode)
| Key | Action |
|---|---|
| `S` | Simulate shake trigger |
| `V` | Simulate voice command |
| `F` | Trigger fake call |
| `Space` (3s) | Simulate volume key hold |
| `D` | Toggle demo mode overlay |

---

## 12. Judge Q&A Cheat Sheet

**Q: What if the attacker takes the phone?**  
A: The last GPS coordinates + 30-second audio clip are already queued/sent. All data is encrypted and requires PIN to wipe.

**Q: Does it work without internet?**  
A: Yes. SOS is queued with last known GPS. Map works with cached tiles. AI falls back to offline keyword matching.

**Q: What happens to the audio recordings?**  
A: Stored locally, AES-256 encrypted. Never uploaded. User controls export and deletion.

**Q: Can it be traced to the user if phone is found?**  
A: The app looks like a calculator. All data is encrypted. No real name stored. Without the PIN, data is inaccessible.

**Q: How is this different from existing apps?**  
A: Ghost authentication (calculator disguise), multi-trigger SOS (tap+shake+voice+volume), AI action cards, offline resilience with SOS queue, AES-256 encryption. Most apps have 1-2 of these; Suraksha has all.

---

*Suraksha V2 — Built with ❤️ for safety, privacy, and resilience.*
