# Sharepic 📸

Sharepic is a high-performance React Native mobile application built with Expo, designed for private photo sharing and seamless album management.

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18+)
- **Yarn** (v4.13.0+)
- **Expo CLI** (`npm install -g expo-cli`)
- **Supabase CLI** (`brew install supabase/tap/supabase`)

### Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd sharepic
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

3. Configure Environment Variables:
   Create a `.env` file in the root directory and add the following:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   EXPO_PUBLIC_IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint
   EXPO_PUBLIC_IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
   ```

4. Run the application:
   ```bash
   # iOS
   yarn ios
   
   # Android
   yarn android
   ```

---

## 🛠 Tech Stack

- **Framework**: [Expo](https://expo.dev/) (React Native 0.83.4)
- **Routing**: [Expo Router](https://docs.expo.dev/router/introduction/) (File-based routing)
- **Database & Auth**: [Supabase](https://supabase.com/)
- **Image CDN**: [ImageKit.io](https://imagekit.io/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Data Fetching**: [TanStack React Query](https://tanstack.com/query/latest)
- **Styling**: [React Native Unistyles](https://reactnativeunistyles.vercel.app/)
- **Animations**: [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)
- **List Performance**: [@shopify/flash-list](https://shopify.github.io/flash-list/) & [@legendapp/list](https://legendapp.com/open-source/list/)

---

## 🔄 Core Flows

### 1. Authentication Flow
- **Registration/Login**: Users can sign up or log in via Supabase Auth (`app/(auth)/login.tsx`, `register.tsx`).
- **Auth Guard**: A root-level navigation guard in `app/_layout.tsx` ensures only authenticated users can access the main feed and albums.
- **Session Management**: Handled via `services/auth.service.ts` and synced with Zustand state.

### 2. Album Management Flow
- **Dashboard**: The main feed (`app/index.tsx`) displays all accessible photo albums.
- **Album Details**: Clicking an album opens `app/album/[id].tsx`, showing a high-performance grid of images.
- **Image Upload**: Images are picked using `expo-image-picker` and uploaded directly to ImageKit using a secure handshake with Supabase Edge Functions.
- **Image Preview**: Full-screen image viewing with smooth transitions using `ImageModal.tsx`.

### 3. Secure Image Management
- **Auth Handshake**: Client requests a secure JWT from the `imagekit-auth` Edge Function before uploading.
- **Deletion**: When an image is removed, the `imagekit-delete` Edge Function is triggered to purge the file from ImageKit storage.

---

## 🏗 Database Setup

To initialize the database schema, run the following SQL script in your Supabase SQL Editor:

1. Copy the contents of `supabase_schema.sql`.
2. Paste it into the **SQL Editor** in your Supabase Dashboard.
3. Run the script to create the `albums` and `images` tables with Row Level Security (RLS) policies.

Alternatively, if you have the Supabase CLI configured locally:
```bash
supabase db push
```

---

## 📁 Project Structure

```text
├── app/               # Expo Router file-based routes
│   ├── (auth)/        # Authentication screens
│   ├── album/         # Album detail views
│   └── _layout.tsx    # Root layout & Navigation Guard
├── components/        # Shared UI components
├── services/          # API & Business logic (Auth, Supabase)
├── store/             # Zustand state management
├── supabase/          # Edge Functions & CLI config
├── utils/             # Utility functions (ImageKit, Supabase clients)
├── theme.ts           # Design tokens (Unistyles)
└── AGENT.md           # Documentation for AI assistants
```

---

## ⚡ Supabase Edge Functions

The project uses Supabase Edge Functions to securely interact with the ImageKit Admin API.

### Required Secrets
Before deploying, ensure the following secrets are set in your Supabase project:
```bash
supabase secrets set IMAGEKIT_PRIVATE_KEY=your_private_key
supabase secrets set IMAGEKIT_PUBLIC_KEY=your_public_key
```

### Deployment Commands
To deploy or update the Edge Functions, run:

```bash
# Deploy all functions
supabase functions deploy

# Deploy specific functions
supabase functions deploy imagekit-auth
supabase functions deploy imagekit-delete
```

---

## 🧼 Maintenance Commands

- **Format Code**: `yarn format` (Runs ESLint and Prettier)
- **Lint Code**: `yarn lint`
- **Clean Expo Cache**: `npx expo start -c`
- **Native Rebuild (iOS)**: `yarn ios`
- **Native Rebuild (Android)**: `yarn android`
