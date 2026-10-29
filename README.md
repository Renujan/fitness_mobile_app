# FitTrack — Personal Mobile Gym & Fitness Tracker

FitTrack is a modern, privacy-first, fully offline-capable mobile fitness tracking application built with **Expo SDK 58**, **React Native 0.88**, **React 19**, and **Expo SQLite**.

---

## 🚀 Features

- **Dashboard**: Daily workout overview, weekly consistency streak tracker, macro targets progress bars, and quick actions.
- **Workout Logging**: Real-time workout sessions, multi-set logging (weight, reps, RPE), exercise history, and total volume calculation.
- **Plate & 1RM Calculators**: Instant Olympic barbell plate loading breakdown and Brzycki/Epley 1-Rep-Max estimation.
- **Nutrition Tracking**: Daily calorie & macro breakdown (protein, carbs, fat), searchable food library, custom meal entry, and hydration tracker.
- **Progress & Analytics**: Body weight tracking, measurement history (waist, chest, body fat %), exercise PR history, and fitness goals with progress bars.
- **Gamification**: Unlockable achievements for lifting milestones, consistency streaks, and nutritional targets.
- **Offline Data & Privacy**: Local SQLite storage with complete JSON backup export and import functionality.

---

## 🛠️ Tech Stack

- **Framework**: [Expo](https://expo.dev/) (SDK 58) with Continuous Native Generation
- **Runtime**: [React Native](https://reactnative.dev/) 0.88 & React 19
- **Navigation**: [Expo Router](https://docs.expo.dev/router/introduction/) (File-based navigation)
- **Local Database**: [expo-sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/)
- **Icons**: [lucide-react-native](https://lucide.dev/)
- **Language**: TypeScript 6

---

## 📁 Project Structure

```
mobile_gym_app/
├── app/                      # Expo Router screens and layouts
│   ├── (tabs)/               # Bottom tab navigation routes
│   │   ├── index.tsx         # Dashboard / Home
│   │   ├── workout.tsx       # Workout sessions & history
│   │   ├── nutrition.tsx     # Calorie & macro tracking
│   │   ├── progress.tsx      # Body measurements & PR tracking
│   │   ├── profile.tsx       # User profile, targets, backup/restore
│   │   └── _layout.tsx       # Tab bar configuration
│   ├── _layout.tsx           # Root navigation stack & DB provider
│   └── +not-found.tsx        # 404 fallback route
├── src/
│   ├── components/common/    # Reusable UI components (Card, Button, Badge, etc.)
│   ├── constants/            # Exercise and food starter databases
│   ├── db/                   # SQLite schema, migrations, repositories
│   ├── hooks/                # Custom React hooks (useDatabase)
│   ├── types/                # TypeScript interfaces and models
│   └── utils/                # Date, fitness, and barbell calculator helpers
└── assets/                   # App icons, splash screens, and images
```

---

## 💻 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or bun

### Installation

```bash
# Clone the repository
git clone https://github.com/Renujan/fitness_mobile_app.git

# Navigate to project directory
cd fitness_mobile_app

# Install dependencies
npm install
```

### Running the App

```bash
# Start development server
npx expo start

# Run on Android emulator or connected device
npx expo start --android

# Run on iOS simulator (macOS only)
npx expo start --ios

# Run on Web
npx expo start --web
```

---

## 🛡️ License

MIT License. See [LICENSE](LICENSE) for details.