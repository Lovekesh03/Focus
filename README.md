# Aura: Minimal Productivity App
## Walkthrough

### Overview
Aura is a calm, visually appealing, and highly aesthetic personal productivity tool built with **React Native (Expo)**, **Firebase**, and **Zustand**. It combines a to-do list, lightweight notes, and a habit/streak tracking system without the clutter of traditional task managers.

### Features Implemented
1. **To-Do List & Lightweight Notes**:
    - Users can add tasks with priorities on the Dashboard.
    - Tapping a task expands it to reveal an editable notes section for sub-tasks or thoughts.
    - Tasks are managed via a persistent local `Zustand` store using `AsyncStorage`.

2. **Focus Mode Timer**:
    - Clicking the crosshair icon on any task opens a full-screen, distraction-free "Focus Mode".
    - A customizable Pomodoro-style timer (defaults to 25 minutes) runs with smooth visual ring progress.
    - Allows the user to immediately mark the task as complete once the session ends.

3. **Habit & Streak Tracking**:
    - The `HabitsScreen` computes the user's daily completion history.
    - Displays a GitHub-style Activity Calendar Heatmap reflecting how productive the user was over the past 90 days.
    - Computes **Current Streak** and **Best Streak**.

4. **Reward Gallery**:
    - A visual gallery showcasing unlocked badges at 10, 30, and 50 days of consecutive streaks.

5. **Missed Task Reflection**:
    - Automatically detects if the user missed tasks from the previous day upon app launch.
    - Presents a clean reflection modal asking what held them back, encouraging mindfulness and consistency.

6. **Smart Notifications**:
    - `expo-notifications` integration schedules repeating alerts natively every 3 hours when a task is tracked but not completed.

7. **Dynamic Aesthetic Theme Toggle**:
    - Users can toggle between `Light Mode`, `Dark Mode`, and `System` settings using the toggle button on the top right of the main Tasks screen.
    - All screens and components are deeply integrated with a custom `useAppTheme` hook that ensures lightning-fast color palette swaps across the application.

### Technical & Aesthetic Polish
- **Stack**: React Native Expo Router, Zustand (AsyncStorage persistence), Firebase SDK.
- **Design System**: Built around Inter fonts (`@expo-google-fonts/inter`), soft muted color palettes (slate, pastel blues), and minimalistic borders.
- **Micro-Animations**: Uses `react-native-reanimated` (`Animated.createAnimatedComponent`) for buttery-smooth SVG completion rings, checkbox toggles, and UI interactions.


