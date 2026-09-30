<div align="center">

# ⚡️ QR App — Minimalist Offline QR Toolkit

<p align="center">
  <strong>A premium, privacy-first mobile toolkit crafted with utilitarian minimalism, a floating app dock, tactile 3D interactive controls, and instant camera scanning.</strong>
</p>

<p align="center">
  <a href="https://github.com/wahidulsami/qr-app/stargazers"><img src="https://img.shields.io/github/stars/wahidulsami/qr-app?style=for-the-badge&color=141413&logo=github" alt="GitHub Stars" /></a>
  <a href="https://github.com/wahidulsami/qr-app/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-black?style=for-the-badge" alt="License" /></a>
  <a href="https://expo.dev"><img src="https://img.shields.io/badge/Expo-SDK_57-4630EB?style=for-the-badge&logo=expo&logoColor=white" alt="Expo SDK 57" /></a>
  <a href="https://reactnative.dev"><img src="https://img.shields.io/badge/React_Native-0.86-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React Native" /></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="https://lucide.dev"><img src="https://img.shields.io/badge/Icons-Lucide-F56565?style=for-the-badge&logo=feather&logoColor=white" alt="Lucide Icons" /></a>
</p>

---

[Key Highlights](#-key-highlights) •
[Interactive 3D Controls](#-tactile-3d-button-architecture) •
[Tech Stack](#-tech-stack) •
[Installation & Setup](#-installation--quick-start) •
[Project Architecture](#-project-structure) •
[Commands](#-developer-commands)

---

</div>

<br />

## 🌟 Overview

**QR App** is a fast, offline-first QR utility engineered for iOS, Android, and the Web. Built using **Expo SDK 57**, **React Native 0.86**, and **React 19**, it rejects bloated, noisy mobile design in favor of a clean, editorial aesthetic: warm bone-white canvas in light mode, deep obsidian slate in dark mode, balanced typographic hierarchies, and micro-haptic interactions.

Every QR scan and generated code stays **100% on your device**. No tracking. No telemetry. No ads. No servers.

---

## ⚡️ Key Highlights

```
┌────────────────────────────────────────────────────────────────────────┐
│                              AURA QR CORE                              │
├─────────────────────┬────────────────────┬─────────────────────────────┤
│ ⚓️ Floating App Dock │ 📷 High-Speed Scan │ 🛠 Multi-Format Generator   │
│   • Compact center  │   • Laser guide    │   • URLs & Wi-Fi networks   │
│   • Glass backdrop  │   • Torch & flip   │   • vCards, Email, & Text   │
│   • Micro-bounce    │   • Paste tester   │   • Live vector SVG render  │
├─────────────────────┼────────────────────┼─────────────────────────────┤
│ 🍞 Minimal Toasts   │ 🗄 Offline Storage │ 📳 Tactile Micro-Haptics    │
│   • No alerts       │   • Local SQLite   │   • 3D physical press       │
│   • Instant copy    │   • Fast search    │   • 48px+ touch targets     │
│   • Action triggers │   • Export as PNG  │   • Apple HIG compliance    │
└─────────────────────┴────────────────────┴─────────────────────────────┘
```

### 1. ⚓️ Premium Floating App Dock
- **Compact Floating Form**: Centered above the safe area (`insets.bottom`), providing quick access to all 5 primary sections: **Home**, **Scan**, **Generate**, **History**, and **Settings**.
- **Refined Geometry**: Soft, moderately rounded rectangle (`borderRadius: 16`), intentionally avoiding oversized capsule pills.
- **Glass & Diffuse Shadow**: Translucent backdrop with `backdrop-filter: blur(20px)` and soft multi-layered shadows.
- **Micro-Interactions**: Spring-driven press states (`scale: 0.90`), vertical activation bounce, and web hover indicators.
- **Lucide Icons**: Uniform stroke consistency with dedicated active indicator bars.

### 2. 🍞 Lightweight Toast System
- **Zero Blocking Dialogs**: Replaces disruptive native `Alert.alert()` modal popups with modern, non-intrusive toasts.
- **Immediate Visual & Clipboard Feedback**:
  - `Saved successfully` — when creating QR codes or caching images offline.
  - `QR copied` / `Link copied` — instant feedback when tapping copy buttons.
  - `Item deleted` / `History cleared` — clean feedback on deletion actions.
  - `Scan completed` — instant trigger upon camera or paste barcode detection.
  - `Error states` — subtle warnings with semantic color coding.
- **Haptic Sync**: Automatically dispatches appropriate haptic notifications (`success`, `warning`, `error`).

### 3. 📷 Instant Viewfinder Scanner
- Real-time viewfinder targeting with animated scanning laser beam.
- Built-in hardware torch toggle and camera flip (front/back).
- Manual payload paste tester for emulator or offline workflow testing.
- Smart payload parser that auto-detects URLs, Wi-Fi keys, Contacts, and Emails.

### 4. 🛠 Smart Vector QR Generator
- Real-time SVG rendering powered by `react-native-qrcode-svg`.
- Presets for:
  - **URLs**: Automatic protocol normalization (`https://`).
  - **Wi-Fi**: WPA/WPA2/WEP/Open credentials with auto-connect QR formatting.
  - **Contacts**: Standard vCard 3.0 serialization.
  - **Emails**: Pre-filled recipients, subjects, and message bodies.
  - **Plain Text**: Unformatted raw payloads.
- Configurable Error Correction Levels (**L**, **M**, **Q**, **H**).
- Export QR code directly as a clean PNG image file or share via system sheet.

---

## 🧊 Tactile 3D Button Architecture

The interface uses a deliberate, layered physical geometry termed **Bezel Architecture**. Buttons and cards do not look flat, nor do they rely on outdated heavy drop shadows or skeuomorphic textures:

```
    ┌─────────────────────────────────────────┐  ▲
    │  Outer Hairline Border (1px Subtle)     │  │
    │  ┌───────────────────────────────────┐  │  │ Layered Depth
    │  │  High-Contrast Surface Plate      │  │  │
    │  │  ┌─────────────────────────────┐  │  │  ▼
    │  │  │  Label / Lucide Icon        │  │  │
    │  │  └─────────────────────────────┘  │  │
    │  └───────────────────────────────────┘  │
    └─────────────────────────────────────────┘
        ▼ [Pressed State: Scale 0.98 + Color Shift]
```

- **Subtle Layered Rim**: Double-border layering with low-opacity alpha borders (`rgba(0, 0, 0, 0.08)` in light, `rgba(255, 255, 255, 0.12)` in dark).
- **Physical Press Feedback**: On touch down, the button applies an immediate `transform: [{ scale: 0.98 }]` micro-contraction accompanied by light impact haptics (`Haptics.ImpactFeedbackStyle.Light`).
- **Surface Elevation**: Cards sit on a dual-tone surface (`theme.surface` over `theme.background`) framed with crisp 10px-16px corner radiuses.

---

## 🛠 Tech Stack

| Category | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Core Framework** | [Expo](https://expo.dev) | `~57.0.26` | Native runtime, CNG & tooling |
| **Mobile Engine** | [React Native](https://reactnative.dev) | `0.86.3` | Cross-platform mobile UI |
| **Frontend Library** | [React](https://react.dev) | `19.2.3` | Component state & lifecycle |
| **Language** | [TypeScript](https://www.typescriptlang.org) | `~6.0.3` | Type safety and strict contracts |
| **Routing** | [Expo Router](https://docs.expo.dev/router/introduction/) | `~57.0.24` | File-based navigation & tabs |
| **Icons** | [Lucide React Native](https://lucide.dev) | `^1.16.0` | Minimal vector stroke iconography |
| **Animation** | [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) | `4.5.1` | 60/120 FPS fluid micro-interactions |
| **QR Engine** | [react-native-qrcode-svg](https://github.com/awesomejerry/react-native-qrcode-svg) | `^6.3.26` | Scalable vector QR generation |
| **Camera** | [expo-camera](https://docs.expo.dev/versions/latest/sdk/camera/) | `~57.0.6` | Native camera viewfinder & barcode scanner |
| **Persistence** | [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) | `2.2.0` | Local persistent storage |
| **Haptics** | [expo-haptics](https://docs.expo.dev/versions/latest/sdk/haptics/) | `~57.0.3` | Physical tactile feedback |
| **File System** | [expo-file-system](https://docs.expo.dev/versions/latest/sdk/filesystem/) | `~57.0.7` | Offline PNG export & caching |

---

## 🚀 Installation & Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or newer LTS recommended)
- `npm` or [`bun`](https://bun.sh/)
- [Expo Go](https://expo.dev/go) app on your physical iOS or Android device, OR local simulators (Xcode / Android Studio).

### 1. Clone the Repository
```bash
git clone https://github.com/wahidulsami/qr-app.git
cd qr-app
```

### 2. Install Dependencies
```bash
npm install
# or if you use bun:
bun install
```

### 3. Start the Development Server
```bash
npm start
# or:
npx expo start
```

### 4. Run on Your Target Device

Once the terminal displays the Metro QR code:
- **iOS Simulator**: Press <kbd>i</kbd> in your terminal (requires macOS + Xcode).
- **Android Emulator**: Press <kbd>a</kbd> in your terminal (requires Android Studio).
- **Physical Device**: Open the **Camera** (iOS) or **Expo Go** app (Android) and scan the displayed QR code.
- **Web Browser**: Press <kbd>w</kbd> or run `npm run web`.

---

## 💻 Developer Commands

| Command | Action |
| :--- | :--- |
| `npm start` | Starts the interactive Expo Metro bundler |
| `npm run android` | Boots the app directly inside an active Android emulator |
| `npm run ios` | Boots the app directly inside an iOS simulator |
| `npm run web` | Launches the responsive web version on `http://localhost:8081` |
| `npx tsc --noEmit` | Performs comprehensive TypeScript type-checking |
| `npx expo-doctor` | Validates dependency compatibility and SDK health |
| `npx expo export --platform web` | Builds static, production-optimized web bundles |

---

## 📁 Project Structure

```text
my-app/
├── assets/                     # App icons, splash screens, and raster assets
├── src/
│   ├── app/                    # Expo Router file-based screens
│   │   ├── _layout.tsx         # Root layout (AppDock + ToastProvider)
│   │   ├── index.tsx           # Home dashboard with quick actions & recents
│   │   ├── scan.tsx            # Viewfinder QR scanner & laser animation
│   │   ├── generate.tsx        # Multi-format QR generator & real-time preview
│   │   ├── history.tsx         # Searchable local history & bulk actions
│   │   └── settings.tsx        # Theme switcher, storage stats, & haptics
│   ├── components/
│   │   ├── navigation/
│   │   │   └── app-dock.tsx    # Premium floating bottom App Dock
│   │   ├── ui/
│   │   │   ├── app-button.tsx  # Tactile 3D buttons with press micro-states
│   │   │   ├── app-input.tsx   # Utilitarian input fields with clear actions
│   │   │   ├── bezel-card.tsx  # Layered 3D bezel container component
│   │   │   ├── confirm-modal.tsx # Minimal non-intrusive confirmation dialogs
│   │   │   ├── qr-card-view.tsx  # Vector QR canvas with export & share
│   │   │   ├── qr-detail-modal.tsx # Focused item viewer with copy interactions
│   │   │   ├── scan-result-modal.tsx # Instant scan modal with type actions
│   │   │   └── type-badge.tsx  # Editorial pastel type indicator tags
│   │   └── icons.tsx           # Vector SVG primitives & Lucide mappings
│   ├── constants/
│   │   └── theme.ts            # Warm monochrome color tokens & spacing rules
│   ├── context/
│   │   ├── app-context.tsx     # Central state (history, settings, haptics)
│   │   └── toast-context.tsx   # Lightweight spring-animated Toast notification system
│   ├── types/
│   │   └── qr.ts               # Core TypeScript interfaces & payload models
│   └── utils/
│       ├── qr-actions.ts       # Clipboard, system share, and image export utils
│       ├── qr-payload.ts       # Wi-Fi, vCard, URL, & email encoding/decoding
│       └── storage.ts          # Local persistent storage drivers
├── app.json                    # Expo project configuration & permissions
├── package.json                # Dependencies and scripts
└── tsconfig.json               # TypeScript compiler configuration
```

---

## 🛡 Security & Privacy

> [!NOTE]
> **Zero Network Requests**: This application operates in complete isolation on your device.
> - No telemetry, cookies, or remote analytics are collected.
> - Scanned data and generated QR codes are stored strictly within device-encrypted storage.
> - Camera permissions are utilized exclusively for localized frame scanning.

---

## 🤝 Contributing

Contributions, feature requests, and feedback are welcome!
1. **Fork** the repository.
2. Create a feature branch: `git checkout -b feature/amazing-feature`.
3. Commit your changes: `git commit -m "Add amazing feature"`.
4. Run validation checks: `npx tsc --noEmit && npx expo-doctor`.
5. Push to the branch: `git push origin feature/amazing-feature`.
6. Open a **Pull Request**.

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for complete details.

<div align="center">
  <sub>Built with care for minimal, functional mobile software.</sub>
</div>
