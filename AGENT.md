# Project Sharepic

## Overview
Sharepic is a React Native mobile application built with Expo explicitly targeting iOS initially (though it can run on Android as well).

## Tech Stack
- **Framework**: React Native (0.83.4) powered by Expo
- **Routing**: Expo Router (`app/` directory)
- **State Management**: Zustand (`store/`)
- **Data Fetching/Caching**: TanStack React Query (`@tanstack/react-query`)
- **Backend/Auth**: Supabase (`@supabase/supabase-js`)
- **Styling**: React Native Unistyles (`react-native-unistyles`)
- **Animations**: Reanimated (`react-native-reanimated`)
- **Native Modules**: React Native Nitro Modules (`react-native-nitro-modules`)

## Folder Structure
- `app/`: Contains the Expo Router file-based routing. Includes an `(auth)` group for authentication screens and `_layout.tsx` for route guards.
- `components/`: Reusable UI components.
- `hooks/`: Custom React hooks.
- `store/`: Zustand global state definitions (e.g., `store.ts`).
- `services/`: API and business logic interactions (e.g., `auth.service.ts`).
- `utils/`: Utility functions and third-party setups like `supabase.ts`.
- `assets/`: Images, fonts, and static assets.
- Root files (`unistyles.ts`, `theme.ts`, `breakpoints.ts`): Styling configurations for `react-native-unistyles`.

## Agent Instructions (Token Saving Guidelines)
When assisting with this codebase, abide by the following:
1. **Routing**: Always use `expo-router` for navigation. Do not install or invoke `@react-navigation/native` directly unless specifically extending linking.
2. **Styling**: Do not use `StyleSheet.create` or inline styles. Exclusively use `react-native-unistyles` referencing the defined theme in `theme.ts` and breakpoints in `breakpoints.ts`.
3. **State**: Use Zustand for global state and contexts, avoiding Redux or generic Context API when Zustand suffices. Use TanStack React Query for async state/server state.
4. **Auth**: Authentication should be handled via the Supabase client initialized in `utils/supabase.ts` and invoked via `services/auth.service.ts`. The route protection logic exists in `app/_layout.tsx`.
5. **Commands**: 
   - iOS: `yarn ios` or `npx expo run:ios`
   - Android: `yarn android` or `npx expo run:android`
   - Web: `yarn web`

## Linting and Formatting
- Format code using `yarn format` BEFORE concluding major implementation shifts.
- Rely on Prettier and ESLint configured in the repository.
