# TimiTime - Task Management for Busy People ⏰

A mobile application designed to help users with limited free time maximize their productivity by matching available time slots with suitable tasks.

## Features

- 🔐 **Secure Authentication**: Email/password login with Supabase Auth
- ✅ **Task Management**: Create, view, update, and complete tasks
- ⏱️ **Smart Time Filtering**: Find tasks that fit your available time ("I have 15 minutes free")
- 📅 **Task Organization**: Sort tasks by due date with flexibility indicators
- 🎨 **Beautiful UI**: Clean, intuitive interface with dark mode support
- 🔄 **Real-time Sync**: Powered by Supabase for instant updates

## Task Properties

Each task includes:
- **Title**: What needs to be done
- **Duration**: How long it takes (in minutes)
- **Due Date**: When it needs to be completed
- **Flexibility**: Priority level (low, medium, high)
- **Completion Status**: Track progress

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- A Supabase account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/8TRobi8/TimiTime.git
   cd TimiTime
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   
   Follow the detailed instructions in [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) to:
   - Create your Supabase project
   - Set up the database schema
   - Configure authentication
   - Get your API keys

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Supabase credentials:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

5. **Start the development server**
   ```bash
   npm start
   ```

   You can then:
   - Press `i` to open iOS simulator
   - Press `a` to open Android emulator
   - Scan the QR code with Expo Go app on your phone

## Project Structure

```
TimiTime/
├── app/                      # Expo Router screens
│   ├── (tabs)/              # Tab navigation screens
│   │   ├── index.tsx        # Tasks screen
│   │   ├── calendar.tsx     # Calendar (coming soon)
│   │   └── settings.tsx     # Settings & logout
│   ├── _layout.tsx          # Root layout with auth routing
│   └── login.tsx            # Authentication screen
├── lib/                     # Core services
│   ├── supabase.ts          # Supabase client config
│   ├── task-service.ts      # Task CRUD operations
│   └── types.ts             # TypeScript definitions
├── contexts/                # React contexts
│   └── auth-context.tsx     # Authentication state
├── components/              # Reusable UI components
├── constants/               # Theme and styling
└── SUPABASE_SETUP.md       # Database setup guide
```

## Usage

### Creating a Task

1. Tap the **"+ Add"** button in the Tasks tab
2. Fill in the task details:
   - Title (e.g., "Review pull requests")
   - Duration in minutes (e.g., 20)
   - Due date (YYYY-MM-DD format)
   - Flexibility level (low/medium/high)
3. Tap **"Create"**

### Finding Tasks by Available Time

1. Tap the **"🔍 Find Tasks"** button
2. Enter how many minutes you have available
3. Or use quick filters: 5, 10, 15, 30, or 60 minutes
4. See all tasks that fit within that time, sorted by due date

### Completing Tasks

- Simply tap any task to toggle its completion status
- Completed tasks appear with a strikethrough and reduced opacity

## Technology Stack

- **Framework**: [Expo](https://expo.dev) with React Native
- **Language**: TypeScript
- **Backend**: [Supabase](https://supabase.com) (Auth, Database, Storage)
- **Navigation**: Expo Router with file-based routing
- **UI**: React Native components with custom theming
- **State Management**: React Context API

## Workflows

This project is configured to use [EAS Workflows](https://docs.expo.dev/eas/workflows/get-started/) to automate some development and release processes. These commands are set up in [`package.json`](./package.json) and can be run using NPM scripts in your terminal.

### Previews

Run `npm run draft` to [publish a preview update](https://docs.expo.dev/eas/workflows/examples/publish-preview-update/) of your project, which can be viewed in Expo Go or in a development build.

### Development Builds

Run `npm run development-builds` to [create a development build](https://docs.expo.dev/eas/workflows/examples/create-development-builds/). Note - you'll need to follow the [Prerequisites](https://docs.expo.dev/eas/workflows/examples/create-development-builds/#prerequisites) to ensure you have the correct emulator setup on your machine.

### Production Deployments

Run `npm run deploy` to [deploy to production](https://docs.expo.dev/eas/workflows/examples/deploy-to-production/). Note - you'll need to follow the [Prerequisites](https://docs.expo.dev/eas/workflows/examples/deploy-to-production/#prerequisites) to ensure you're set up to submit to the Apple and Google stores.

## Hosting

Expo offers hosting for websites and API functions via EAS Hosting. See the [Getting Started](https://docs.expo.dev/eas/hosting/get-started/) guide to learn more.


## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
