
# DEATHWISH

> **"SECURE_BOOT... INITIALIZING... WELCOME OPERATIVE."**

**Deathwish** is a retro-styled, zombie apocalypse simulation interface built with React and Tailwind CSS. It mimics the aesthetic of late 90s / early 2000s survival horror game menus and terminals. Players act as a tactical dispatcher for JunJun Corporation, managing resources, making critical decisions, and uncovering the lore of a fallen world.

## 🎮 FEATURES

### 🖥️ Tactical Dispatch Mode
*   **Incident Management:** Monitor a live map of the quarantine zone. Incidents appear in real-time.
*   **Decision Making:** Choose how to handle threats (Hordes, Bandits, Anomalies). Your choices affect your Signal Strength.
*   **Signal Calibration:** Engage in a reflex-based minigame to secure difficult frequencies.
*   **Permadeath-lite:** If Signal Strength hits 0, the mission fails.

### 📖 Immersive Storyline
*   **Archive System:** Unlock pages of a sprawling narrative detailing the initial outbreak and the aftermath.
*   **Economy:** Earn currency ($) by completing successful missions to purchase encrypted files.
*   **Procedural Logs:** Beyond the core story, the system generates infinite procedural mission logs to read.

### 🏆 Global Rankings
*   **Leaderboards:** Compete against other local operatives (stored in local storage).
*   **Multiple Metrics:** Rank by Wealth ($), Story Progress, Missions Completed, or Best Win Streak.

### 🔧 Operative Management
*   **Profile Creation:** Create your own unique Operative Alias.
*   **Persistence:** Auto-saves progress (Money, Unlocks, Stats) to the browser's Local Storage.
*   **Security:** Change your Alias or Password securely via the Account Settings terminal.

## 🕹️ CONTROLS

### Main Menu
*   **Arrow Keys / Mouse Hover:** Navigate menu items.
*   **Enter / Click:** Select option.
*   **Escape:** Go Back.

### Dispatch Mode
*   **Click** on Map Icons (Yellow Triangles) to open incidents.
*   **Click** options to resolve incidents.
*   **Escape:** Pause / Open System Menu.

### Story Reader
*   **Left/Right Arrows:** Turn pages.
*   **Input Field:** Jump to specific page number.

## 🛠️ TECH STACK

*   **React 18:** Core UI framework.
*   **Tailwind CSS:** Utility-first styling for rapid UI development.
*   **Lucide React:** Retro-futuristic iconography.
*   **Local Storage:** Client-side persistence for user accounts and game state.

## 🎨 AESTHETIC

The application heavily utilizes CSS animations (`keyframes`) to achieve its look:
*   **CRT Overlay:** Scanlines, vignette, and slight chromatic aberration.
*   **Glow Effects:** Text shadows and box shadows to simulate phosphor burn-in.
*   **Typography:** Uses Google Fonts `VT323` (Terminal), `Black Ops One` (Headers), and `Share Tech Mono` (UI elements).

## ⚠️ TROUBLESHOOTING

*   **Audio Not Playing?** Ensure your browser allows autoplay or interact with the document (click anywhere) to initialize the audio context.
*   **Lost Save Data?** Clearing your browser's cache/local storage will wipe your operative profile.

---

**PROPERTY OF JUNJUN CORPORATION.**  
*Unauthorized access is a Class A felony.*
