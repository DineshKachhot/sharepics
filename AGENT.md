# Project Sharepic

## Overview
Sharepic is a React Native mobile application built with Expo explicitly targeting iOS initially (though it can run on Android as well). The app focuses on private photo sharing and album management.

## Tech Stack
- **Framework**: React Native (0.83.4) powered by Expo
- **Routing**: Expo Router (`app/` directory)
- **State Management**: Zustand (`store/`)
- **Data Fetching/Caching**: TanStack React Query (`@tanstack/react-query`)
- **Backend/Auth**: Supabase (`@supabase/supabase-js`)
- **Image Hosting**: ImageKit.io (`imagekit-javascript`)
- **Styling**: React Native Unistyles (`react-native-unistyles`)
- **Animations**: Reanimated (`react-native-reanimated`)
- **Native Modules**: React Native Nitro Modules (`react-native-nitro-modules`)

## Folder Structure
- `app/`: Expo Router file-based routing.
    - `(auth)/`: Authentication screens (login, etc.).
    - `album/`: Album management screens (e.g., `[id].tsx` for viewing an album).
    - `_layout.tsx`: Root layout with auth guards and providers.
- `components/`: Reusable UI components.
- `hooks/`: Custom React hooks.
- `store/`: Zustand global state definitions.
- `services/`: API and business logic interactions (e.g., `auth.service.ts`).
- `supabase/`: Supabase configuration and edge functions (locally tracked).
- `utils/`: Utility functions and third-party setups.
    - `supabase.ts`: Supabase client initialization.
    - `imagekit.ts`: ImageKit initialization and signed upload logic.
- `assets/`: Images, fonts, and static assets.
- Root files (`unistyles.ts`, `theme.ts`, `breakpoints.ts`): Styling configurations for `react-native-unistyles`.

## Image Management (ImageKit)
- **Authentication**: Uses ImageKit V2 API. Tokens are generated via a Supabase Edge Function (`imagekit-auth`) to ensure secure uploads from the client.
- **Uploads**: Files are uploaded using native `fetch` with `FormData` in `utils/imagekit.ts`.
- **Transformations**: Use `imagekit-javascript` for generating optimized and transformed image URLs.

## Agent Instructions (Token Saving Guidelines)
When assisting with this codebase, abide by the following:
1. **Routing**: Always use `expo-router` for navigation.
2. **Styling**: Do not use `StyleSheet.create` or inline styles. Exclusively use `react-native-unistyles`.
3. **State**: Use Zustand for global state and TanStack React Query for async/server state.
4. **Auth**: Authentication is handled via Supabase. Route protection logic exists in `app/_layout.tsx`.
5. **Image Uploads**: Always use the `uploadFileToImageKit` utility in `utils/imagekit.ts` which handles the secure Edge Function handshake.
6. **Commands**: 
   - iOS: `yarn ios`
   - Android: `yarn android`
   - Web: `yarn web`

## Environment Variables
Required variables in `.env`:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_IMAGEKIT_URL_ENDPOINT`
- `EXPO_PUBLIC_IMAGEKIT_PUBLIC_KEY`

## Linting and Formatting
- Format code using `yarn format` before concluding major implementation shifts.
- Rely on Prettier and ESLint (configured for Expo).
