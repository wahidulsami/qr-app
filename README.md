# QR App

A cross-platform QR toolkit for scanning codes, generating new QR codes, and keeping useful scans close at hand. The app is designed for quick one-handed actions with a clean interface, tactile feedback, and layered buttons that give the controls a subtle 3D shape.

## Features

- Scan QR codes with the device camera.
- Generate QR codes from text, links, contact details, and other payloads.
- View scan results and QR details in focused modal views.
- Save and revisit QR activity in local history.
- Copy, share, and use QR payload actions from the result screen.
- Switch between light and dark appearance settings.
- Use haptic feedback for important button interactions.
- Run on Android, iOS, and the web through Expo.

## Tech stack

- **Framework:** Expo SDK 57 and React Native 0.86
- **Language:** TypeScript
- **Navigation:** Expo Router with file-based routes
- **QR generation:** `react-native-qrcode-svg`
- **Camera:** `expo-camera`
- **Storage:** `@react-native-async-storage/async-storage`
- **Icons:** `lucide-react-native` and Expo Symbols
- **Motion and interaction:** React Native Reanimated, Gesture Handler, and Expo Haptics
- **Web support:** React Native Web and React DOM

## Requirements

- Node.js LTS
- npm
- Android Studio and an emulator, or a physical Android device
- Xcode and an iOS simulator, or a physical iOS device (macOS only)

Expo Go can be used for supported features during development. Native features that are not included in Expo Go require a development build.

## Installation

Clone the repository and enter the project directory:

```bash
git clone https://github.com/wahidulsami/qr-app.git
cd qr-app
```

Install dependencies:

```bash
npm install
```

Start the Expo development server:

```bash
npm start
```

Then use the displayed Expo options to open the app in Expo Go, an Android emulator, an iOS simulator, or a web browser.

## Platform commands

```bash
npm run android   # Start on Android
npm run ios       # Start on iOS (macOS only)
npm run web       # Start in a web browser
```

## Development checks

Run the linter and TypeScript checker before committing changes:

```bash
npm run lint
npx tsc --noEmit
```

## Project structure

```text
src/
  app/             Expo Router screens
  components/      Reusable UI and navigation components
  constants/       Theme values
  context/         App state and toast state
  hooks/           Shared React hooks
  types/           TypeScript models
  utils/           QR actions, payload parsing, and storage
```

## UI direction

The interface uses a compact, mobile-first visual system. Primary actions use layered surfaces, rounded corners, icon support, and a small pressed-state scale change to create a tactile 3D button effect without making controls difficult to read or tap. The same design language is shared across scan, generate, history, explore, and settings screens.

## License

See [LICENSE](LICENSE) for project licensing information.
